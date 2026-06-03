import React from 'react';
import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { colors, fonts, hairline } from '../../src/theme';
import { useAuth } from '../../src/lib/auth';

function Icon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
      <Text style={{ fontSize: 16, color: focused ? colors.blue600 : colors.ink300 }}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const { role } = useAuth();
  const isStudent = role === 'student';
  const isTeacher = role === 'teacher';
  const isAdmin = role === 'admin';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.blue600,
        tabBarInactiveTintColor: colors.ink500,
        tabBarLabelStyle: { fontFamily: fonts.sansMedium, fontSize: 11 },
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: hairline,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
      }}
    >
      {/* Home — all roles */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <Icon label="◐" focused={focused} />,
        }}
      />

      {/* Timetable — students & teachers only */}
      <Tabs.Screen
        name="timetable"
        options={{
          href: isAdmin ? null : '/timetable',
          title: 'Timetable',
          tabBarIcon: ({ focused }) => <Icon label="▦" focused={focused} />,
        }}
      />

      {/* Communities — students & teachers only */}
      <Tabs.Screen
        name="communities"
        options={{
          href: isAdmin ? null : '/communities',
          title: 'Communities',
          tabBarIcon: ({ focused }) => <Icon label="◇" focused={focused} />,
        }}
      />

      {/* Forms — students only (teachers manage forms under subjects) */}
      <Tabs.Screen
        name="forms"
        options={{
          href: isStudent ? '/forms' : null,
          title: 'Forms',
          tabBarIcon: ({ focused }) => <Icon label="☰" focused={focused} />,
        }}
      />

      {/* Manage — admin only */}
      <Tabs.Screen
        name="manage"
        options={{
          href: isAdmin ? '/manage' : null,
          title: 'Manage',
          tabBarIcon: ({ focused }) => <Icon label="⊞" focused={focused} />,
        }}
      />

      {/* Approvals — teachers & admin */}
      <Tabs.Screen
        name="approvals"
        options={{
          href: isStudent ? null : '/approvals',
          title: 'Approvals',
          tabBarIcon: ({ focused }) => <Icon label="✓" focused={focused} />,
        }}
      />

      {/* Reports — admin & teachers */}
      <Tabs.Screen
        name="reports"
        options={{
          href: isAdmin || isTeacher ? '/reports' : null,
          title: 'Reports',
          tabBarIcon: ({ focused }) => <Icon label="◎" focused={focused} />,
        }}
      />

      {/* Profile — all roles */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <Icon label="○" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
