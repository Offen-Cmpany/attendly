import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, radius, hairline } from '../src/theme';
import { useAuth } from '../src/lib/auth';
import { createForm, FormType, QuestionType, FormQuestion } from '../src/lib/db';

const FORM_TYPES: { key: FormType; label: string; emoji: string }[] = [
  { key: 'survey', label: 'Survey', emoji: '📊' },
  { key: 'data_collection', label: 'Data Collection', emoji: '📋' },
  { key: 'feedback', label: 'Feedback', emoji: '💬' },
  { key: 'other', label: 'Other', emoji: '📝' },
];

const Q_TYPES: { key: QuestionType; label: string }[] = [
  { key: 'short_text', label: 'Short Text' },
  { key: 'long_text', label: 'Long Text' },
  { key: 'multiple_choice', label: 'Multiple Choice' },
  { key: 'checkbox', label: 'Checkbox' },
  { key: 'date', label: 'Date' },
];

export default function FormCreate() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [formType, setFormType] = useState<FormType>('data_collection');
  const [questions, setQuestions] = useState<FormQuestion[]>([
    { id: 'q1', type: 'short_text', question: '', required: false },
  ]);
  const [saving, setSaving] = useState(false);

  const addQuestion = () => {
    setQuestions(prev => [...prev, { id: `q${prev.length + 1}`, type: 'short_text', question: '', required: false }]);
  };

  const updateQuestion = (idx: number, data: Partial<FormQuestion>) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, ...data } : q));
  };

  const removeQuestion = (idx: number) => {
    if (questions.length === 1) return;
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const addOption = (idx: number) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, options: [...(q.options ?? []), ''] } : q));
  };

  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    setQuestions(prev => prev.map((q, i) => i === qIdx ? { ...q, options: (q.options ?? []).map((o, j) => j === oIdx ? value : o) } : q));
  };

  const handlePublish = async () => {
    if (!title.trim()) return Alert.alert('Error', 'Please add a title');
    if (questions.some(q => !q.question.trim())) return Alert.alert('Error', 'All questions need text');
    setSaving(true);
    try {
      await createForm({
        title: title.trim(), description: description.trim(), type: formType,
        questions, createdBy: user?.id ?? 'demo', status: 'published',
      });
      router.back();
    } catch { Alert.alert('Error', 'Failed to create form'); }
    finally { setSaving(false); }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Form</Text>
        <TouchableOpacity style={styles.publishBtn} onPress={handlePublish} disabled={saving}>
          <Text style={styles.publishBtnText}>{saving ? 'Publishing…' : 'Publish'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title & Description */}
        <Text style={styles.label}>Form Title</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Library Usage Survey" placeholderTextColor={colors.ink300} />

        <Text style={styles.label}>Description (optional)</Text>
        <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Brief description…" placeholderTextColor={colors.ink300} multiline numberOfLines={3} />

        {/* Form Type */}
        <Text style={styles.label}>Form Type</Text>
        <View style={styles.typeRow}>
          {FORM_TYPES.map(t => (
            <TouchableOpacity key={t.key} style={[styles.typeChip, formType === t.key && styles.typeChipActive]} onPress={() => setFormType(t.key)}>
              <Text style={styles.typeEmoji}>{t.emoji}</Text>
              <Text style={[styles.typeLabel, formType === t.key && styles.typeLabelActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Questions */}
        <Text style={[styles.label, { marginTop: spacing.lg }]}>Questions</Text>
        {questions.map((q, idx) => (
          <View key={q.id} style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionNum}>Q{idx + 1}</Text>
              {questions.length > 1 && (
                <TouchableOpacity onPress={() => removeQuestion(idx)}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={styles.input}
              value={q.question}
              onChangeText={v => updateQuestion(idx, { question: v })}
              placeholder="Type your question…"
              placeholderTextColor={colors.ink300}
            />
            <View style={styles.qTypeRow}>
              {Q_TYPES.map(t => (
                <TouchableOpacity key={t.key} style={[styles.qTypeChip, q.type === t.key && styles.qTypeChipActive]} onPress={() => updateQuestion(idx, { type: t.key, options: t.key === 'multiple_choice' || t.key === 'checkbox' ? [''] : undefined })}>
                  <Text style={[styles.qTypeText, q.type === t.key && styles.qTypeTextActive]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* Options for choice types */}
            {(q.type === 'multiple_choice' || q.type === 'checkbox') && (
              <View style={{ marginTop: spacing.sm }}>
                {(q.options ?? []).map((opt, oIdx) => (
                  <TextInput
                    key={oIdx}
                    style={[styles.input, { marginBottom: spacing.xs }]}
                    value={opt}
                    onChangeText={v => updateOption(idx, oIdx, v)}
                    placeholder={`Option ${oIdx + 1}`}
                    placeholderTextColor={colors.ink300}
                  />
                ))}
                <TouchableOpacity onPress={() => addOption(idx)}>
                  <Text style={styles.addOptionText}>+ Add option</Text>
                </TouchableOpacity>
              </View>
            )}
            {/* Required toggle */}
            <TouchableOpacity style={styles.requiredRow} onPress={() => updateQuestion(idx, { required: !q.required })}>
              <View style={[styles.checkbox, q.required && styles.checkboxChecked]}>
                {q.required && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <Text style={styles.requiredLabel}>Required</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addQuestionBtn} onPress={addQuestion} activeOpacity={0.7}>
          <Text style={styles.addQuestionText}>+ Add Question</Text>
        </TouchableOpacity>

        <View style={{ height: spacing.xl * 2 }} />
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
  publishBtn: { backgroundColor: colors.blue600, paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.sm },
  publishBtnText: { fontFamily: fonts.sansMedium, fontSize: 13, color: '#fff' },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md },
  label: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginBottom: 6, marginTop: spacing.md },
  input: {
    paddingHorizontal: 12, paddingVertical: 10, borderWidth: hairline, borderColor: colors.border,
    borderRadius: radius.sm, backgroundColor: '#fff', fontFamily: fonts.sans, fontSize: 14, color: colors.ink900,
  },
  textArea: { height: 80, textAlignVertical: 'top' },

  typeRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: '#fff' },
  typeChipActive: { borderColor: colors.blue600, backgroundColor: '#EBF2FB' },
  typeEmoji: { fontSize: 16 },
  typeLabel: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink500 },
  typeLabelActive: { color: colors.blue600 },

  questionCard: {
    backgroundColor: '#fff', borderRadius: radius.md, borderWidth: hairline, borderColor: colors.border,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  questionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  questionNum: { fontFamily: fonts.monoMedium, fontSize: 13, color: colors.blue600 },
  removeText: { fontFamily: fonts.sans, fontSize: 12, color: '#C43333' },

  qTypeRow: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap', marginTop: spacing.sm },
  qTypeChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt },
  qTypeChipActive: { backgroundColor: '#EBF2FB' },
  qTypeText: { fontFamily: fonts.sans, fontSize: 11, color: colors.ink500 },
  qTypeTextActive: { color: colors.blue600 },

  addOptionText: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.blue600, marginTop: 4 },

  requiredRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  checkbox: {
    width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: colors.ink300,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.blue600, borderColor: colors.blue600 },
  checkMark: { color: '#fff', fontSize: 12, fontFamily: fonts.sansMedium },
  requiredLabel: { fontFamily: fonts.sans, fontSize: 13, color: colors.ink500 },

  addQuestionBtn: {
    borderWidth: 1, borderColor: colors.blue600, borderStyle: 'dashed', borderRadius: radius.md,
    paddingVertical: 14, alignItems: 'center',
  },
  addQuestionText: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.blue600 },
});
