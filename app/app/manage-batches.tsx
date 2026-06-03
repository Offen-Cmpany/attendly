import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, radius, hairline } from '../src/theme';
import { listBatches, createBatch, Batch, Program } from '../src/lib/db';

const PROGRAMS: Program[] = ['B.Tech CSE', 'B.Tech CSE & AI', 'BCA'];

export default function ManageBatches() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const [batches, setBatches] = useState<Batch[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newProgram, setNewProgram] = useState<Program>('B.Tech CSE');
  const [newYear, setNewYear] = useState(new Date().getFullYear().toString());
  const [newSection, setNewSection] = useState('A');

  useEffect(() => { listBatches().then(setBatches); }, []);

  const handleCreate = async () => {
    const b = await createBatch({
      name: `${newProgram} ${newYear} ${newSection}`,
      program: newProgram, year: parseInt(newYear), section: newSection, department: 'CSE',
    });
    setBatches(prev => [...prev, b]);
    setShowCreate(false);
  };

  const grouped = PROGRAMS.map(p => ({ program: p, batches: batches.filter(b => b.program === p) }));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Batches</Text>
        <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreate(true)} activeOpacity={0.7}>
          <Text style={styles.createBtnText}>+ New Batch</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {grouped.map(g => (
          <View key={g.program}>
            <Text style={styles.sectionTitle}>{g.program}</Text>
            {g.batches.length === 0 ? (
              <Text style={styles.emptyText}>No batches yet</Text>
            ) : (
              <View style={[styles.grid, isWide && styles.gridWide]}>
                {g.batches.map(b => (
                  <TouchableOpacity key={b.id} style={styles.batchCard} onPress={() => router.push(`/manage-batch/${b.id}` as any)} activeOpacity={0.7}>
                    <Text style={styles.batchName}>{b.name}</Text>
                    <Text style={styles.batchMeta}>{b.year} · Section {b.section ?? '—'}</Text>
                    {b.advisorId && <Text style={styles.batchMeta}>Advisor assigned ✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Create Modal */}
      <Modal visible={showCreate} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Create Batch</Text>
            <Text style={styles.label}>Program</Text>
            <View style={styles.programRow}>
              {PROGRAMS.map(p => (
                <TouchableOpacity key={p} style={[styles.programChip, newProgram === p && styles.programChipActive]} onPress={() => setNewProgram(p)}>
                  <Text style={[styles.programChipText, newProgram === p && styles.programChipTextActive]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Year</Text>
            <TextInput style={styles.input} value={newYear} onChangeText={setNewYear} keyboardType="number-pad" />
            <Text style={styles.label}>Section</Text>
            <TextInput style={styles.input} value={newSection} onChangeText={setNewSection} placeholder="A" placeholderTextColor={colors.ink300} />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCreate(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleCreate}>
                <Text style={styles.confirmBtnText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceAlt },
  headerBar: { padding: spacing.md, backgroundColor: '#fff', borderBottomWidth: hairline, borderBottomColor: colors.border },
  backBtn: { marginBottom: spacing.sm },
  backText: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.blue600 },
  headerTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.ink900 },
  createBtn: { backgroundColor: colors.blue600, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.sm, marginTop: spacing.sm, alignSelf: 'flex-start' },
  createBtnText: { fontFamily: fonts.sansMedium, fontSize: 13, color: '#fff' },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md },
  sectionTitle: { fontFamily: fonts.sansMedium, fontSize: 16, color: colors.ink900, marginTop: spacing.md, marginBottom: spacing.sm },
  emptyText: { fontFamily: fonts.sans, fontSize: 13, color: colors.ink500, marginBottom: spacing.md },
  grid: { gap: spacing.sm, marginBottom: spacing.md },
  gridWide: { flexDirection: 'row', flexWrap: 'wrap' },
  batchCard: {
    backgroundColor: '#fff', borderRadius: radius.md, borderWidth: hairline, borderColor: colors.border,
    padding: spacing.md, flexBasis: '48%', flexGrow: 1, minWidth: 240,
  },
  batchName: { fontFamily: fonts.sansMedium, fontSize: 15, color: colors.ink900 },
  batchMeta: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginTop: 2 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: '#fff', borderRadius: radius.lg, padding: spacing.lg, width: '90%', maxWidth: 420 },
  modalTitle: { fontFamily: fonts.display, fontSize: 20, color: colors.ink900, marginBottom: spacing.md },
  label: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginBottom: 6, marginTop: spacing.sm },
  input: {
    height: 40, paddingHorizontal: 12, borderWidth: hairline, borderColor: colors.border,
    borderRadius: radius.sm, backgroundColor: colors.surfaceAlt, fontFamily: fonts.sans, fontSize: 14, color: colors.ink900,
  },
  programRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  programChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border },
  programChipActive: { borderColor: colors.blue600, backgroundColor: '#EBF2FB' },
  programChipText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink500 },
  programChipTextActive: { color: colors.blue600 },
  modalBtns: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  cancelBtnText: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink700 },
  confirmBtn: { flex: 1, paddingVertical: 12, borderRadius: radius.sm, backgroundColor: colors.blue600, alignItems: 'center' },
  confirmBtnText: { fontFamily: fonts.sansMedium, fontSize: 14, color: '#fff' },
});
