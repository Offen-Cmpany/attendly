import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, radius, hairline } from '../src/theme';
import type { Profile } from '../src/lib/db';

type TabKey = 'students' | 'teachers' | 'admins';

const mockUsers: Record<TabKey, Profile[]> = {
  students: Array.from({ length: 12 }, (_, i) => ({
    id: `s${i}`,
    name: ['Aravind R', 'Lakshmi M', 'Sreehari V', 'Nithya K', 'Adarsh P', 'Meera S', 'Kiran T', 'Divya N', 'Pranav S', 'Anjali B', 'Vishnu K', 'Reshma P'][i],
    email: `CEK22CS${String(i + 1).padStart(3, '0')}@cekottarakkara.ac.in`,
    role: 'student' as const, reg: `CEK22CS${String(i + 1).padStart(3, '0')}`,
    program: (['B.Tech CSE', 'B.Tech CSE', 'B.Tech CSE & AI', 'BCA'] as const)[i % 4],
    dept: 'CSE', semester: 6, batchId: 'b1',
  })),
  teachers: [
    { id: 't1', name: 'Dr. Rajesh Kumar', email: 'rajesh.kumar@cekottarakkara.ac.in', role: 'teacher' as const, dept: 'CSE', isClassAdvisor: true },
    { id: 't2', name: 'Prof. Shanti M', email: 'shanti.m@cekottarakkara.ac.in', role: 'teacher' as const, dept: 'CSE' },
    { id: 't3', name: 'Dr. Anil Kumar P', email: 'anil.p@cekottarakkara.ac.in', role: 'teacher' as const, dept: 'CSE' },
  ],
  admins: [
    { id: 'a1', name: 'Dr. Suresh Babu', email: 'principal@cekottarakkara.ac.in', role: 'admin' as const, designation: 'principal' as const },
    { id: 'a2', name: 'Dr. Priya S', email: 'hod.cse@cekottarakkara.ac.in', role: 'admin' as const, designation: 'hod' as const },
    { id: 'a3', name: 'Sreekumar R', email: 'office@cekottarakkara.ac.in', role: 'admin' as const, designation: 'office_staff' as const },
  ],
};

const DESIGNATION_LABELS: Record<string, string> = { principal: 'Principal', hod: 'HoD', office_staff: 'Office Staff' };

export default function ManageUsers() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const [tab, setTab] = useState<TabKey>('students');
  const [search, setSearch] = useState('');

  const users = mockUsers[tab].filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.reg ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Users</Text>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {(['students', 'teachers', 'admins'] as TabKey[]).map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => { setTab(t); setSearch(''); }}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
            <Text style={[styles.tabCount, tab === t && styles.tabCountActive]}>{mockUsers[t].length}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${tab}…`}
          placeholderTextColor={colors.ink300}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {users.map(u => (
          <View key={u.id} style={styles.userCard}>
            <View style={[styles.avatar, { backgroundColor: tab === 'students' ? '#EBF2FB' : tab === 'teachers' ? '#F0E6FF' : '#FFF3E0' }]}>
              <Text style={styles.avatarText}>{u.name[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{u.name}</Text>
              <Text style={styles.userEmail}>{u.email}</Text>
              {u.reg && <Text style={styles.userMeta}>{u.reg} · {u.program}</Text>}
              {u.designation && <Text style={styles.userMeta}>{DESIGNATION_LABELS[u.designation]}</Text>}
              {u.isClassAdvisor && <Text style={[styles.userMeta, { color: '#1B8F5A' }]}>Class Advisor ✓</Text>}
            </View>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{u.role}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceAlt },
  headerBar: { padding: spacing.md, backgroundColor: '#fff', borderBottomWidth: hairline, borderBottomColor: colors.border },
  backBtn: { marginBottom: spacing.sm },
  backText: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.blue600 },
  headerTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.ink900 },

  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: hairline, borderBottomColor: colors.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.blue600 },
  tabText: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink500 },
  tabTextActive: { color: colors.blue600 },
  tabCount: { fontFamily: fonts.mono, fontSize: 12, color: colors.ink300, backgroundColor: colors.surfaceAlt, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8 },
  tabCountActive: { color: colors.blue600, backgroundColor: '#EBF2FB' },

  searchBar: { padding: spacing.md },
  searchInput: {
    height: 40, paddingHorizontal: 12, borderWidth: hairline, borderColor: colors.border,
    borderRadius: radius.md, backgroundColor: '#fff', fontFamily: fonts.sans, fontSize: 14, color: colors.ink900,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },

  userCard: {
    backgroundColor: '#fff', borderRadius: radius.md, borderWidth: hairline, borderColor: colors.border,
    padding: spacing.md, flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.md,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.sansMedium, fontSize: 18, color: colors.blue600 },
  userName: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink900 },
  userEmail: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginTop: 1 },
  userMeta: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginTop: 1 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt },
  roleText: { fontFamily: fonts.sansMedium, fontSize: 11, color: colors.ink700 },
});
