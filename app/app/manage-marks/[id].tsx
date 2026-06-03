import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput, Switch, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, space, hairline, radius } from '../../src/theme';
import { Button, Eyebrow, Card } from '../../src/components/atoms';
import { supabase } from '../../src/lib/supabase';
import { getCourseDuration, listStudentsByBatch, saveMarks, getSettings, CourseDuration, Profile, Setting } from '../../src/lib/db';
import { 
  listCourseOutcomes, upsertCourseOutcome, deleteCourseOutcome, CourseOutcome,
  listProgramOutcomes, ProgramOutcome,
  listCoPoMappings, upsertCoPoMappings, CoPoMapping,
  listUniversityMarks, upsertUniversityMarks, UniversityMark
} from '../../src/lib/obe';

type TabType = 'Internal' | 'COs' | 'Mapping' | 'University';

export default function ManageMarksScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  
  const [cd, setCd] = useState<CourseDuration | null>(null);
  const [students, setStudents] = useState<Profile[]>([]);
  const [settings, setSettings] = useState<Setting | null>(null);
  
  const [activeTab, setActiveTab] = useState<TabType>('Internal');
  const [loading, setLoading] = useState(true);

  // --- Internal Marks State ---
  const [selectedSeries, setSelectedSeries] = useState(1);
  const [maxMarks, setMaxMarks] = useState('50');
  const [marksMap, setMarksMap] = useState<Record<string, string>>({});
  const [savingInternal, setSavingInternal] = useState(false);

  // --- Course Outcomes State ---
  const [cos, setCos] = useState<CourseOutcome[]>([]);
  const [coCode, setCoCode] = useState('');
  const [coDesc, setCoDesc] = useState('');
  const [editingCoId, setEditingCoId] = useState<string | null>(null);

  // --- CO-PO Mapping State ---
  const [pos, setPos] = useState<ProgramOutcome[]>([]);
  const [mappings, setMappings] = useState<Record<string, Record<string, string>>>({}); // coId -> poId -> level string
  const [savingMapping, setSavingMapping] = useState(false);

  // --- University Marks State ---
  const [uniMarksMap, setUniMarksMap] = useState<Record<string, Partial<UniversityMark>>>({});
  const [savingUni, setSavingUni] = useState(false);

  useEffect(() => {
    Promise.all([
      getCourseDuration(id as string),
      getSettings()
    ]).then(([courseDur, s]) => {
      setCd(courseDur);
      setSettings(s);
      if (courseDur) {
        listStudentsByBatch(courseDur.batchId).then(setStudents);
        // Load OBE Data
        Promise.all([
          listCourseOutcomes(courseDur.id),
          listProgramOutcomes(courseDur.program || ''),
          listCoPoMappings(courseDur.id),
          listUniversityMarks(courseDur.id)
        ]).then(([cosData, posData, mapData, uniData]) => {
          setCos(cosData);
          setPos(posData);
          
          // Build mapping dictionary
          const dict: Record<string, Record<string, string>> = {};
          mapData.forEach(m => {
            if (!dict[m.courseOutcomeId]) dict[m.courseOutcomeId] = {};
            dict[m.courseOutcomeId][m.programOutcomeId] = m.correlationLevel.toString();
          });
          setMappings(dict);

          // Build uni marks dictionary
          const uniDict: Record<string, Partial<UniversityMark>> = {};
          uniData.forEach(u => {
            uniDict[u.studentId] = u;
          });
          setUniMarksMap(uniDict);
        });
      }
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (cd && selectedSeries && activeTab === 'Internal') {
      supabase
        .from('marks')
        .select('student_id, marks_obtained, max_marks')
        .eq('course_duration_id', cd.id)
        .eq('series_number', selectedSeries)
        .then(({ data, error }) => {
          if (!error && data) {
            const m: Record<string, string> = {};
            data.forEach((d: any) => {
              m[d.student_id] = d.marks_obtained.toString();
              if (d.max_marks) setMaxMarks(d.max_marks.toString());
            });
            setMarksMap(m);
          } else {
            setMarksMap({});
          }
        });
    }
  }, [cd, selectedSeries, activeTab]);

  // --- Handlers ---

  const handleSaveInternal = async () => {
    if (!cd) return;
    const max = parseInt(maxMarks);
    if (isNaN(max) || max <= 0) return Alert.alert('Invalid', 'Valid max marks required.');

    const entries = students.map(st => {
      const val = parseInt(marksMap[st.id] || '');
      return !isNaN(val) ? { studentId: st.id, marksObtained: val } : null;
    }).filter(Boolean) as any[];

    if (entries.length === 0) return Alert.alert('No data', 'Enter marks for at least one student.');
    if (entries.some(e => e.marksObtained > max)) return Alert.alert('Invalid', 'Marks cannot exceed max marks.');

    setSavingInternal(true);
    try {
      await saveMarks(cd.batchId, cd.id, selectedSeries, max, entries);
      Alert.alert('Success', 'Internal Marks saved.');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSavingInternal(false);
    }
  };

  const handleSaveCo = async () => {
    if (!cd || !coCode || !coDesc) return;
    try {
      await upsertCourseOutcome({
        id: editingCoId || undefined,
        courseDurationId: cd.id,
        coCode,
        description: coDesc
      });
      setCoCode(''); setCoDesc(''); setEditingCoId(null);
      setCos(await listCourseOutcomes(cd.id));
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleDeleteCo = (coId: string) => {
    Alert.alert('Delete', 'Delete this Course Outcome?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteCourseOutcome(coId);
        setCos(await listCourseOutcomes(cd!.id));
      }}
    ]);
  };

  const handleSaveMapping = async () => {
    const mapsToSave: CoPoMapping[] = [];
    Object.entries(mappings).forEach(([coId, poDict]) => {
      Object.entries(poDict).forEach(([poId, lvlStr]) => {
        const lvl = parseInt(lvlStr);
        if ([1, 2, 3].includes(lvl)) {
          mapsToSave.push({ courseOutcomeId: coId, programOutcomeId: poId, correlationLevel: lvl });
        }
      });
    });
    if (mapsToSave.length === 0) return Alert.alert('No Data', 'No valid correlation levels (1, 2, 3) found.');
    
    setSavingMapping(true);
    try {
      await upsertCoPoMappings(mapsToSave);
      Alert.alert('Success', 'CO-PO Mapping saved.');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSavingMapping(false);
    }
  };

  const handleSaveUniMarks = async () => {
    if (!cd) return;
    const toSave: Partial<UniversityMark>[] = [];
    students.forEach(st => {
      const u = uniMarksMap[st.id];
      if (u && u.grade && u.gradePoints !== undefined) {
        toSave.push({ ...u, studentId: st.id, courseDurationId: cd.id, passed: u.passed ?? true });
      }
    });

    if (toSave.length === 0) return Alert.alert('No Data', 'Enter university marks for at least one student.');
    
    setSavingUni(true);
    try {
      await upsertUniversityMarks(toSave);
      Alert.alert('Success', 'University Marks saved.');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSavingUni(false);
    }
  };

  if (loading) return <ActivityIndicator color={colors.blue600} style={{ flex: 1, justifyContent: 'center' }} />;
  if (!cd) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Course not found.</Text></View>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surfaceAlt }} contentContainerStyle={[{ paddingTop: insets.top + space.md, paddingHorizontal: space.lg, paddingBottom: space.xxl, gap: space.lg }, isDesktop && { maxWidth: 720, alignSelf: 'center' as const, width: '100%', paddingHorizontal: 32 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ paddingVertical: space.sm }}>
          <Text style={{ fontFamily: fonts.sansMedium, color: colors.blue600 }}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View>
        <Text style={styles.h1}>Manage Records</Text>
        <Text style={{ fontFamily: fonts.sansMedium, color: colors.blue600, marginTop: space.xs }}>{cd.courseName} ({cd.batchName})</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
        {(['Internal', 'COs', 'Mapping', 'University'] as TabType[]).map(t => (
          <TouchableOpacity key={t} onPress={() => setActiveTab(t)} style={[styles.tabBtn, activeTab === t && styles.tabBtnActive]}>
            <Text style={[styles.tabBtnText, activeTab === t && styles.tabBtnTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* --- Internal Marks Tab --- */}
      {activeTab === 'Internal' && (
        <View style={{ gap: space.lg }}>
          <View>
            <Eyebrow>1. Select Series</Eyebrow>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm, marginTop: space.sm }}>
              {Array.from({ length: settings?.totalSeriesExams || 2 }).map((_, i) => (
                <TouchableOpacity key={i} onPress={() => setSelectedSeries(i + 1)} style={[styles.subTabBtn, selectedSeries === i + 1 && styles.subTabBtnActive]}>
                  <Text style={[styles.subTabBtnText, selectedSeries === i + 1 && styles.subTabBtnTextActive]}>Series {i + 1}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.sm }}>
              <Eyebrow>2. Enter Marks</Eyebrow>
              <Button title={savingInternal ? 'Saving...' : 'Save Marks'} size="sm" onPress={handleSaveInternal} disabled={savingInternal} />
            </View>
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceAlt, padding: space.md, borderBottomWidth: hairline, borderColor: colors.border, alignItems: 'center' }}>
                <Text style={{ flex: 1, fontFamily: fonts.sansMedium, color: colors.ink900 }}>Student</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
                  <Text style={{ fontFamily: fonts.sansMedium, fontSize: 12, color: colors.ink500 }}>Max:</Text>
                  <TextInput style={styles.inputSmall} value={maxMarks} onChangeText={setMaxMarks} keyboardType="number-pad" />
                </View>
              </View>
              {students.map((st, i) => (
                <View key={st.id} style={{ flexDirection: 'row', alignItems: 'center', padding: space.md, borderBottomWidth: i < students.length - 1 ? hairline : 0, borderColor: colors.border }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink900 }}>{st.name}</Text>
                    <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.ink500 }}>{st.reg || 'No Reg'}</Text>
                  </View>
                  <TextInput
                    style={styles.inputMedium}
                    placeholder="-"
                    value={marksMap[st.id] || ''}
                    onChangeText={(val) => setMarksMap(prev => ({ ...prev, [st.id]: val }))}
                    keyboardType="number-pad"
                  />
                </View>
              ))}
            </Card>
          </View>
        </View>
      )}

      {/* --- Course Outcomes Tab --- */}
      {activeTab === 'COs' && (
        <View style={{ gap: space.lg }}>
          <View>
            <Eyebrow>Define Course Outcomes</Eyebrow>
            <Card style={{ marginTop: space.sm, gap: space.md }}>
              <View style={{ flexDirection: 'row', gap: space.sm }}>
                <TextInput style={[styles.inputLarge, { width: 80 }]} placeholder="CO1" value={coCode} onChangeText={setCoCode} />
                <TextInput style={[styles.inputLarge, { flex: 1 }]} placeholder="Outcome Description" value={coDesc} onChangeText={setCoDesc} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: space.md }}>
                {editingCoId && <Button title="Cancel" size="sm" variant="secondary" onPress={() => { setEditingCoId(null); setCoCode(''); setCoDesc(''); }} />}
                <Button title={editingCoId ? 'Update CO' : 'Add CO'} size="sm" onPress={handleSaveCo} />
              </View>
            </Card>
          </View>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {cos.length === 0 ? (
              <Text style={{ padding: space.xl, textAlign: 'center', color: colors.ink500 }}>No Course Outcomes defined.</Text>
            ) : cos.map((co, i) => (
              <View key={co.id} style={{ padding: space.md, borderBottomWidth: i < cos.length - 1 ? hairline : 0, borderColor: colors.border, flexDirection: 'row' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: fonts.displayBold, fontSize: 14, color: colors.ink900 }}>{co.coCode}</Text>
                  <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: colors.ink700, marginTop: 2 }}>{co.description}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
                  <TouchableOpacity onPress={() => { setEditingCoId(co.id); setCoCode(co.coCode); setCoDesc(co.description); }}>
                    <Text style={{ fontFamily: fonts.sansMedium, color: colors.blue600, fontSize: 12 }}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteCo(co.id)}>
                    <Text style={{ fontFamily: fonts.sansMedium, color: colors.coral600, fontSize: 12 }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </Card>
        </View>
      )}

      {/* --- CO-PO Mapping Tab --- */}
      {activeTab === 'Mapping' && (
        <View style={{ gap: space.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Eyebrow>CO-PO Correlation Matrix (1=Low, 2=Med, 3=High)</Eyebrow>
            <Button title={savingMapping ? 'Saving...' : 'Save Matrix'} size="sm" onPress={handleSaveMapping} disabled={savingMapping} />
          </View>
          {cos.length === 0 || pos.length === 0 ? (
            <Card><Text style={{ color: colors.ink500 }}>Please define both Course Outcomes and Program Outcomes first.</Text></Card>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <Card style={{ padding: 0 }}>
                <View style={{ flexDirection: 'row', borderBottomWidth: hairline, borderColor: colors.border, backgroundColor: colors.surfaceAlt }}>
                  <View style={{ width: 60, padding: space.sm, borderRightWidth: hairline, borderColor: colors.border }} />
                  {pos.map(po => (
                    <View key={po.id} style={{ width: 60, padding: space.sm, alignItems: 'center' }}>
                      <Text style={{ fontFamily: fonts.sansMedium, fontSize: 12, color: colors.ink900 }}>{po.poCode}</Text>
                    </View>
                  ))}
                </View>
                {cos.map(co => (
                  <View key={co.id} style={{ flexDirection: 'row', borderBottomWidth: hairline, borderColor: colors.border }}>
                    <View style={{ width: 60, padding: space.sm, borderRightWidth: hairline, borderColor: colors.border, justifyContent: 'center' }}>
                      <Text style={{ fontFamily: fonts.displayBold, fontSize: 12, color: colors.ink900 }}>{co.coCode}</Text>
                    </View>
                    {pos.map(po => (
                      <View key={po.id} style={{ width: 60, padding: 4, alignItems: 'center', justifyContent: 'center' }}>
                        <TextInput
                          style={styles.matrixInput}
                          placeholder="-"
                          keyboardType="number-pad"
                          maxLength={1}
                          value={mappings[co.id]?.[po.id] || ''}
                          onChangeText={(v) => {
                            setMappings(prev => ({
                              ...prev,
                              [co.id]: { ...(prev[co.id] || {}), [po.id]: v }
                            }));
                          }}
                        />
                      </View>
                    ))}
                  </View>
                ))}
              </Card>
            </ScrollView>
          )}
        </View>
      )}

      {/* --- University Exams Tab --- */}
      {activeTab === 'University' && (
        <View style={{ gap: space.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Eyebrow>University Grades</Eyebrow>
            <Button title={savingUni ? 'Saving...' : 'Save Grades'} size="sm" onPress={handleSaveUniMarks} disabled={savingUni} />
          </View>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceAlt, padding: space.md, borderBottomWidth: hairline, borderColor: colors.border }}>
              <Text style={{ flex: 1, fontFamily: fonts.sansMedium, color: colors.ink900 }}>Student</Text>
              <Text style={{ width: 60, fontFamily: fonts.sansMedium, color: colors.ink900, textAlign: 'center' }}>Grade</Text>
              <Text style={{ width: 60, fontFamily: fonts.sansMedium, color: colors.ink900, textAlign: 'center' }}>Points</Text>
              <Text style={{ width: 60, fontFamily: fonts.sansMedium, color: colors.ink900, textAlign: 'center' }}>Pass</Text>
            </View>
            {students.map((st, i) => (
              <View key={st.id} style={{ flexDirection: 'row', alignItems: 'center', padding: space.md, borderBottomWidth: i < students.length - 1 ? hairline : 0, borderColor: colors.border }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink900 }}>{st.name}</Text>
                  <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.ink500 }}>{st.reg || 'No Reg'}</Text>
                </View>
                <TextInput
                  style={[styles.inputMedium, { width: 50, marginRight: space.sm }]}
                  placeholder="e.g. A+"
                  autoCapitalize="characters"
                  value={uniMarksMap[st.id]?.grade || ''}
                  onChangeText={(v) => setUniMarksMap(prev => ({ ...prev, [st.id]: { ...prev[st.id], grade: v } }))}
                />
                <TextInput
                  style={[styles.inputMedium, { width: 50, marginRight: space.sm }]}
                  placeholder="10"
                  keyboardType="number-pad"
                  value={uniMarksMap[st.id]?.gradePoints?.toString() || ''}
                  onChangeText={(v) => setUniMarksMap(prev => ({ ...prev, [st.id]: { ...prev[st.id], gradePoints: parseInt(v) || 0 } }))}
                />
                <View style={{ width: 60, alignItems: 'center' }}>
                  <Switch
                    value={uniMarksMap[st.id]?.passed ?? true}
                    onValueChange={(v) => setUniMarksMap(prev => ({ ...prev, [st.id]: { ...prev[st.id], passed: v } }))}
                  />
                </View>
              </View>
            ))}
          </Card>
        </View>
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
  subTabBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt, borderWidth: hairline, borderColor: colors.border },
  subTabBtnActive: { backgroundColor: colors.blue600, borderColor: colors.blue600 },
  subTabBtnText: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.ink700 },
  subTabBtnTextActive: { color: '#fff' },
  inputSmall: { width: 40, height: 28, borderWidth: hairline, borderColor: colors.border, borderRadius: radius.sm, textAlign: 'center', backgroundColor: '#fff', fontFamily: fonts.sansMedium, color: colors.ink900, fontSize: 12 },
  inputMedium: { width: 50, height: 36, borderWidth: hairline, borderColor: colors.border, borderRadius: radius.sm, textAlign: 'center', backgroundColor: '#fff', fontFamily: fonts.sansMedium, color: colors.ink900, fontSize: 14 },
  inputLarge: { height: 44, borderWidth: hairline, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: space.md, backgroundColor: '#fff', fontFamily: fonts.sans, fontSize: 14, color: colors.ink900 },
  matrixInput: { width: 40, height: 36, borderWidth: hairline, borderColor: colors.border, borderRadius: radius.sm, textAlign: 'center', backgroundColor: '#fff', fontFamily: fonts.sansMedium, color: colors.ink900, fontSize: 14 },
});
