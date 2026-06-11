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
  const isAdmin = role === 'admin';
  const isTeacher = role === 'teacher';

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

      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ focused }) => <Icon label="✦" focused={focused} />,
        }}
      />

      {/* Classes — teacher only */}
      <Tabs.Screen
        name="classes"
        options={{
          href: isTeacher ? '/classes' : null,
          title: 'Subjects',
          tabBarIcon: ({ focused }) => <Icon label="📚" focused={focused} />,
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

      {/* Reports — admin and teacher only */}
      <Tabs.Screen
        name="reports"
        options={{
          href: (isAdmin || isTeacher) ? '/reports' : null,
          title: 'Reports',
          tabBarIcon: ({ focused }) => <Icon label="📊" focused={focused} />,
        }}
      />

      {/* Calendar — admin and teacher only */}
      <Tabs.Screen
        name="calendar"
        options={{
          href: (isAdmin || isTeacher) ? '/calendar' : null,
          title: 'Calendar',
          tabBarIcon: ({ focused }) => <Icon label="📅" focused={focused} />,
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
