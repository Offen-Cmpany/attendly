import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, space, hairline, radius } from '../../src/theme';
import { Button, Eyebrow, Card } from '../../src/components/atoms';
import { supabase } from '../../src/lib/supabase';
import { AttendanceRecord, AttendanceEntry } from '../../src/lib/db';

export default function EditAttendanceScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  
  const [entries, setEntries] = useState<(AttendanceEntry & { profiles: { name: string, reg: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch all attendance records for this course duration
    supabase
      .from('attendance_records')
      .select('id, session_date, topic, course_duration_id')
      .eq('course_duration_id', id)
      .order('session_date', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setRecords(data as any);
        }
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (selectedRecordId) {
      setLoading(true);
      supabase
        .from('attendance_entries')
        .select('id, attendance_record_id, student_id, status, profiles(name, reg)')
        .eq('attendance_record_id', selectedRecordId)
        .order('profiles(name)', { ascending: true })
        .then(({ data, error }) => {
          if (!error && data) {
            setEntries(data as any);
          }
          setLoading(false);
        });
    } else {
      setEntries([]);
    }
  }, [selectedRecordId]);

  const toggleStatus = (entryId: string) => {
    setEntries(prev => prev.map(e => {
      if (e.id === entryId) {
        return { ...e, status: e.status === 'present' ? 'absent' : 'present' };
      }
      return e;
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {


      const rowsToUpdate = entries.map(e => ({
        id: e.id,
        attendance_record_id: (e as any).attendance_record_id || e.attendanceRecordId,
        student_id: (e as any).student_id || e.studentId,
        status: e.status
      }));

      const { error } = await supabase.from('attendance_entries').upsert(rowsToUpdate, { onConflict: 'id' });
      if (error) throw error;
      
      Alert.alert('Success', 'Attendance updated successfully.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update attendance.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surfaceAlt }} contentContainerStyle={{ paddingTop: insets.top + space.md, paddingHorizontal: space.lg, paddingBottom: space.xxl, gap: space.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ paddingVertical: space.sm }}>
          <Text style={{ fontFamily: fonts.sansMedium, color: colors.blue600 }}>← Back</Text>
        </TouchableOpacity>
        {selectedRecordId && entries.length > 0 && (
          <Button title={saving ? 'Saving...' : 'Update Records'} size="sm" onPress={handleSave} disabled={saving} />
        )}
      </View>

      <View>
        <Text style={styles.h1}>Edit Attendance</Text>
        <Text style={{ fontFamily: fonts.sans, color: colors.ink500, marginTop: space.xs }}>Select a past session to modify attendance.</Text>
      </View>

      {loading && !selectedRecordId ? (
        <ActivityIndicator color={colors.blue600} style={{ margin: space.xl }} />
      ) : records.length === 0 ? (
        <Card>
          <Text style={{ fontFamily: fonts.sans, color: colors.ink500, textAlign: 'center' }}>No past attendance records found for this course.</Text>
        </Card>
      ) : (
        <View>
          <Eyebrow>1. Select Session</Eyebrow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm, marginTop: space.sm }}>
            {records.map(rec => (
              <TouchableOpacity key={rec.id} onPress={() => setSelectedRecordId(rec.id)} style={[styles.tabBtn, selectedRecordId === rec.id && styles.tabBtnActive]}>
                <Text style={[styles.tabBtnText, selectedRecordId === rec.id && styles.tabBtnTextActive]}>
                  {new Date((rec as any).session_date || rec.sessionDate || '').toLocaleDateString()} {rec.topic ? `- ${rec.topic}` : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {loading && selectedRecordId ? (
        <ActivityIndicator color={colors.blue600} style={{ margin: space.xl }} />
      ) : entries.length > 0 ? (
        <View>
          <Eyebrow>2. Edit Students</Eyebrow>
          <Card style={{ padding: 0, overflow: 'hidden', marginTop: space.sm }}>
            <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceAlt, padding: space.md, borderBottomWidth: hairline, borderColor: colors.border }}>
              <Text style={{ flex: 1, fontFamily: fonts.sansMedium, color: colors.ink900 }}>Student</Text>
              <Text style={{ width: 80, fontFamily: fonts.sansMedium, color: colors.ink900, textAlign: 'right' }}>Status</Text>
            </View>
            {entries.map((e, i) => (
              <TouchableOpacity key={e.id} onPress={() => toggleStatus(e.id)} style={{ flexDirection: 'row', alignItems: 'center', padding: space.md, borderBottomWidth: i < entries.length - 1 ? hairline : 0, borderColor: colors.border }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink900 }}>{e.profiles?.name}</Text>
                  <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.ink500, marginTop: 2 }}>{e.profiles?.reg || 'No Reg'}</Text>
                </View>
                <View style={{ width: 80, alignItems: 'flex-end' }}>
                  <Text style={{ fontFamily: fonts.displayBold, fontSize: 12, color: e.status === 'present' ? colors.blue600 : colors.coral600 }}>
                    {e.status === 'present' ? 'PRESENT' : 'ABSENT'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </Card>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  h1: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.ink900 },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.pill, backgroundColor: '#fff', borderWidth: hairline, borderColor: colors.border },
  tabBtnActive: { backgroundColor: colors.ink900, borderColor: colors.ink900 },
  tabBtnText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink700 },
  tabBtnTextActive: { color: '#fff' },
});
