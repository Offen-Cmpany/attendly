import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, fonts, spacing, radius, hairline } from '../../src/theme';
import { getBatch, Batch } from '../../src/lib/db';

const mockStudents = Array.from({ length: 15 }, (_, i) => ({
  id: `s${i}`, name: ['Aravind R', 'Lakshmi M', 'Sreehari V', 'Nithya K', 'Adarsh P', 'Meera S', 'Kiran T', 'Divya N', 'Pranav S', 'Anjali B', 'Vishnu K', 'Reshma P', 'Abhijith M', 'Sneha L', 'Jithin G'][i],
  reg: `CEK22CS${String(i + 1).padStart(3, '0')}`, attendance: [92, 88, 76, 95, 72, 85, 90, 68, 94, 83, 79, 91, 87, 74, 96][i],
}));

export default function ManageBatch() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => { getBatch(id).then(setBatch); }, [id]);

  const filtered = mockStudents.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.reg.toLowerCase().includes(search.toLowerCase()));
  const getColor = (pct: number) => pct >= 80 ? '#1B8F5A' : pct >= 75 ? '#C47D1A' : '#C43333';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{batch?.name ?? 'Batch Details'}</Text>
        <Text style={styles.meta}>{batch?.program} · {batch?.year} · Section {batch?.section ?? '—'}</Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>+ Add Students</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnOutline]}>
          <Text style={[styles.actionBtnText, { color: colors.blue600 }]}>Assign Advisor</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <TextInput style={styles.searchInput} placeholder="Search students…" placeholderTextColor={colors.ink300} value={search} onChangeText={setSearch} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {filtered.map(s => (
          <View key={s.id} style={styles.studentCard}>
            <View style={[styles.avatar, { backgroundColor: getColor(s.attendance) + '20' }]}>
              <Text style={[styles.avatarText, { color: getColor(s.attendance) }]}>{s.name[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.studentName}>{s.name}</Text>
              <Text style={styles.studentReg}>{s.reg}</Text>
            </View>
            <View style={[styles.pctBadge, { backgroundColor: getColor(s.attendance) + '18' }]}>
              <Text style={[styles.pctText, { color: getColor(s.attendance) }]}>{s.attendance}%</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceAlt },
  header: { padding: spacing.md, backgroundColor: '#fff', borderBottomWidth: hairline, borderBottomColor: colors.border },
  backText: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.blue600, marginBottom: spacing.sm },
  title: { fontFamily: fonts.display, fontSize: 22, color: colors.ink900 },
  meta: { fontFamily: fonts.sans, fontSize: 13, color: colors.ink500, marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md },
  actionBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.sm, backgroundColor: colors.blue600 },
  actionBtnOutline: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.blue600 },
  actionBtnText: { fontFamily: fonts.sansMedium, fontSize: 13, color: '#fff' },
  searchBar: { paddingHorizontal: spacing.md },
  searchInput: { height: 40, paddingHorizontal: 12, borderWidth: hairline, borderColor: colors.border, borderRadius: radius.md, backgroundColor: '#fff', fontFamily: fonts.sans, fontSize: 14, color: colors.ink900 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md },
  studentCard: { backgroundColor: '#fff', borderRadius: radius.md, borderWidth: hairline, borderColor: colors.border, padding: spacing.md, flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.md },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.sansMedium, fontSize: 16 },
  studentName: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink900 },
  studentReg: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginTop: 1 },
  pctBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm },
  pctText: { fontFamily: fonts.monoMedium, fontSize: 13 },
});
