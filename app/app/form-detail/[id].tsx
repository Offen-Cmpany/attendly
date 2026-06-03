import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, fonts, spacing, radius, hairline } from '../../src/theme';
import { useAuth } from '../../src/lib/auth';
import { getForm, listFormResponses, submitFormResponse, Form, FormResponse } from '../../src/lib/db';

export default function FormDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { role, user } = useAuth();
  const router = useRouter();
  const isTeacher = role === 'teacher';

  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const f = await getForm(id);
        setForm(f);
        if (f && isTeacher) {
          const r = await listFormResponses(f.id);
          setResponses(r);
        }
      } catch {} finally { setLoading(false); }
    })();
  }, [id]);

  const handleSubmit = async () => {
    if (!form) return;
    const missing = form.questions.filter(q => q.required && !answers[q.id]);
    if (missing.length > 0) return Alert.alert('Required', `Please answer: ${missing[0].question}`);
    setSubmitting(true);
    try {
      await submitFormResponse({
        formId: form.id, userId: user?.id ?? 'demo',
        userName: user?.name, answers, submittedAt: new Date().toISOString(),
      });
      Alert.alert('Success', 'Your response has been submitted!');
      router.back();
    } catch { Alert.alert('Error', 'Failed to submit'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.blue600} /></View>;
  if (!form) return <View style={styles.center}><Text>Form not found</Text></View>;

  // Teacher: show summary
  if (isTeacher) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{form.title}</Text>
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{responses.length}</Text>
            <Text style={styles.summaryLabel}>Total Responses</Text>
          </View>

          <Text style={styles.sectionTitle}>Questions & Answers</Text>
          {form.questions.map((q, i) => (
            <View key={q.id} style={styles.qCard}>
              <Text style={styles.qNumber}>Q{i + 1}</Text>
              <Text style={styles.qText}>{q.question}</Text>
              {(q.type === 'multiple_choice' || q.type === 'checkbox') && q.options && (
                <View style={styles.optionStats}>
                  {q.options.map((opt, j) => {
                    const count = responses.filter(r => {
                      const a = r.answers[q.id];
                      return Array.isArray(a) ? a.includes(opt) : a === opt;
                    }).length;
                    const pct = responses.length > 0 ? Math.round((count / responses.length) * 100) : 0;
                    return (
                      <View key={j} style={styles.optionRow}>
                        <Text style={styles.optionLabel}>{opt || `Option ${j + 1}`}</Text>
                        <View style={styles.optionBarBg}>
                          <View style={[styles.optionBarFill, { width: `${pct}%` }]} />
                        </View>
                        <Text style={styles.optionPct}>{pct}%</Text>
                      </View>
                    );
                  })}
                </View>
              )}
              {(q.type === 'short_text' || q.type === 'long_text') && responses.length > 0 && (
                <View style={styles.textResponses}>
                  {responses.slice(0, 3).map((r, j) => (
                    <Text key={j} style={styles.textResponse}>"{r.answers[q.id] ?? '—'}"</Text>
                  ))}
                  {responses.length > 3 && <Text style={styles.moreText}>+{responses.length - 3} more responses</Text>}
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Student: fill form
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{form.title}</Text>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {form.description ? <Text style={styles.formDesc}>{form.description}</Text> : null}

        {form.questions.map((q, i) => (
          <View key={q.id} style={styles.qCard}>
            <Text style={styles.qNumber}>Q{i + 1} {q.required ? '*' : ''}</Text>
            <Text style={styles.qText}>{q.question}</Text>

            {(q.type === 'short_text' || q.type === 'long_text') && (
              <TextInput
                style={[styles.answerInput, q.type === 'long_text' && { height: 80 }]}
                value={answers[q.id] ?? ''}
                onChangeText={v => setAnswers(prev => ({ ...prev, [q.id]: v }))}
                placeholder="Your answer…"
                placeholderTextColor={colors.ink300}
                multiline={q.type === 'long_text'}
              />
            )}

            {q.type === 'multiple_choice' && q.options?.map((opt, j) => (
              <TouchableOpacity key={j} style={[styles.optionBtn, answers[q.id] === opt && styles.optionBtnActive]} onPress={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}>
                <View style={[styles.radio, answers[q.id] === opt && styles.radioActive]} />
                <Text style={styles.optionBtnText}>{opt}</Text>
              </TouchableOpacity>
            ))}

            {q.type === 'checkbox' && q.options?.map((opt, j) => {
              const selected = (answers[q.id] ?? []) as string[];
              const isChecked = selected.includes(opt);
              return (
                <TouchableOpacity key={j} style={[styles.optionBtn, isChecked && styles.optionBtnActive]} onPress={() => {
                  setAnswers(prev => ({
                    ...prev,
                    [q.id]: isChecked ? selected.filter(s => s !== opt) : [...selected, opt],
                  }));
                }}>
                  <View style={[styles.checkboxSmall, isChecked && styles.checkboxSmallChecked]}>
                    {isChecked && <Text style={{ color: '#fff', fontSize: 10 }}>✓</Text>}
                  </View>
                  <Text style={styles.optionBtnText}>{opt}</Text>
                </TouchableOpacity>
              );
            })}

            {q.type === 'date' && (
              <TextInput
                style={styles.answerInput}
                value={answers[q.id] ?? ''}
                onChangeText={v => setAnswers(prev => ({ ...prev, [q.id]: v }))}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={colors.ink300}
              />
            )}
          </View>
        ))}

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting} activeOpacity={0.8}>
          <Text style={styles.submitBtnText}>{submitting ? 'Submitting…' : 'Submit Response'}</Text>
        </TouchableOpacity>
        <View style={{ height: spacing.xl * 2 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceAlt },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerBar: { padding: spacing.md, backgroundColor: '#fff', borderBottomWidth: hairline, borderBottomColor: colors.border },
  backText: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.blue600, marginBottom: spacing.xs },
  headerTitle: { fontFamily: fonts.sansMedium, fontSize: 17, color: colors.ink900 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md },
  formDesc: { fontFamily: fonts.sans, fontSize: 14, color: colors.ink500, marginBottom: spacing.md },

  summaryCard: {
    backgroundColor: colors.blue600, borderRadius: radius.md, padding: spacing.lg,
    alignItems: 'center', marginBottom: spacing.md,
  },
  summaryValue: { fontFamily: fonts.display, fontSize: 36, color: '#fff' },
  summaryLabel: { fontFamily: fonts.sans, fontSize: 14, color: 'rgba(255,255,255,0.8)' },

  sectionTitle: { fontFamily: fonts.sansMedium, fontSize: 16, color: colors.ink900, marginBottom: spacing.sm, marginTop: spacing.sm },

  qCard: {
    backgroundColor: '#fff', borderRadius: radius.md, borderWidth: hairline, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  qNumber: { fontFamily: fonts.monoMedium, fontSize: 12, color: colors.blue600, marginBottom: 4 },
  qText: { fontFamily: fonts.sansMedium, fontSize: 15, color: colors.ink900, marginBottom: spacing.sm },

  answerInput: {
    paddingHorizontal: 12, paddingVertical: 10, borderWidth: hairline, borderColor: colors.border,
    borderRadius: radius.sm, backgroundColor: colors.surfaceAlt, fontFamily: fonts.sans, fontSize: 14, color: colors.ink900,
  },

  optionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingVertical: 10, paddingHorizontal: 12, borderRadius: radius.sm,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xs,
  },
  optionBtnActive: { borderColor: colors.blue600, backgroundColor: '#EBF2FB' },
  optionBtnText: { fontFamily: fonts.sans, fontSize: 14, color: colors.ink900 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.ink300 },
  radioActive: { borderColor: colors.blue600, backgroundColor: colors.blue600 },
  checkboxSmall: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: colors.ink300, alignItems: 'center', justifyContent: 'center' },
  checkboxSmallChecked: { backgroundColor: colors.blue600, borderColor: colors.blue600 },

  submitBtn: { backgroundColor: colors.blue600, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center', marginTop: spacing.md },
  submitBtnText: { fontFamily: fonts.sansMedium, fontSize: 15, color: '#fff' },

  // Teacher summary styles
  optionStats: { marginTop: spacing.sm },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 6 },
  optionLabel: { fontFamily: fonts.sans, fontSize: 13, color: colors.ink700, width: 100 },
  optionBarBg: { flex: 1, height: 8, backgroundColor: colors.surfaceAlt, borderRadius: 4 },
  optionBarFill: { height: 8, backgroundColor: colors.blue600, borderRadius: 4 },
  optionPct: { fontFamily: fonts.mono, fontSize: 12, color: colors.ink500, width: 36, textAlign: 'right' },
  textResponses: { marginTop: spacing.sm },
  textResponse: { fontFamily: fonts.sans, fontSize: 13, color: colors.ink700, fontStyle: 'italic', marginBottom: 4 },
  moreText: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500 },
});
