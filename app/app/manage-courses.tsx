import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, radius, hairline } from '../src/theme';
import { listCourseDurations, createCourseDuration, deleteCourseDuration, listBatches, listProfiles, CourseDuration, Batch, Profile } from '../src/lib/db';

export default function ManageClasses() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const [classes, setClasses] = useState<CourseDuration[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newSemester, setNewSemester] = useState('6');
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      listCourseDurations(),
      listBatches(),
      listProfiles({ role: 'teacher' })
    ]).then(([cd, b, t]) => {
      setClasses(cd);
      setBatches(b);
      setTeachers(t);
      setLoading(false);
    });
  }, []);

  const handleCreate = async () => {
    if (!newCode || !newName || !selectedBatch || !selectedTeacher || !newSemester) {
      Alert.alert('Missing fields', 'Please fill out all fields.');
      return;
    }
    setSaving(true);
    try {
      const c = await createCourseDuration({
        courseCode: newCode.toUpperCase(),
        courseName: newName,
        semester: newSemester,
        batchId: selectedBatch,
        facultyId: selectedTeacher,
      });
      setClasses(prev => [c, ...prev]);
      setShowCreate(false);
      setNewCode(''); setNewName(''); setSelectedBatch(null); setSelectedTeacher(null);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to assign class.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCourseDuration(id);
      setClasses(prev => prev.filter(c => c.id !== id));
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to delete assignment.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Class Assignments</Text>
        <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreate(true)} activeOpacity={0.7}>
          <Text style={styles.createBtnText}>+ Assign Class</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Active Assignments</Text>
        {loading ? (
          <ActivityIndicator color={colors.blue600} style={{ marginTop: spacing.xl }} />
        ) : classes.length === 0 ? (
          <Text style={styles.emptyText}>No classes have been assigned to faculty yet.</Text>
        ) : (
          <View style={[styles.grid, isWide && styles.gridWide]}>
            {classes.map(c => (
              <View key={c.id} style={styles.courseCard}>
                <View style={styles.courseTop}>
                  <Text style={styles.courseCode}>{c.courseCode}</Text>
                  <TouchableOpacity onPress={() => handleDelete(c.id)}>
                    <Text style={{ color: colors.coral600, fontSize: 12, fontFamily: fonts.sansMedium }}>Remove</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.courseName}>{c.courseName}</Text>
                
                <View style={{ marginTop: spacing.md, gap: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontSize: 12 }}>👨‍🏫</Text>
                    <Text style={styles.courseTeacher}>{c.facultyName || 'Unknown Faculty'}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontSize: 12 }}>👥</Text>
                    <Text style={styles.courseMeta}>{c.batchName || 'Unknown Batch'} (S{c.semester})</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Create Modal */}
      <Modal visible={showCreate} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, isWide && { width: 500 }]}>
            <Text style={styles.modalTitle}>Assign Faculty to Class</Text>
            
            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Course Details</Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <TextInput style={[styles.input, { flex: 1 }]} value={newCode} onChangeText={setNewCode} placeholder="Course Code (e.g. CS301)" placeholderTextColor={colors.ink300} />
                <TextInput style={[styles.input, { width: 80 }]} value={newSemester} onChangeText={setNewSemester} placeholder="Sem" keyboardType="number-pad" />
              </View>
              <TextInput style={[styles.input, { marginTop: spacing.sm }]} value={newName} onChangeText={setNewName} placeholder="Course Name (e.g. Data Structures)" placeholderTextColor={colors.ink300} />

              <Text style={[styles.label, { marginTop: spacing.lg }]}>Select Faculty</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
                {teachers.map(t => (
                  <TouchableOpacity 
                    key={t.id} 
                    style={[styles.selectChip, selectedTeacher === t.id && styles.selectChipActive]} 
                    onPress={() => setSelectedTeacher(t.id)}
                  >
                    <Text style={[styles.selectChipText, selectedTeacher === t.id && styles.selectChipTextActive]}>{t.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.label, { marginTop: spacing.lg }]}>Select Batch</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {batches.map(b => (
                  <TouchableOpacity 
                    key={b.id} 
                    style={[styles.selectChip, selectedBatch === b.id && styles.selectChipActive]} 
                    onPress={() => setSelectedBatch(b.id)}
                  >
                    <Text style={[styles.selectChipText, selectedBatch === b.id && styles.selectChipTextActive]}>{b.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCreate(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleCreate} disabled={saving}>
                <Text style={styles.confirmBtnText}>{saving ? 'Assigning...' : 'Assign Class'}</Text>
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
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xxl },
  sectionTitle: { fontFamily: fonts.sansMedium, fontSize: 16, color: colors.ink900, marginBottom: spacing.sm },
  emptyText: { fontFamily: fonts.sans, fontSize: 13, color: colors.ink500, marginBottom: spacing.md },
  grid: { gap: spacing.sm, marginBottom: spacing.md },
  gridWide: { flexDirection: 'row', flexWrap: 'wrap' },
  courseCard: {
    backgroundColor: '#fff', borderRadius: radius.md, borderWidth: hairline, borderColor: colors.border,
    padding: spacing.md, flexBasis: '48%', flexGrow: 1, minWidth: 280,
  },
  courseTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  courseCode: { fontFamily: fonts.monoMedium, fontSize: 13, color: colors.blue600 },
  courseName: { fontFamily: fonts.sansMedium, fontSize: 16, color: colors.ink900 },
  courseMeta: { fontFamily: fonts.sans, fontSize: 13, color: colors.ink500 },
  courseTeacher: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink700 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end', alignItems: 'center' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.lg, width: '100%', paddingBottom: spacing.xxl },
  modalTitle: { fontFamily: fonts.display, fontSize: 20, color: colors.ink900, marginBottom: spacing.sm },
  label: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink900, marginBottom: 8, marginTop: spacing.xs },
  input: {
    height: 44, paddingHorizontal: 12, borderWidth: hairline, borderColor: colors.border,
    borderRadius: radius.sm, backgroundColor: '#f9f9f9', fontFamily: fonts.sans, fontSize: 14, color: colors.ink900,
  },
  
  selectChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.sm, backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: 'transparent' },
  selectChipActive: { backgroundColor: '#EBF2FB', borderColor: colors.blue600 },
  selectChipText: { fontFamily: fonts.sans, fontSize: 13, color: colors.ink700 },
  selectChipTextActive: { fontFamily: fonts.sansMedium, color: colors.blue600 },
  
  modalBtns: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  cancelBtnText: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink700 },
  confirmBtn: { flex: 1, paddingVertical: 14, borderRadius: radius.sm, backgroundColor: colors.blue600, alignItems: 'center' },
  confirmBtnText: { fontFamily: fonts.sansMedium, fontSize: 14, color: '#fff' },
});
