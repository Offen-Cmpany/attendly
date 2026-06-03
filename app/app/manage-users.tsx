import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, useWindowDimensions, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { colors, fonts, spacing, radius, hairline } from '../src/theme';
import type { Profile } from '../src/lib/db';

type TabKey = 'students' | 'teachers' | 'admins' | 'pending' | 'debug';

const DESIGNATION_LABELS: Record<string, string> = { principal: 'Principal', hod: 'HoD', office_staff: 'Office Staff', pending_staff: 'Pending Staff' };

export default function ManageUsers() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const [tab, setTab] = useState<TabKey>('students');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<Record<TabKey, Profile[]>>({ students: [], teachers: [], admins: [], pending: [], debug: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { listProfiles } = require('../src/lib/db');
      const allProfiles = await listProfiles();
      
      const students = allProfiles.filter((p: Profile) => p.role === 'student' && p.designation !== 'pending_staff');
      const pending = allProfiles.filter((p: Profile) => p.designation === 'pending_staff');
      const teachers = allProfiles.filter((p: Profile) => p.role === 'teacher');
      const admins = allProfiles.filter((p: Profile) => p.role === 'admin');
      
      console.log(`Fetched Users -> Students: ${students.length}, Pending: ${pending.length}, Teachers: ${teachers.length}, Admins: ${admins.length}, Total: ${allProfiles.length}`);
      setUsers({ students, teachers, admins, pending, debug: allProfiles });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const approveUser = async (id: string, newRole: 'teacher' | 'admin', designation?: string) => {
    try {
      const { updateProfile } = require('../src/lib/db');
      const updated = await updateProfile(id, { role: newRole, designation: designation || null });
      if (!updated) {
        import('react-native').then(({ Alert }) => Alert.alert('Database Error', 'Could not update user in Supabase. Check RLS or Database logs.'));
        return;
      }
      // Remove from pending and append to appropriate list locally to update UI instantly
      setUsers(prev => {
        const userToMove = prev.pending.find(u => u.id === id);
        if (!userToMove) return prev;
        const updatedUser = { ...userToMove, role: newRole, designation };
        return {
          ...prev,
          pending: prev.pending.filter(u => u.id !== id),
          teachers: newRole === 'teacher' ? [...prev.teachers, updatedUser as Profile] : prev.teachers,
          admins: newRole === 'admin' ? [...prev.admins, updatedUser as Profile] : prev.admins,
        };
      });
    } catch (e) {
      console.error(e);
      import('react-native').then(({ Alert }) => Alert.alert('Error', 'Failed to approve user.'));
    }
  };

  const filteredUsers = users[tab].filter(u =>
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
        {(['students', 'teachers', 'admins', 'pending', 'debug'] as TabKey[]).map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => { setTab(t); setSearch(''); }}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive, t === 'debug' && { color: 'red' }]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
            <Text style={[styles.tabCount, tab === t && styles.tabCountActive]}>{users[t].length}</Text>
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

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading && !refreshing ? (
           <Text style={styles.emptyText}>Loading...</Text>
        ) : filteredUsers.length === 0 ? (
           <Text style={styles.emptyText}>No users found.</Text>
        ) : filteredUsers.map(u => (
          <View key={u.id} style={styles.userCard}>
            <View style={styles.userInfoRow}>
              <View style={[styles.avatar, { backgroundColor: tab === 'students' ? '#EBF2FB' : tab === 'teachers' ? '#F0E6FF' : tab === 'pending' ? '#f5f5f5' : '#FFF3E0' }]}>
                <Text style={styles.avatarText}>{u.name[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{u.name}</Text>
                <Text style={styles.userEmail}>{u.email}</Text>
                {u.reg && <Text style={styles.userMeta}>{u.reg} · {u.program}</Text>}
                {u.designation && <Text style={styles.userMeta}>{DESIGNATION_LABELS[u.designation] || u.designation}</Text>}
                {u.isClassAdvisor && <Text style={[styles.userMeta, { color: '#1B8F5A' }]}>Class Advisor ✓</Text>}
              </View>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{tab === 'pending' ? 'Pending' : u.role}</Text>
              </View>
            </View>
            
            {tab === 'debug' && (
              <View style={{ marginTop: 8, padding: 8, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                <Text style={{ fontSize: 10, fontFamily: 'monospace' }}>Role: {u.role} | Desig: {u.designation || 'null'}</Text>
              </View>
            )}

            {tab === 'pending' && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                <TouchableOpacity style={styles.approveBtn} onPress={() => approveUser(u.id, 'teacher')}>
                  <Text style={styles.approveBtnText}>Approve as Teacher</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.approveBtn, { backgroundColor: '#FFF3E0' }]} onPress={() => approveUser(u.id, 'admin', 'office_staff')}>
                  <Text style={[styles.approveBtnText, { color: '#C47D1A' }]}>Approve as Staff</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.approveBtn, { backgroundColor: '#F0E6FF' }]} onPress={() => approveUser(u.id, 'admin', 'hod')}>
                  <Text style={[styles.approveBtnText, { color: '#6A1B9A' }]}>Approve as HoD</Text>
                </TouchableOpacity>
              </View>
            )}
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
    padding: spacing.md, marginBottom: spacing.sm,
  },
  userInfoRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.sansMedium, fontSize: 18, color: colors.blue600 },
  userName: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink900 },
  userEmail: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginTop: 1 },
  userMeta: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginTop: 1 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt, position: 'absolute', right: spacing.md, top: spacing.md },
  roleText: { fontFamily: fonts.sansMedium, fontSize: 11, color: colors.ink700, textTransform: 'capitalize' },
  emptyText: { fontFamily: fonts.sans, fontSize: 14, color: colors.ink500, textAlign: 'center', marginTop: spacing.xl },
  approveBtn: { flex: 1, backgroundColor: '#EBF2FB', paddingVertical: 8, borderRadius: radius.sm, alignItems: 'center' },
  approveBtnText: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.blue600 },
});
