import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, radius, space, fonts, hairline } from '../theme';

type ChipVariant = 'safe' | 'warn' | 'risk' | 'duty' | 'streak' | 'neutral';
const chipColors: Record<ChipVariant, { bg: string; fg: string }> = {
  safe: { bg: colors.safeBg, fg: colors.safeFg },
  warn: { bg: colors.warnBg, fg: colors.warnFg },
  risk: { bg: colors.riskBg, fg: colors.riskFg },
  duty: { bg: colors.blue50, fg: colors.blue900 },
  streak: { bg: colors.coral50, fg: colors.coral900 },
  neutral: { bg: colors.neutralBg, fg: colors.neutralFg },
};

export function Chip({ label, variant = 'neutral', dot }: { label: string; variant?: ChipVariant; dot?: boolean }) {
  const c = chipColors[variant];
  return (
    <View style={[styles.chip, { backgroundColor: c.bg }]}>
      {dot && <View style={[styles.dot, { backgroundColor: c.fg }]} />}
      <Text style={[styles.chipText, { color: c.fg }]}>{label}</Text>
    </View>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <Text style={styles.eyebrow}>{String(children).toUpperCase()}</Text>;
}

type BtnVariant = 'primary' | 'secondary' | 'accent' | 'ghost';
export function Button({
  title, onPress, variant = 'primary', size, style, disabled
}: { title: string; onPress?: () => void; variant?: BtnVariant; size?: 'sm'; style?: ViewStyle, disabled?: boolean }) {
  const v = btnStyles[variant];
  return (
    <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.btn, v.container, size === 'sm' && styles.btnSm, pressed && { opacity: 0.85 }, disabled && { opacity: 0.5 }, style]}>
      <Text style={[styles.btnText, v.text, size === 'sm' && { fontSize: 13 }]}>{title}</Text>
    </Pressable>
  );
}

const btnStyles: Record<BtnVariant, { container: ViewStyle; text: TextStyle }> = {
  primary: { container: { backgroundColor: colors.blue600 }, text: { color: '#fff' } },
  secondary: { container: { backgroundColor: 'transparent', borderWidth: hairline, borderColor: colors.blue600 }, text: { color: colors.blue600 } },
  accent: { container: { backgroundColor: colors.coral400 }, text: { color: '#fff' } },
  ghost: { container: { backgroundColor: 'transparent' }, text: { color: colors.ink500 } },
};

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Divider({ style }: { style?: ViewStyle }) {
  return <View style={[styles.divider, style]} />;
}

export function Progress({ value, color = colors.blue600 }: { value: number; color?: string }) {
  return (
    <View style={styles.progress}>
      <View style={{ width: `${Math.min(100, Math.max(0, value))}%`, height: '100%', backgroundColor: color, borderRadius: 999 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.pill, alignSelf: 'flex-start',
  },
  chipText: { fontSize: 12, fontFamily: fonts.sansMedium },
  dot: { width: 6, height: 6, borderRadius: 999 },
  eyebrow: { fontSize: 11, fontFamily: fonts.sansMedium, letterSpacing: 0.3, color: colors.ink500 },
  btn: {
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  btnSm: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.sm },
  btnText: { fontSize: 14, fontFamily: fonts.sansMedium },
  card: {
    backgroundColor: colors.surface, borderWidth: hairline, borderColor: colors.border,
    borderRadius: radius.lg, padding: space.lg,
  },
  divider: { height: hairline, backgroundColor: colors.border },
  progress: { height: 8, borderRadius: 999, backgroundColor: '#f0efe9', overflow: 'hidden' },
});
