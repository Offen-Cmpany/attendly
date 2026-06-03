import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, radius, hairline } from '../src/theme';
import { createModule } from '../src/lib/db';

const STATUSES = [
  { key: 'upcoming' as const, label: 'Upcoming' },
  { key: 'in_progress' as const, label: 'In Progress' },
  { key: 'completed' as const, label: 'Completed' },
];

export default function ModuleEdit() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'upcoming' | 'in_progress' | 'completed'>('upcoming');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert('Error', 'Module name is required');
    setSaving(true);
    try {
      await createModule({ courseId: 'c1', name: name.trim(), description: description.trim(), order: 99, status });
      router.back();
    } catch { Alert.alert('Error', 'Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Module</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.label}>Module Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Trees & Graphs" placeholderTextColor={colors.ink300} />
        <Text style={styles.label}>Description (optional)</Text>
        <TextInput style={[styles.input, { height: 80 }]} value={description} onChangeText={setDescription} placeholder="Brief description…" placeholderTextColor={colors.ink300} multiline />
        <Text style={styles.label}>Status</Text>
        <View style={styles.statusRow}>
          {STATUSES.map(s => (
            <TouchableOpacity key={s.key} style={[styles.statusChip, status === s.key && styles.statusChipActive]} onPress={() => setStatus(s.key)}>
              <Text style={[styles.statusText, status === s.key && styles.statusTextActive]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceAlt },
  headerBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.md, backgroundColor: '#fff', borderBottomWidth: hairline, borderBottomColor: colors.border,
  },
  backText: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.blue600 },
  headerTitle: { fontFamily: fonts.sansMedium, fontSize: 17, color: colors.ink900 },
  saveBtn: { backgroundColor: colors.blue600, paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.sm },
  saveBtnText: { fontFamily: fonts.sansMedium, fontSize: 13, color: '#fff' },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md },
  label: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginBottom: 6, marginTop: spacing.md },
  input: {
    paddingHorizontal: 12, paddingVertical: 10, borderWidth: hairline, borderColor: colors.border,
    borderRadius: radius.sm, backgroundColor: '#fff', fontFamily: fonts.sans, fontSize: 14, color: colors.ink900,
  },
  statusRow: { flexDirection: 'row', gap: spacing.sm },
  statusChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: '#fff' },
  statusChipActive: { borderColor: colors.blue600, backgroundColor: '#EBF2FB' },
  statusText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink500 },
  statusTextActive: { color: colors.blue600 },
});
