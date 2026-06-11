import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, space, hairline, radius } from '../src/theme';
import { Button, Eyebrow, Card } from '../src/components/atoms';
import { useAuth } from '../src/lib/auth';
import { listProgramOutcomes, upsertProgramOutcome, deleteProgramOutcome, ProgramOutcome } from '../src/lib/obe';

const PROGRAMS = ['B.Tech CSE', 'B.Tech CSE & AI', 'BCA'];

export default function ManageOutcomesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { role } = useAuth();
  
  const [selectedProgram, setSelectedProgram] = useState(PROGRAMS[0]);
  const [outcomes, setOutcomes] = useState<ProgramOutcome[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [poCode, setPoCode] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadOutcomes();
  }, [selectedProgram]);

  const loadOutcomes = async () => {
    setLoading(true);
    try {
      const data = await listProgramOutcomes(selectedProgram);
      setOutcomes(data);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!poCode || !description) {
      Alert.alert('Validation Error', 'Please fill all fields');
      return;
    }
    try {
      await upsertProgramOutcome({
        id: editingId || undefined,
        program: selectedProgram,
        poCode,
        description,
      });
      setPoCode('');
      setDescription('');
      setEditingId(null);
      await loadOutcomes();
    } catch (e: any) {
      Alert.alert('Save Failed', e.message);
    }
  };

  const handleEdit = (po: ProgramOutcome) => {
    setEditingId(po.id);
    setPoCode(po.poCode);
    setDescription(po.description);
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this program outcome? This may cascade and delete associated CO-PO mappings.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteProgramOutcome(id);
          await loadOutcomes();
        } catch (e: any) {
          Alert.alert('Delete Failed', e.message);
        }
      }}
    ]);
  };

  if (role !== 'admin') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontFamily: fonts.sans, color: colors.ink500 }}>Access Denied.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surfaceAlt }} contentContainerStyle={[{ paddingTop: insets.top + space.md, paddingHorizontal: space.lg, paddingBottom: space.xxl, gap: space.lg }, isDesktop && { maxWidth: 720, alignSelf: 'center' as const, width: '100%', paddingHorizontal: 32 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ paddingVertical: space.sm }}>
          <Text style={{ fontFamily: fonts.sansMedium, color: colors.blue600 }}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View>
        <Text style={styles.h1}>Program Outcomes</Text>
        <Text style={{ fontFamily: fonts.sans, color: colors.ink500, marginTop: space.xs }}>Define global POs and PSOs for each academic program.</Text>
      </View>

      <View>
        <Eyebrow>1. Select Program</Eyebrow>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm, marginTop: space.sm }}>
          {PROGRAMS.map(p => (
            <TouchableOpacity key={p} onPress={() => setSelectedProgram(p)} style={[styles.tabBtn, selectedProgram === p && styles.tabBtnActive]}>
              <Text style={[styles.tabBtnText, selectedProgram === p && styles.tabBtnTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View>
        <Eyebrow>2. Manage Outcomes for {selectedProgram}</Eyebrow>
        <Card style={{ marginTop: space.sm, gap: space.md }}>
          <Text style={{ fontFamily: fonts.sansMedium, fontSize: 16, color: colors.ink900 }}>
            {editingId ? 'Edit Outcome' : 'Add New Outcome'}
          </Text>
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <TextInput
              style={[styles.input, { width: 80 }]}
              placeholder="Code (e.g. PO1)"
              value={poCode}
              onChangeText={setPoCode}
              placeholderTextColor={colors.ink300}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              placeholderTextColor={colors.ink300}
            />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: space.md }}>
            {editingId && (
              <Button title="Cancel" size="sm" variant="secondary" onPress={() => { setEditingId(null); setPoCode(''); setDescription(''); }} />
            )}
            <Button title={editingId ? 'Update PO' : 'Add PO'} size="sm" onPress={handleSave} />
          </View>
        </Card>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.blue600} style={{ margin: space.xl }} />
      ) : outcomes.length === 0 ? (
        <Card style={{ alignItems: 'center', padding: space.xl }}>
          <Text style={{ fontFamily: fonts.sans, color: colors.ink500 }}>No Program Outcomes defined for {selectedProgram}.</Text>
        </Card>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {outcomes.map((po, i) => (
            <View key={po.id} style={{ padding: space.md, borderBottomWidth: i < outcomes.length - 1 ? hairline : 0, borderColor: colors.border, flexDirection: 'row' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonts.displayBold, fontSize: 14, color: colors.ink900 }}>{po.poCode}</Text>
                <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: colors.ink700, marginTop: 4 }}>{po.description}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'flex-start', paddingLeft: space.md }}>
                <TouchableOpacity onPress={() => handleEdit(po)}>
                  <Text style={{ fontFamily: fonts.sansMedium, color: colors.blue600, fontSize: 12 }}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(po.id)}>
                  <Text style={{ fontFamily: fonts.sansMedium, color: colors.coral600, fontSize: 12 }}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  h1: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.ink900 },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.pill, backgroundColor: '#fff', borderWidth: hairline, borderColor: colors.border },
  tabBtnActive: { backgroundColor: colors.ink900, borderColor: colors.ink900 },
  tabBtnText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink700 },
  tabBtnTextActive: { color: '#fff' },
  input: { borderWidth: hairline, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: space.md, height: 44, backgroundColor: '#fff', fontFamily: fonts.sans, fontSize: 14, color: colors.ink900 },
});
