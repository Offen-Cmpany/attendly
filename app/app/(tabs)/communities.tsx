import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Chip, Eyebrow, Divider } from '../../src/components/atoms';
import { colors, fonts, radius, space, hairline } from '../../src/theme';
import { useAuth } from '../../src/lib/auth';

const yours = [
  { id: 'ie', name: 'IEEE Student Branch', tag: 'IE', color: colors.blue600, members: 142, unread: 3, hint: 'New event Sat' },
  { id: 'ph', name: 'Photography Society', tag: 'PH', color: colors.coral400, members: 86, unread: 0, hint: 'Walk this Sun' },
  { id: 'db', name: 'Debate Forum', tag: 'DB', color: colors.blue400, members: 64, unread: 1, hint: 'Practice tonight' },
];

const events = [
  { id: 'e1', date: 'Sat 19 Apr', title: 'TechFest opening night', org: 'IEEE', time: '6:00 PM', location: 'Main Auditorium', dutyOk: true, attending: 34 },
  { id: 'e2', date: 'Sun 20 Apr', title: 'Sunrise photo walk', org: 'Photography', time: '5:30 AM', location: 'Beach Road', dutyOk: false, attending: 12 },
];

const discover = [
  { name: 'Coding Club', tag: 'CC', color: colors.blue600, members: 210 },
  { name: 'Music Society', tag: 'MS', color: colors.coral400, members: 98 },
  { name: 'Robotics', tag: 'RB', color: colors.blue800, members: 76 },
  { name: 'Eco Club', tag: 'EC', color: '#3D7B3F', members: 54 },
];

export default function Communities() {
  const insets = useSafeAreaInsets();
  const { role, profile } = useAuth();
  const [q, setQ] = useState('');
  
  // For demo: empty the appointed communities if it's the second teacher profile
  const displayedYours = profile?.name === 'Prof. Smith' ? [] : yours;
  
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surfaceAlt }} contentContainerStyle={{ paddingTop: insets.top + space.lg, paddingHorizontal: space.lg, paddingBottom: space.xxl, gap: space.lg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Eyebrow>GCEK</Eyebrow>
          <Text style={styles.h1}>Communities</Text>
        </View>
        {(role === 'teacher' || role === 'admin') && (
          <Link href="/community/event-create" asChild>
            <TouchableOpacity style={styles.createBtn}>
              <Text style={styles.createBtnText}>+ Event</Text>
            </TouchableOpacity>
          </Link>
        )}
      </View>

      <TextInput style={styles.search} value={q} onChangeText={setQ} placeholder="Search communities, events…" placeholderTextColor={colors.ink300} />

      <View>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.sm }}>
          <Eyebrow>{role === 'teacher' ? 'Appointed communities' : 'Your communities'}</Eyebrow>
          <Text style={styles.count}>{displayedYours.length}</Text>
        </View>
        <View style={{ height: space.sm }} />
        {displayedYours.length === 0 ? (
          <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: colors.ink500, fontStyle: 'italic', paddingVertical: space.md }}>
            You have not been appointed to manage any communities.
          </Text>
        ) : (
          <View style={{ gap: space.sm }}>
            {displayedYours.map(c => (
              <Link key={c.id} href={{ pathname: '/community/[id]', params: { id: c.id } }} asChild>
              <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                <Avatar tag={c.tag} color={c.color} size={44} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                    <Text style={styles.cName}>{c.name}</Text>
                    {c.unread > 0 && <View style={styles.unread}><Text style={styles.unreadText}>{c.unread}</Text></View>}
                  </View>
                  <Text style={styles.cMeta}>{c.members} members · {c.hint}</Text>
                </View>
                <Text style={styles.chev}>›</Text>
              </Card>
            </Link>
          ))}
        </View>
        )}
      </View>

      <View>
        <Eyebrow>Upcoming events</Eyebrow>
        <View style={{ height: space.sm }} />
        <Card>
          {events.map((e, i) => (
            <View key={e.id}>
              <Link href={{ pathname: '/community/event/[id]', params: { id: e.id } }} asChild>
                <View style={{ flexDirection: 'row', gap: space.md }}>
                  <View style={styles.dateBadge}>
                    <Text style={styles.dateDay}>{e.date.split(' ')[1]}</Text>
                    <Text style={styles.dateMonth}>{e.date.split(' ')[2].toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eTitle}>{e.title}</Text>
                    <Text style={styles.eMeta}>{e.org} · {e.time} · {e.location}</Text>
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                      {e.dutyOk && <Chip label="Duty leave ok" variant="duty" />}
                      <Chip label={`${e.attending} going`} variant="neutral" />
                    </View>
                  </View>
                </View>
              </Link>
              {i < events.length - 1 && <Divider style={{ marginVertical: space.md }} />}
            </View>
          ))}
        </Card>
      </View>

      {role !== 'teacher' && (
        <View>
          <Eyebrow>Discover</Eyebrow>
          <View style={{ height: space.sm }} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {discover.map(d => (
              <Card key={d.name} style={{ width: '48%', gap: space.sm }}>
                <Avatar tag={d.tag} color={d.color} size={36} />
                <Text style={styles.cName}>{d.name}</Text>
                <Text style={styles.cMeta}>{d.members} members</Text>
                <Text style={styles.join}>Join</Text>
              </Card>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function Avatar({ tag, color, size }: { tag: string; color: string; size: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: radius.md, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontFamily: fonts.monoMedium, fontSize: size * 0.32 }}>{tag}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 26, fontFamily: fonts.displayBold, color: colors.ink900, marginTop: space.xs },
  search: {
    height: 40, paddingHorizontal: 12, borderWidth: hairline, borderColor: colors.ink200,
    borderRadius: radius.sm, backgroundColor: '#fff', color: colors.ink900, fontFamily: fonts.sans, fontSize: 14,
  },
  count: { fontFamily: fonts.mono, fontSize: 11, color: colors.ink500 },
  cName: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink900 },
  cMeta: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginTop: 2 },
  chev: { fontSize: 20, color: colors.ink300 },
  unread: { backgroundColor: colors.coral400, borderRadius: 999, paddingHorizontal: 6, minWidth: 18, alignItems: 'center' },
  unreadText: { color: '#fff', fontSize: 10, fontFamily: fonts.sansMedium },
  dateBadge: { width: 48, paddingVertical: space.sm, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, alignItems: 'center', borderWidth: hairline, borderColor: colors.border },
  dateDay: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.ink900 },
  dateMonth: { fontFamily: fonts.mono, fontSize: 10, color: colors.ink500 },
  eTitle: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink900 },
  eMeta: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginTop: 2 },
  join: { fontFamily: fonts.sansMedium, fontSize: 11, color: colors.blue600 },
  createBtn: { backgroundColor: colors.blue600, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.sm },
  createBtnText: { color: '#fff', fontFamily: fonts.sansMedium, fontSize: 13 },
});
