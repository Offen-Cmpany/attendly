import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, radius, hairline } from '../../src/theme';
import { useAuth } from '../../src/lib/auth';
import { createEvent, EventType } from '../../src/lib/db';

const EVENT_TYPES: { key: EventType; label: string; emoji: string }[] = [
  { key: 'meeting', label: 'Meeting', emoji: '👥' },
  { key: 'workshop', label: 'Workshop', emoji: '🛠️' },
  { key: 'competition', label: 'Competition', emoji: '🏆' },
  { key: 'cultural', label: 'Cultural', emoji: '🎭' },
  { key: 'other', label: 'Other', emoji: '📅' },
];

export default function EventCreate() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState<EventType>('meeting');
  const [dutyOk, setDutyOk] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || !date.trim() || !time.trim()) {
      return Alert.alert('Required Fields', 'Please fill in title, date, and time.');
    }
    setSaving(true);
    try {
      await createEvent({
        communityId: 'ie', // using IEEE as mock default
        title: title.trim(),
        description: description.trim(),
        type,
        date: new Date(`${date}T${time}`).toISOString(), // Simplified date parsing
        location: location.trim(),
        isDutyLeaveEligible: dutyOk,
        organizerId: user?.id ?? 'demo',
      });
      Alert.alert('Success', 'Event created successfully!');
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to create event. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Event</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleCreate} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Publish'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Event Title</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Hackstorm 2026" placeholderTextColor={colors.ink300} />

        <Text style={styles.label}>Description (optional)</Text>
        <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="What is this event about?" placeholderTextColor={colors.ink300} multiline numberOfLines={3} />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Date</Text>
            <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor={colors.ink300} />
          </View>
          <View style={{ width: spacing.md }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Time</Text>
            <TextInput style={styles.input} value={time} onChangeText={setTime} placeholder="14:30" placeholderTextColor={colors.ink300} />
          </View>
        </View>

        <Text style={styles.label}>Location</Text>
        <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="e.g. Main Auditorium" placeholderTextColor={colors.ink300} />

        <Text style={styles.label}>Event Type</Text>
        <View style={styles.typeRow}>
          {EVENT_TYPES.map(t => (
            <TouchableOpacity key={t.key} style={[styles.typeChip, type === t.key && styles.typeChipActive]} onPress={() => setType(t.key)}>
              <Text style={styles.typeEmoji}>{t.emoji}</Text>
              <Text style={[styles.typeLabel, type === t.key && styles.typeLabelActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchTitle}>Duty Leave Eligible</Text>
            <Text style={styles.switchDesc}>Students can claim duty leave for attending</Text>
          </View>
          <Switch value={dutyOk} onValueChange={setDutyOk} trackColor={{ true: colors.blue600 }} />
        </View>

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
  saveBtn: { backgroundColor: colors.blue600, paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.sm },
  saveBtnText: { fontFamily: fonts.sansMedium, fontSize: 13, color: '#fff' },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md },
  label: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginBottom: 6, marginTop: spacing.md },
  input: {
    paddingHorizontal: 12, paddingVertical: 10, borderWidth: hairline, borderColor: colors.border,
    borderRadius: radius.sm, backgroundColor: '#fff', fontFamily: fonts.sans, fontSize: 14, color: colors.ink900,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },

  typeRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: '#fff' },
  typeChipActive: { borderColor: colors.blue600, backgroundColor: '#EBF2FB' },
  typeEmoji: { fontSize: 16 },
  typeLabel: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink500 },
  typeLabelActive: { color: colors.blue600 },

  switchRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', padding: spacing.md, borderRadius: radius.md,
    borderWidth: hairline, borderColor: colors.border, marginTop: spacing.xl,
  },
  switchTitle: { fontFamily: fonts.sansMedium, fontSize: 15, color: colors.ink900 },
  switchDesc: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginTop: 2 },
});
