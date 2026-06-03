import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, fonts, spacing, radius, hairline } from '../../src/theme';
import { getCourse, listModules, listNotes, Course, Module, Note } from '../../src/lib/db';

type Tab = 'modules' | 'notes' | 'students' | 'forms';

export default function SubjectManage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules_, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('modules');

  useEffect(() => {
    (async () => {
      try {
        const c = await getCourse(id);
        setCourse(c);
        if (c) {
          const m = await listModules(c.id);
          setModules(m);
        }
      } catch {} finally { setLoading(false); }
    })();
  }, [id]);

  const statusColors: Record<string, { bg: string; fg: string }> = {
    completed: { bg: '#EAF3DE', fg: '#27500A' },
    in_progress: { bg: '#FAEEDA', fg: '#633806' },
    upcoming: { bg: '#F1EFE8', fg: '#444441' },
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.blue600} /></View>;
  if (!course) return <View style={styles.center}><Text style={styles.emptyText}>Course not found</Text></View>;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.courseCode}>{course.code}</Text>
          <Text style={styles.courseName}>{course.name}</Text>
          <Text style={styles.courseMeta}>{course.program} · Semester {course.semester} · {course.credits} credits</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {(['modules', 'notes', 'students', 'forms'] as Tab[]).map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {tab === 'modules' && (
          <>
            {modules_.map((m, i) => (
              <View key={m.id} style={styles.moduleCard}>
                <View style={styles.moduleOrder}>
                  <Text style={styles.moduleOrderText}>{m.order}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.moduleName}>{m.name}</Text>
                  {m.description && <Text style={styles.moduleDesc}>{m.description}</Text>}
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusColors[m.status]?.bg ?? '#F1EFE8' }]}>
                  <Text style={[styles.statusText, { color: statusColors[m.status]?.fg ?? '#444' }]}>
                    {m.status.replace('_', ' ')}
                  </Text>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/module-edit' as any)} activeOpacity={0.7}>
              <Text style={styles.addBtnText}>+ Add Module</Text>
            </TouchableOpacity>
          </>
        )}
        {tab === 'students' && (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 40 }}>🎓</Text>
            <Text style={styles.emptyText}>42 students enrolled</Text>
            <Text style={styles.emptyDesc}>Student attendance data will appear here</Text>
          </View>
        )}
        {tab === 'notes' && (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 40 }}>📝</Text>
            <Text style={styles.emptyText}>Notes & Resources</Text>
            <Text style={styles.emptyDesc}>Add notes for each module</Text>
          </View>
        )}
        {tab === 'forms' && (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 40 }}>📋</Text>
            <Text style={styles.emptyText}>Course Forms & Surveys</Text>
            <Text style={styles.emptyDesc}>No forms have been created yet</Text>
            <TouchableOpacity style={[styles.addBtn, { paddingHorizontal: 24, marginTop: 24 }]} onPress={() => router.push('/form-create' as any)} activeOpacity={0.7}>
              <Text style={styles.addBtnText}>+ Create Form</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceAlt },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { padding: spacing.md, backgroundColor: '#fff', borderBottomWidth: hairline, borderBottomColor: colors.border },
  backBtn: { marginBottom: spacing.sm },
  backText: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.blue600 },
  courseCode: { fontFamily: fonts.mono, fontSize: 13, color: colors.blue600 },
  courseName: { fontFamily: fonts.display, fontSize: 22, color: colors.ink900, marginTop: 2 },
  courseMeta: { fontFamily: fonts.sans, fontSize: 13, color: colors.ink500, marginTop: 2 },

  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: hairline, borderBottomColor: colors.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.blue600 },
  tabText: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink500 },
  tabTextActive: { color: colors.blue600 },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md },

  moduleCard: {
    backgroundColor: '#fff', borderRadius: radius.md, borderWidth: hairline, borderColor: colors.border,
    padding: spacing.md, flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.md,
  },
  moduleOrder: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
  },
  moduleOrderText: { fontFamily: fonts.monoMedium, fontSize: 14, color: colors.blue600 },
  moduleName: { fontFamily: fonts.sansMedium, fontSize: 15, color: colors.ink900 },
  moduleDesc: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm },
  statusText: { fontFamily: fonts.sansMedium, fontSize: 11 },

  addBtn: {
    borderWidth: 1, borderColor: colors.blue600, borderStyle: 'dashed', borderRadius: radius.md,
    paddingVertical: 14, alignItems: 'center', marginTop: spacing.sm,
  },
  addBtnText: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.blue600 },

  emptyState: { alignItems: 'center', paddingVertical: spacing.xl * 2 },
  emptyText: { fontFamily: fonts.sansMedium, fontSize: 16, color: colors.ink900, marginTop: spacing.md },
  emptyDesc: { fontFamily: fonts.sans, fontSize: 13, color: colors.ink500, marginTop: 4 },
});
