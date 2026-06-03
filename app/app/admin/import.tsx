import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, useWindowDimensions, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js';

import { colors, fonts, spacing, radius, hairline } from '../../src/theme';
import { Card, Button, Eyebrow, Chip } from '../../src/components/atoms';
import { listBatches, Batch, Program } from '../../src/lib/db';
import { supabase as defaultSupabase } from '../../src/lib/supabase';

// Use same fallback as supabase.ts
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://wgmewavrxupzoijcdwfr.supabase.co';

type ImportMode = 'students' | 'faculty';

export default function BulkImportScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [mode, setMode] = useState<ImportMode>('students');
  const [serviceKey, setServiceKey] = useState('');
  const [csvData, setCsvData] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<{ msg: string; type: 'info' | 'error' | 'success' }[]>([]);
  
  const [batches, setBatches] = useState<Batch[]>([]);

  useEffect(() => {
    listBatches().then(setBatches);
  }, []);

  const addLog = (msg: string, type: 'info' | 'error' | 'success' = 'info') => {
    setLogs(prev => [...prev, { msg, type }]);
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/csv'],
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      setFileName(asset.name);
      setLogs([]); // clear logs

      if (Platform.OS === 'web' && asset.file) {
        Papa.parse(asset.file as any, {
          header: true,
          skipEmptyLines: true,
          complete: (res) => {
            setCsvData(res.data);
            addLog(`Loaded ${res.data.length} rows from ${asset.name}.`, 'info');
          }
        });
      } else {
        const text = await FileSystem.readAsStringAsync(asset.uri);
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (res) => {
            setCsvData(res.data);
            addLog(`Loaded ${res.data.length} rows from ${asset.name}.`, 'info');
          }
        });
      }
    } catch (err: any) {
      addLog(`Failed to read file: ${err.message}`, 'error');
    }
  };

  const startImport = async () => {
    if (!serviceKey) return addLog('Please enter the Service Role Key.', 'error');
    if (csvData.length === 0) return addLog('No CSV data loaded.', 'error');

    setIsProcessing(true);
    addLog(`Starting import of ${csvData.length} users...`, 'info');

    // Create a temporary admin client
    const adminSupabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      try {
        const email = row.Email?.trim();
        const name = row.Name?.trim();
        
        if (!email || !name) {
          addLog(`Row ${i + 1}: Missing Email or Name. Skipping.`, 'error');
          errorCount++;
          continue;
        }

        // 1. Create user in auth.users
        const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
          email: email,
          password: 'Welcome123!',
          email_confirm: true,
          user_metadata: { role: mode }
        });

        if (authError) {
          // If user already exists, it throws an error. We can try to fetch them and update profile,
          // but for safety let's just log the error.
          if (authError.message.includes('already exists')) {
            addLog(`Row ${i + 1}: User ${email} already exists.`, 'info');
            // Could optionally update existing profile here, but skipping for safety
          } else {
            addLog(`Row ${i + 1}: Auth Error - ${authError.message}`, 'error');
            errorCount++;
          }
          continue;
        }

        const userId = authData.user.id;

        // 2. Prepare Profile Data
        const profileData: any = {
          id: userId,
          name: name,
          email: email,
          role: mode === 'faculty' ? 'teacher' : 'student',
        };

        if (mode === 'students') {
          profileData.reg = row.RegNo?.trim();
          profileData.program = row.Program?.trim();
          profileData.semester = row.Semester ? parseInt(row.Semester.toString().trim()) : null;
          
          // Try to map batch name to batch ID
          const batchStr = row.Batch?.trim();
          if (batchStr) {
            const foundBatch = batches.find(b => b.name === batchStr);
            if (foundBatch) {
              profileData.batch_id = foundBatch.id;
            } else {
              addLog(`Row ${i + 1}: Warning - Batch '${batchStr}' not found in database.`, 'error');
            }
          }
        } else {
          // Faculty
          profileData.dept = row.Department?.trim();
        }

        // 3. Upsert Profile (bypass RLS using service key)
        const { error: profileError } = await adminSupabase.from('profiles').upsert(profileData);
        
        if (profileError) {
          addLog(`Row ${i + 1}: Profile Error - ${profileError.message}`, 'error');
          errorCount++;
        } else {
          addLog(`Row ${i + 1}: Created ${email}`, 'success');
          successCount++;
        }

      } catch (err: any) {
        addLog(`Row ${i + 1}: Unexpected error - ${err.message}`, 'error');
        errorCount++;
      }
    }

    addLog(`Import complete. Created ${successCount} users. ${errorCount} errors.`, successCount > 0 ? 'success' : 'info');
    setIsProcessing(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CSV Bulk Import</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={[styles.scrollContent, isDesktop && { maxWidth: 720, alignSelf: 'center', width: '100%', paddingHorizontal: 32 }]}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Step 1: Mode Selection */}
        <Card style={{ marginBottom: spacing.lg }}>
          <Eyebrow>1. Select Import Type</Eyebrow>
          <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.md }}>
            <TouchableOpacity 
              style={[styles.modeCard, mode === 'students' && styles.modeCardActive]}
              onPress={() => { setMode('students'); setCsvData([]); setFileName(''); setLogs([]); }}
            >
              <Text style={[styles.modeText, mode === 'students' && styles.modeTextActive]}>Students</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modeCard, mode === 'faculty' && styles.modeCardActive]}
              onPress={() => { setMode('faculty'); setCsvData([]); setFileName(''); setLogs([]); }}
            >
              <Text style={[styles.modeText, mode === 'faculty' && styles.modeTextActive]}>Faculty</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Step 2: Upload CSV */}
        <Card style={{ marginBottom: spacing.lg }}>
          <Eyebrow>2. Upload CSV File</Eyebrow>
          
          <View style={styles.formatBox}>
            <Text style={styles.formatTitle}>Required CSV Format:</Text>
            {mode === 'students' ? (
              <Text style={styles.formatCode}>Name, Email, RegNo, Program, Batch, Semester</Text>
            ) : (
              <Text style={styles.formatCode}>Name, Email, Department</Text>
            )}
            <Text style={styles.formatSub}>Note: Default password will be 'Welcome123!'</Text>
          </View>

          <Button 
            title={fileName ? `Change File (${fileName})` : "Select CSV File"} 
            onPress={handlePickFile} 
            variant={fileName ? "secondary" : "primary"}
            disabled={isProcessing}
          />
        </Card>

        {/* Step 3: Authorization & Import */}
        {csvData.length > 0 && (
          <Card style={{ marginBottom: spacing.xl }}>
            <Eyebrow>3. Authorize & Import</Eyebrow>
            <Text style={styles.authDesc}>Creating user accounts requires the Supabase Service Role Key. Paste it below to authorize this import.</Text>
            
            <TextInput
              style={styles.input}
              placeholder="eyJhbGciOiJIUzI1NiIsInR..."
              secureTextEntry
              value={serviceKey}
              onChangeText={setServiceKey}
              editable={!isProcessing}
            />

            <Button 
              title={isProcessing ? "Importing..." : `Start Import (${csvData.length} rows)`} 
              onPress={startImport}
              disabled={isProcessing || !serviceKey}
              style={{ marginTop: spacing.md }}
            />
          </Card>
        )}

        {/* Logs */}
        {logs.length > 0 && (
          <View style={styles.logsContainer}>
            <Text style={styles.logsTitle}>Import Logs</Text>
            <Card style={{ backgroundColor: '#1e1e1e', padding: spacing.md }}>
              {logs.map((log, i) => (
                <Text key={i} style={[
                  styles.logText,
                  log.type === 'error' && { color: colors.coral400 },
                  log.type === 'success' && { color: '#4ade80' }
                ]}>
                  {log.msg}
                </Text>
              ))}
            </Card>
          </View>
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceAlt },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md },
  
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.surface, borderBottomWidth: hairline, borderColor: colors.border, marginBottom: spacing.md },
  backBtn: { width: 60 },
  backText: { fontFamily: fonts.sansMedium, color: colors.blue600 },
  headerTitle: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.ink900 },

  modeCard: { flex: 1, padding: spacing.md, borderRadius: radius.md, borderWidth: hairline, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center' },
  modeCardActive: { backgroundColor: colors.blue600, borderColor: colors.blue600 },
  modeText: { fontFamily: fonts.sansMedium, color: colors.ink700 },
  modeTextActive: { color: '#fff' },

  formatBox: { backgroundColor: colors.surfaceAlt, padding: spacing.md, borderRadius: radius.sm, borderWidth: hairline, borderColor: colors.border, marginVertical: spacing.md },
  formatTitle: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink700, marginBottom: spacing.xs },
  formatCode: { fontFamily: fonts.mono, fontSize: 13, color: colors.blue800, padding: spacing.sm, backgroundColor: colors.blue50, borderRadius: radius.sm },
  formatSub: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginTop: spacing.sm },

  authDesc: { fontFamily: fonts.sans, fontSize: 13, color: colors.ink700, marginTop: spacing.sm, marginBottom: spacing.md },
  input: { borderWidth: hairline, borderColor: colors.border, borderRadius: radius.sm, padding: spacing.md, fontFamily: fonts.mono, fontSize: 13, color: colors.ink900, backgroundColor: colors.surfaceAlt },

  logsContainer: { marginBottom: spacing.xxl },
  logsTitle: { fontFamily: fonts.sansMedium, fontSize: 15, color: colors.ink900, marginBottom: spacing.sm },
  logText: { fontFamily: fonts.mono, fontSize: 11, color: '#a1a1aa', marginBottom: 4 },
});
