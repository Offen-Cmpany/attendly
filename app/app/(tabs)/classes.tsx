import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { colors, fonts, spacing, radius, hairline } from '../../src/theme';
import { useAuth } from '../../src/lib/auth';
import { listCourseDurations, CourseDuration } from '../../src/lib/db';
import { Card, Eyebrow } from '../../src/components/atoms';

export default function ClassesTab() {
  const { user, role } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [classes, setClasses] = useState<CourseDuration[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user?.id || role !== 'teacher') return;
    try {
      setLoading(true);
      const myClasses = await listCourseDurations({ facultyId: user.id });
      setClasses(myClasses);
    } catch (err) {
      console.error('Failed to load classes:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, role]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Group classes by subject code
  const groupedClasses: Record<string, { name: string, durations: CourseDuration[] }> = {};
  classes.forEach(c => {
    if (!groupedClasses[c.courseCode]) {
      groupedClasses[c.courseCode] = { name: c.courseName, durations: [] };
    }
    groupedClasses[c.courseCode].durations.push(c);
  });

  if (role !== 'teacher') {
    return (
      <View style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontFamily: fonts.sans, color: colors.ink500 }}>Only faculty can access this tab.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, isDesktop && { maxWidth: 720, alignSelf: 'center' as const, width: '100%', paddingHorizontal: 32 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>My Subjects</Text>
          <Text style={styles.subtitle}>Manage attendance and marks for your assigned batches.</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.blue600} style={{ marginVertical: spacing.xxl }} />
        ) : classes.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>You are not assigned to any subjects yet.</Text>
          </Card>
        ) : (
          Object.entries(groupedClasses).map(([code, subject]) => (
            <View key={code} style={styles.subjectContainer}>
              <View style={styles.subjectHeader}>
                <View style={styles.subjectIcon}>
                  <Text style={styles.subjectIconText}>{code.replace(/,/g, '')}</Text>
                </View>
                <Text style={styles.subjectName}>{subject.name}</Text>
              </View>

              <Card style={{ padding: 0, overflow: 'hidden' }}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.thText, { flex: 2 }]}>Batch</Text>
                  <Text style={[styles.thText, { width: 60, textAlign: 'center' }]}>Sem</Text>
                  <Text style={[styles.thText, { width: 150, textAlign: 'right' }]}>Actions</Text>
                </View>
                
                {subject.durations.map((c, i) => (
                  <View key={c.id} style={[styles.tableRow, i === subject.durations.length - 1 && { borderBottomWidth: 0 }]}>
                    <View style={{ flex: 2 }}>
                      <Text style={styles.batchName}>{c.batchName || 'Unknown Batch'}</Text>
                    </View>
                    <Text style={styles.semesterText}>Sem {c.semester?.replace(/,/g, '')}</Text>
                    <View style={styles.actionsContainer}>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => router.push(`/manage-marks/${c.id}` as any)}>
                        <Text style={styles.actionBtnText}>Marks</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]} onPress={() => router.push(`/mark/${c.id}` as any)}>
                        <Text style={styles.actionBtnPrimaryText}>Att →</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </Card>
            </View>
          ))
        )}
        
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceAlt },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md },
  
  header: { marginBottom: spacing.lg, marginTop: spacing.sm },
  title: { fontFamily: fonts.displayBold, fontSize: 28, color: colors.ink900 },
  subtitle: { fontFamily: fonts.sans, fontSize: 14, color: colors.ink500, marginTop: 4 },

  subjectContainer: { marginBottom: spacing.xl },
  subjectHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  subjectIcon: { backgroundColor: colors.blue50, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm, marginRight: spacing.sm, borderWidth: hairline, borderColor: colors.blue200 },
  subjectIconText: { fontFamily: fonts.monoMedium, fontSize: 12, color: colors.blue600 },
  subjectName: { fontFamily: fonts.sansMedium, fontSize: 16, color: colors.ink900, flex: 1 },

  tableHeader: { flexDirection: 'row', backgroundColor: colors.surfaceAlt, paddingHorizontal: spacing.md, paddingVertical: 10, borderBottomWidth: hairline, borderColor: colors.border },
  thText: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.ink500, textTransform: 'uppercase' },
  
  tableRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: hairline, borderColor: colors.border },
  batchName: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink900 },
  semesterText: { width: 60, fontFamily: fonts.mono, fontSize: 13, color: colors.ink500, textAlign: 'center' },
  
  actionsContainer: { width: 150, flexDirection: 'row', gap: spacing.sm, justifyContent: 'flex-end' },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt, borderWidth: hairline, borderColor: colors.border },
  actionBtnText: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.ink700 },
  actionBtnPrimary: { backgroundColor: colors.blue600, borderColor: colors.blue600 },
  actionBtnPrimaryText: { fontFamily: fonts.sansMedium, fontSize: 12, color: '#fff' },

  emptyCard: { padding: spacing.xl, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontFamily: fonts.sans, fontSize: 14, color: colors.ink500, textAlign: 'center' },
});
