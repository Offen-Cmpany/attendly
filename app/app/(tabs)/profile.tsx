import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Eyebrow, Divider } from '../../src/components/atoms';
import { useAuth } from '../../src/lib/auth';
import { colors, fonts, space } from '../../src/theme';

const ROLE_LABELS: Record<string, string> = {
  student: 'Student',
  teacher: 'Teacher',
  admin: 'Administrator',
};

const DESIGNATION_LABELS: Record<string, string> = {
  principal: 'Principal',
  hod: 'Head of Department',
  office_staff: 'Office Staff',
};

export default function Profile() {
  const { user, signOut, role, profile, designation } = useAuth();
  const insets = useSafeAreaInsets();

  const roleLabel = ROLE_LABELS[role] ?? role;
  const designationLabel = designation ? DESIGNATION_LABELS[designation] : null;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surfaceAlt }}
      contentContainerStyle={{
        paddingTop: insets.top + space.lg,
        paddingHorizontal: space.lg,
        paddingBottom: space.xxl,
        gap: space.lg,
      }}
    >
      <View>
        <Eyebrow>You</Eyebrow>
        <Text style={styles.h1}>{user?.name ?? 'Profile'}</Text>
        <Text style={styles.sub}>{user?.email}</Text>
      </View>

      <Card style={{ gap: space.md }}>
        <Row label="Role" value={roleLabel} />
        {designationLabel && (
          <>
            <Divider />
            <Row label="Designation" value={designationLabel} />
          </>
        )}
        {role === 'student' && (
          <>
            <Divider />
            <Row label="Reg Number" value={profile?.reg ?? '—'} />
            <Divider />
            <Row label="Program" value={profile?.program ?? '—'} />
            <Divider />
            <Row label="Department" value={profile?.dept ?? '—'} />
            <Divider />
            <Row label="Semester" value={profile?.semester?.toString() ?? '—'} />
          </>
        )}
        {role === 'teacher' && (
          <>
            <Divider />
            <Row label="Department" value={profile?.dept ?? 'CSE'} />
            <Divider />
            <Row label="Class Advisor" value={profile?.isClassAdvisor ? 'Yes' : 'No'} />
          </>
        )}
      </Card>

      {(profile?.batchId || profile?.program) && (
        <Card style={{ gap: space.md }}>
          <Eyebrow>Batch Info</Eyebrow>
          {profile?.batchId && <Row label="Batch ID" value={profile.batchId} />}
          {profile?.program && (
            <>
              <Divider />
              <Row label="Program" value={profile.program} />
            </>
          )}
        </Card>
      )}

      <Button title="Sign out" variant="secondary" onPress={signOut} />
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 24, fontFamily: fonts.displayBold, color: colors.ink900, marginTop: space.xs },
  sub: { fontSize: 13, fontFamily: fonts.sans, color: colors.ink500, marginTop: 2 },
  rowLabel: { fontSize: 13, fontFamily: fonts.sans, color: colors.ink500 },
  rowValue: { fontSize: 13, fontFamily: fonts.sansMedium, color: colors.ink900 },
});
