import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable, TextInput, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Chip, Eyebrow, Divider } from '../../src/components/atoms';
import { colors, fonts, radius, space, hairline } from '../../src/theme';
import { useAuth } from '../../src/lib/auth';
import { listCourseDurations, listStudentsByBatch, saveAttendanceSession, CourseDuration, Profile } from '../../src/lib/db';

export default function MarkAttendance() {
  const { id } = useLocalSearchParams<{ id: string }>(); // courseDurationId
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [courseDuration, setCourseDuration] = useState<CourseDuration | null>(null);
  const [students, setStudents] = useState<Profile[]>([]);
  const [absent, setAbsent] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [topic, setTopic] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'lecture' | 'lab' | 'tutorial'>('lecture');

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setErrorMsg(null);
        // 1. Fetch course duration details
        const cds = await listCourseDurations({ facultyId: user?.id });
        const cd = cds.find(c => c.id === id);
        if (!cd) throw new Error('Class not found or you are not assigned to it.');
        if (mounted) setCourseDuration(cd);

        // 2. Fetch enrolled students
        const roster = await listStudentsByBatch(cd.batchId);
        if (mounted) setStudents(roster);
      } catch (err: any) {
        if (mounted) setErrorMsg(err.message || 'Failed to load class data');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (id && user?.id) load();
    return () => { mounted = false; };
  }, [id, user?.id]);

  const present = students.length - absent.size;

  const handleSave = async () => {
    if (!courseDuration || !user?.id) return;
    setSaving(true);
    setErrorMsg(null);
    try {
      const entries = students.map(s => ({
        studentId: s.id,
        status: (absent.has(s.id) ? 'absent' : 'present') as 'present' | 'absent',
      }));
      await saveAttendanceSession(courseDuration.id, user.id, entries, { topic, deliveryMethod });
      router.back();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save attendance');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={colors.blue600} size="large" />
      </View>
    );
  }

  if (errorMsg && !courseDuration) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + space.md, paddingHorizontal: space.lg }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text style={styles.back}>← Back</Text></Pressable>
        <Card style={{ marginTop: space.xl, backgroundColor: colors.riskBg }}>
          <Text style={{ color: colors.riskFg }}>{errorMsg}</Text>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[{ paddingTop: insets.top + space.md, paddingHorizontal: space.lg, paddingBottom: 150, gap: space.md }, isDesktop && { maxWidth: 720, alignSelf: 'center' as const, width: '100%', paddingHorizontal: 32 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable onPress={() => router.back()} hitSlop={10}><Text style={styles.back}>← Back</Text></Pressable>
          <View style={{ flex: 1 }} />
          <Chip label="Live" variant="safe" dot />
        </View>

        <View>
          <Eyebrow>{String(courseDuration?.courseCode || '').replace(/,/g, '').trim()} • Sem {String(courseDuration?.semester || '').replace(/,/g, '').trim()}</Eyebrow>
          <Text style={styles.h1}>{courseDuration?.courseName}</Text>
          <Text style={styles.sub}>Marking attendance for today</Text>
        </View>

        {errorMsg && (
          <Card style={{ backgroundColor: colors.riskBg }}>
            <Text style={{ color: colors.riskFg }}>{errorMsg}</Text>
          </Card>
        )}

        {/* Options */}
        <Card style={{ gap: space.sm }}>
          <Text style={styles.label}>Topic Covered (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Binary Search Trees"
            value={topic}
            onChangeText={setTopic}
          />
          <Text style={[styles.label, { marginTop: space.sm }]}>Delivery Method</Text>
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            {(['lecture', 'lab', 'tutorial'] as const).map(m => (
              <Pressable key={m} onPress={() => setDeliveryMethod(m)} style={[styles.methodChip, deliveryMethod === m && styles.methodChipActive]}>
                <Text style={[styles.methodText, deliveryMethod === m && styles.methodTextActive]}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        {/* KPIs */}
        <View style={{ flexDirection: 'row', gap: space.md }}>
          <Card style={{ flex: 1 }}><Eyebrow>Present</Eyebrow><Text style={[styles.kpi, { color: colors.safeFg }]}>{present}</Text></Card>
          <Card style={{ flex: 1 }}><Eyebrow>Absent</Eyebrow><Text style={[styles.kpi, { color: colors.coral400 }]}>{absent.size}</Text></Card>
        </View>

        {/* Roster */}
        <Card style={{ gap: space.sm }}>
          {students.length === 0 ? (
            <Text style={{ color: colors.ink500, padding: space.md, textAlign: 'center' }}>No students enrolled in this batch.</Text>
          ) : (
            students.map((s, i) => {
              const isAbsent = absent.has(s.id);
              return (
                <View key={s.id}>
                  <Pressable
                    onPress={() => setAbsent(prev => {
                      const n = new Set(prev);
                      n.has(s.id) ? n.delete(s.id) : n.add(s.id);
                      return n;
                    })}
                    style={[styles.row, isAbsent && { opacity: 0.6 }]}
                  >
                    <View style={[styles.checkbox, isAbsent ? styles.checkboxAbsent : styles.checkboxPresent]}>
                      <Text style={styles.checkText}>{isAbsent ? '✕' : '✓'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.name}>{s.name}</Text>
                      <Text style={styles.reg}>{s.reg || 'No Reg No.'}</Text>
                    </View>
                    <Chip label={isAbsent ? 'Absent' : 'Present'} variant={isAbsent ? 'risk' : 'safe'} dot />
                  </Pressable>
                  {i < students.length - 1 && <Divider style={{ marginVertical: 4 }} />}
                </View>
              );
            })
          )}
        </Card>
      </ScrollView>

      {students.length > 0 && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }, isDesktop && { maxWidth: 720, alignSelf: 'center' as const, width: '100%' }]}>
          <Button title="Reset" variant="ghost" style={{ flex: 1 }} onPress={() => setAbsent(new Set())} disabled={saving} />
          <Button 
            title={saving ? 'Saving...' : `Save · ${present}/${students.length}`} 
            onPress={handleSave} 
            style={{ flex: 2 }} 
            disabled={saving}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceAlt },
  back: { fontFamily: fonts.sansMedium, color: colors.ink500, fontSize: 13 },
  h1: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.ink900, marginTop: space.xs },
  sub: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginTop: 2 },
  kpi: { fontFamily: fonts.displayBold, fontSize: 32, marginTop: space.sm },
  label: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.ink700 },
  input: {
    borderWidth: hairline, borderColor: colors.border, borderRadius: radius.sm,
    padding: space.sm, fontFamily: fonts.sans, fontSize: 14, color: colors.ink900,
  },
  methodChip: {
    paddingHorizontal: space.md, paddingVertical: 8, borderRadius: radius.pill,
    backgroundColor: colors.surface, borderWidth: hairline, borderColor: colors.border,
  },
  methodChipActive: { backgroundColor: colors.blue600, borderColor: colors.blue600 },
  methodText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink700 },
  methodTextActive: { color: '#fff' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 6 },
  checkbox: { width: 28, height: 28, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  checkboxPresent: { backgroundColor: colors.safeBg },
  checkboxAbsent: { backgroundColor: colors.riskBg },
  checkText: { fontFamily: fonts.sansMedium, color: colors.ink900 },
  name: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink900 },
  reg: { fontFamily: fonts.mono, fontSize: 11, color: colors.ink500, marginTop: 2 },
  footer: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: '#fff', borderTopWidth: hairline, borderTopColor: colors.border,
    paddingHorizontal: space.lg, paddingTop: space.md, flexDirection: 'row', gap: space.md,
  },
});
