import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { colors, fonts, spacing, radius, hairline } from '../../src/theme';
import { Card, Button, Eyebrow, Chip } from '../../src/components/atoms';
import { listBatches, Batch, Program, listProfiles, updateProfile, Profile } from '../../src/lib/db';

const PROGRAMS: Program[] = ['B.Tech CSE', 'B.Tech CSE & AI', 'BCA'];

export default function ManageRosterScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Program>('B.Tech CSE');
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  
  const [studentsInBatch, setStudentsInBatch] = useState<Profile[]>([]);
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    listBatches().then(b => {
      setBatches(b);
      setLoading(false);
      // Auto-select first batch of program if available
      const progBatches = b.filter(batch => batch.program === selectedProgram);
      if (progBatches.length > 0) setSelectedBatch(progBatches[0].id);
    });
  }, []);

  // When program changes, reset batch selection
  useEffect(() => {
    const progBatches = batches.filter(batch => batch.program === selectedProgram);
    if (progBatches.length > 0) {
      setSelectedBatch(progBatches[0].id);
    } else {
      setSelectedBatch(null);
    }
  }, [selectedProgram]);

  // Load students for selected batch
  useEffect(() => {
    if (selectedBatch) {
      listProfiles({ role: 'student', batchId: selectedBatch }).then(setStudentsInBatch);
    } else {
      setStudentsInBatch([]);
    }
  }, [selectedBatch]);

  const handleRemoveStudent = (student: Profile) => {
    Alert.alert('Remove Student', `Remove ${student.name} from this batch?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        try {
          await updateProfile(student.id, { batchId: null as any }); // Unassign
          setStudentsInBatch(prev => prev.filter(s => s.id !== student.id));
        } catch (err: any) {
          Alert.alert('Error', err.message);
        }
      }}
    ]);
  };

  const handleSearchUnassigned = async () => {
    setSearching(true);
    try {
      // Find all students in this program (we can filter on client for unassigned/other batches)
      const allStudents = await listProfiles({ role: 'student', program: selectedProgram });
      const available = allStudents.filter(s => 
        s.batchId !== selectedBatch && // Not already in this batch
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(available.slice(0, 20)); // Limit to 20 for UI perf
    } catch (err: any) {
      Alert.alert('Error', 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleAddStudent = async (student: Profile) => {
    if (!selectedBatch) return;
    setSaving(true);
    try {
      const updated = await updateProfile(student.id, { batchId: selectedBatch });
      if (updated) {
        setStudentsInBatch(prev => [...prev, updated].sort((a, b) => a.name.localeCompare(b.name)));
        setSearchResults(prev => prev.filter(s => s.id !== student.id));
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const currentBatches = batches.filter(b => b.program === selectedProgram);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Rosters</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={[styles.scrollContent, isDesktop && { maxWidth: 720, alignSelf: 'center', width: '100%', paddingHorizontal: 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator color={colors.blue600} style={{ marginVertical: spacing.xxl }} />
        ) : (
          <>
            {/* Filter Controls */}
            <Card style={{ marginBottom: spacing.lg }}>
              <Eyebrow>1. Select Program</Eyebrow>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, marginTop: spacing.sm, paddingBottom: spacing.sm }}>
                {PROGRAMS.map(p => (
                  <TouchableOpacity 
                    key={p} 
                    style={[styles.pill, selectedProgram === p && styles.pillActive]}
                    onPress={() => setSelectedProgram(p)}
                  >
                    <Text style={[styles.pillText, selectedProgram === p && styles.pillTextActive]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.divider} />

              <Eyebrow>2. Select Batch</Eyebrow>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, marginTop: spacing.sm }}>
                {currentBatches.length === 0 ? (
                  <Text style={{ color: colors.ink500, fontFamily: fonts.sans, fontSize: 13 }}>No batches created for this program.</Text>
                ) : (
                  currentBatches.map(b => (
                    <TouchableOpacity 
                      key={b.id} 
                      style={[styles.pill, selectedBatch === b.id && styles.pillActive]}
                      onPress={() => setSelectedBatch(b.id)}
                    >
                      <Text style={[styles.pillText, selectedBatch === b.id && styles.pillTextActive]}>{b.name}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </Card>

            {/* Roster List */}
            {selectedBatch && (
              <Card style={{ padding: 0, overflow: 'hidden' }}>
                <View style={{ padding: spacing.md, borderBottomWidth: hairline, borderColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surfaceAlt }}>
                  <Eyebrow>{studentsInBatch.length} Students Assigned</Eyebrow>
                  <Button title="Add Student" size="sm" onPress={() => { setShowAddModal(true); handleSearchUnassigned(); }} />
                </View>

                {studentsInBatch.length === 0 ? (
                  <View style={{ padding: spacing.xl, alignItems: 'center' }}>
                    <Text style={{ color: colors.ink500, fontFamily: fonts.sans }}>No students in this batch yet.</Text>
                  </View>
                ) : (
                  studentsInBatch.map((s, i) => (
                    <View key={s.id} style={[styles.row, i < studentsInBatch.length - 1 && styles.rowBorder]}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.name}>{s.name}</Text>
                        <Text style={styles.reg}>{s.reg || s.email}</Text>
                      </View>
                      <TouchableOpacity onPress={() => handleRemoveStudent(s)} style={styles.removeBtn}>
                        <Text style={styles.removeText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </Card>
            )}
          </>
        )}
        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {/* Add Student Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="formSheet" onRequestClose={() => setShowAddModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.surfaceAlt }} edges={['top']}>
          <View style={[styles.headerBar, { backgroundColor: colors.surface }]}>
            <Text style={styles.headerTitle}>Add Student to Batch</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}><Text style={styles.backText}>Done</Text></TouchableOpacity>
          </View>
          
          <View style={{ padding: spacing.md, backgroundColor: colors.surface, borderBottomWidth: hairline, borderColor: colors.border }}>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <TextInput 
                style={styles.searchInput}
                placeholder="Search by name..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearchUnassigned}
                returnKeyType="search"
              />
              <Button title="Search" size="sm" onPress={handleSearchUnassigned} disabled={searching} />
            </View>
          </View>

          <ScrollView style={{ flex: 1 }}>
            {searching ? (
              <ActivityIndicator color={colors.blue600} style={{ marginVertical: spacing.xl }} />
            ) : searchResults.length === 0 ? (
              <Text style={{ textAlign: 'center', margin: spacing.xl, color: colors.ink500, fontFamily: fonts.sans }}>
                No unassigned students found for this program.
              </Text>
            ) : (
              searchResults.map(s => (
                <View key={s.id} style={[styles.row, { backgroundColor: '#fff', borderBottomWidth: hairline, borderColor: colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{s.name}</Text>
                    <Text style={styles.reg}>{s.reg || s.email} {s.batchId ? '(Change Batch)' : '(Unassigned)'}</Text>
                  </View>
                  <Button title={saving ? "..." : "Add"} size="sm" onPress={() => handleAddStudent(s)} disabled={saving} />
                </View>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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

  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt, borderWidth: hairline, borderColor: colors.border },
  pillActive: { backgroundColor: colors.ink900, borderColor: colors.ink900 },
  pillText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink700 },
  pillTextActive: { color: '#fff' },
  divider: { height: hairline, backgroundColor: colors.border, marginVertical: spacing.md },

  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, justifyContent: 'space-between' },
  rowBorder: { borderBottomWidth: hairline, borderColor: colors.border },
  name: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink900 },
  reg: { fontFamily: fonts.mono, fontSize: 11, color: colors.ink500, marginTop: 2 },
  
  removeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.sm, backgroundColor: colors.riskBg },
  removeText: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.riskFg },

  searchInput: { flex: 1, height: 36, backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, paddingHorizontal: spacing.sm, borderWidth: hairline, borderColor: colors.border, fontFamily: fonts.sans },
});
