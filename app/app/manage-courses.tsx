import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, radius, hairline } from '../src/theme';
import { listCourses, createCourse, Course, Program } from '../src/lib/db';

const PROGRAMS: Program[] = ['B.Tech CSE', 'B.Tech CSE & AI', 'BCA'];

export default function ManageCourses() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const [courses_, setCourses] = useState<Course[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCredits, setNewCredits] = useState('4');
  const [newSemester, setNewSemester] = useState('1');
  const [newProgram, setNewProgram] = useState<Program>('B.Tech CSE');

  useEffect(() => { listCourses().then(setCourses); }, []);

  const handleCreate = async () => {
    const c = await createCourse({
      code: newCode, name: newName, credits: parseInt(newCredits),
      semester: parseInt(newSemester), program: newProgram,
    });
    setCourses(prev => [...prev, c]);
    setShowCreate(false);
    setNewCode(''); setNewName('');
  };

  const grouped = PROGRAMS.map(p => ({ program: p, courses: courses_.filter(c => c.program === p) }));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Courses</Text>
        <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreate(true)} activeOpacity={0.7}>
          <Text style={styles.createBtnText}>+ New Course</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {grouped.map(g => (
          <View key={g.program}>
            <Text style={styles.sectionTitle}>{g.program}</Text>
            {g.courses.length === 0 ? (
              <Text style={styles.emptyText}>No courses yet</Text>
            ) : (
              <View style={[styles.grid, isWide && styles.gridWide]}>
                {g.courses.map(c => (
                  <TouchableOpacity key={c.id} style={styles.courseCard} activeOpacity={0.7}>
                    <View style={styles.courseTop}>
                      <Text style={styles.courseCode}>{c.code}</Text>
                      <Text style={styles.courseCredits}>{c.credits} cr</Text>
                    </View>
                    <Text style={styles.courseName}>{c.name}</Text>
                    <Text style={styles.courseMeta}>Semester {c.semester}</Text>
                    {c.teacherId && <Text style={styles.courseTeacher}>Teacher assigned ✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <Modal visible={showCreate} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Create Course</Text>
            <Text style={styles.label}>Course Code</Text>
            <TextInput style={styles.input} value={newCode} onChangeText={setNewCode} placeholder="CS301" placeholderTextColor={colors.ink300} />
            <Text style={styles.label}>Course Name</Text>
            <TextInput style={styles.input} value={newName} onChangeText={setNewName} placeholder="Data Structures" placeholderTextColor={colors.ink300} />
            <Text style={styles.label}>Program</Text>
            <View style={styles.programRow}>
              {PROGRAMS.map(p => (
                <TouchableOpacity key={p} style={[styles.programChip, newProgram === p && styles.programChipActive]} onPress={() => setNewProgram(p)}>
                  <Text style={[styles.programChipText, newProgram === p && styles.programChipTextActive]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Semester</Text>
                <TextInput style={styles.input} value={newSemester} onChangeText={setNewSemester} keyboardType="number-pad" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Credits</Text>
                <TextInput style={styles.input} value={newCredits} onChangeText={setNewCredits} keyboardType="number-pad" />
              </View>
            </View>
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
  courseCard: {
    backgroundColor: '#fff', borderRadius: radius.md, borderWidth: hairline, borderColor: colors.border,
    padding: spacing.md, flexBasis: '48%', flexGrow: 1, minWidth: 240,
  },
  courseTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  courseCode: { fontFamily: fonts.mono, fontSize: 13, color: colors.blue600 },
  courseCredits: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500 },
  courseName: { fontFamily: fonts.sansMedium, fontSize: 15, color: colors.ink900 },
  courseMeta: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginTop: 2 },
  courseTeacher: { fontFamily: fonts.sans, fontSize: 12, color: '#1B8F5A', marginTop: 4 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: '#fff', borderRadius: radius.lg, padding: spacing.lg, width: '90%', maxWidth: 480 },
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
