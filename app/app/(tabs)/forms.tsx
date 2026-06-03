import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, radius, hairline } from '../../src/theme';
import { useAuth } from '../../src/lib/auth';
import { listForms, Form } from '../../src/lib/db';

export default function FormsTab() {
  const { role, user } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const isTeacher = role === 'teacher';

  const [forms_, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = isTeacher
          ? await listForms({ createdBy: user?.id })
          : await listForms({ status: 'published' });
        setForms(list);
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const typeColors: Record<string, string> = {
    survey: '#7C3AED',
    data_collection: colors.blue600,
    feedback: '#1B8F5A',
    other: colors.ink500,
  };

  const typeLabels: Record<string, string> = {
    survey: 'Survey',
    data_collection: 'Data Collection',
    feedback: 'Feedback',
    other: 'Other',
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>{isTeacher ? 'My Forms' : 'Forms'}</Text>
        {isTeacher && (
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => router.push('/form-create' as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.createBtnText}>+ Create Form</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.blue600} />
        </View>
      ) : forms_.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>{isTeacher ? '📝' : '📋'}</Text>
          <Text style={styles.emptyTitle}>{isTeacher ? 'No forms created yet' : 'No forms available'}</Text>
          <Text style={styles.emptyDesc}>
            {isTeacher
              ? 'Create your first form to collect data from students'
              : 'Your teachers haven\'t published any forms yet'}
          </Text>
          {isTeacher && (
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/form-create' as any)}>
              <Text style={styles.emptyBtnText}>Create Form</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.grid, isWide && styles.gridWide]}>
            {forms_.map((form) => (
              <TouchableOpacity
                key={form.id}
                style={styles.formCard}
                onPress={() => router.push(`/form-detail/${form.id}` as any)}
                activeOpacity={0.7}
              >
                <View style={styles.formHeader}>
                  <View style={[styles.typeBadge, { backgroundColor: (typeColors[form.type] ?? colors.ink500) + '18' }]}>
                    <Text style={[styles.typeText, { color: typeColors[form.type] ?? colors.ink500 }]}>
                      {typeLabels[form.type] ?? form.type}
                    </Text>
                  </View>
                  <View style={[styles.statusDot, { backgroundColor: form.status === 'published' ? '#1B8F5A' : form.status === 'draft' ? '#C47D1A' : colors.ink300 }]} />
                </View>
                <Text style={styles.formTitle}>{form.title}</Text>
                {form.description ? <Text style={styles.formDesc} numberOfLines={2}>{form.description}</Text> : null}
                <View style={styles.formFooter}>
                  <Text style={styles.formMeta}>{form.questions.length} questions</Text>
                  {form.deadline && (
                    <Text style={styles.formDeadline}>Due: {new Date(form.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceAlt },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerTitle: { fontFamily: fonts.display, fontSize: 24, color: colors.ink900 },
  createBtn: {
    backgroundColor: colors.blue600,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.sm,
  },
  createBtnText: { fontFamily: fonts.sansMedium, fontSize: 13, color: '#fff' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontFamily: fonts.sansMedium, fontSize: 18, color: colors.ink900, marginBottom: spacing.xs },
  emptyDesc: { fontFamily: fonts.sans, fontSize: 14, color: colors.ink500, textAlign: 'center', maxWidth: 280 },
  emptyBtn: {
    backgroundColor: colors.blue600,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radius.md,
    marginTop: spacing.lg,
  },
  emptyBtnText: { fontFamily: fonts.sansMedium, fontSize: 14, color: '#fff' },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md },
  grid: { gap: spacing.sm },
  gridWide: { flexDirection: 'row', flexWrap: 'wrap' },

  formCard: {
    backgroundColor: '#fff',
    borderRadius: radius.md,
    borderWidth: hairline,
    borderColor: colors.border,
    padding: spacing.md,
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 280,
  },
  formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.sm },
  typeText: { fontFamily: fonts.sansMedium, fontSize: 11 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  formTitle: { fontFamily: fonts.sansMedium, fontSize: 16, color: colors.ink900, marginBottom: 4 },
  formDesc: { fontFamily: fonts.sans, fontSize: 13, color: colors.ink500, marginBottom: spacing.sm },
  formFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  formMeta: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500 },
  formDeadline: { fontFamily: fonts.sans, fontSize: 12, color: colors.coral },
});
