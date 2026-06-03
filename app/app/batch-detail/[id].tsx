import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, fonts, spacing, radius, hairline } from '../../src/theme';
import { listProfiles, getBatch, Batch, Profile } from '../../src/lib/db';

const mockStudents: Profile[] = Array.from({ length: 20 }, (_, i) => ({
  id: `s${i}`, name: ['Aravind R', 'Lakshmi M', 'Sreehari V', 'Nithya K', 'Adarsh P', 'Meera S', 'Kiran T', 'Divya N', 'Pranav S', 'Anjali B', 'Vishnu K', 'Reshma P', 'Abhijith M', 'Sneha L', 'Jithin G', 'Amritha R', 'Sachin V', 'Pooja K', 'Rahul M', 'Gayathri S'][i],
  email: `CEK22CS${String(i + 1).padStart(3, '0')}@cekottarakkara.ac.in`, role: 'student' as const,
  reg: `CEK22CS${String(i + 1).padStart(3, '0')}`, program: 'B.Tech CSE' as const, dept: 'CSE', semester: 6, batchId: 'b1',
}));

const attendancePcts = [92, 88, 76, 95, 72, 85, 90, 68, 94, 83, 79, 91, 87, 74, 96, 82, 70, 93, 86, 77];

export default function BatchDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const [search, setSearch] = useState('');
  const [batch, setBatch] = useState<Batch | null>(null);

  useEffect(() => { getBatch(id).then(setBatch); }, [id]);

  const filtered = mockStudents.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.reg ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const getColor = (pct: number) => pct >= 80 ? '#1B8F5A' : pct >= 75 ? '#C47D1A' : '#C43333';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{batch?.name ?? 'Batch Details'}</Text>
        <Text style={styles.meta}>{filtered.length} students · Class Advisor View</Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#1B8F5A' }]}>{filtered.filter((_, i) => attendancePcts[i] >= 80).length}</Text>
          <Text style={styles.statLabel}>Safe</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#C47D1A' }]}>{filtered.filter((_, i) => attendancePcts[i] >= 75 && attendancePcts[i] < 80).length}</Text>
          <Text style={styles.statLabel}>Watch</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#C43333' }]}>{filtered.filter((_, i) => attendancePcts[i] < 75).length}</Text>
          <Text style={styles.statLabel}>At Risk</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or reg number…"
          placeholderTextColor={colors.ink300}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filtered.map((s, i) => {
          const pct = attendancePcts[i % attendancePcts.length];
          return (
            <View key={s.id} style={styles.studentCard}>
              <View style={[styles.avatar, { backgroundColor: getColor(pct) + '20' }]}>
                <Text style={[styles.avatarText, { color: getColor(pct) }]}>{s.name[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.studentName}>{s.name}</Text>
                <Text style={styles.studentMeta}>{s.reg} · {s.email.split('@')[0]}</Text>
              </View>
              <View style={[styles.pctBadge, { backgroundColor: getColor(pct) + '18' }]}>
                <Text style={[styles.pctText, { color: getColor(pct) }]}>{pct}%</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceAlt },
  header: { padding: spacing.md, backgroundColor: '#fff', borderBottomWidth: hairline, borderBottomColor: colors.border },
  backBtn: { marginBottom: spacing.sm },
  backText: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.blue600 },
  title: { fontFamily: fonts.display, fontSize: 22, color: colors.ink900 },
  meta: { fontFamily: fonts.sans, fontSize: 13, color: colors.ink500, marginTop: 2 },

  statsRow: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: radius.md, borderWidth: hairline, borderColor: colors.border, padding: spacing.md, alignItems: 'center' },
  statValue: { fontFamily: fonts.display, fontSize: 24 },
  statLabel: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginTop: 2 },

  searchBar: { paddingHorizontal: spacing.md },
  searchInput: {
    height: 40, paddingHorizontal: 12, borderWidth: hairline, borderColor: colors.border,
    borderRadius: radius.md, backgroundColor: '#fff', fontFamily: fonts.sans, fontSize: 14, color: colors.ink900,
  },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md },

  studentCard: {
    backgroundColor: '#fff', borderRadius: radius.md, borderWidth: hairline, borderColor: colors.border,
    padding: spacing.md, flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.md,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.sansMedium, fontSize: 16 },
  studentName: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink900 },
  studentMeta: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginTop: 2 },
  pctBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm },
  pctText: { fontFamily: fonts.monoMedium, fontSize: 13 },
});
