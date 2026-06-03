import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, spacing, radius } from '../src/theme';
import { useAuth } from '../src/lib/auth';
import type { Role, AdminDesignation } from '../src/lib/db';

type Step = 'role' | 'designation';

export default function OnboardingScreen() {
  const { completeOnboarding } = useAuth();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const [step, setStep] = useState<Step>('role');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedDesignation, setSelectedDesignation] = useState<AdminDesignation | null>(null);
  const [saving, setSaving] = useState(false);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    if (role === 'teacher') {
      // Teachers don't need designation
      setSelectedDesignation(undefined as any);
    }
  };

  const handleNext = async () => {
    if (step === 'role' && selectedRole === 'admin') {
      setStep('designation');
      return;
    }
    if (!selectedRole) return;
    setSaving(true);
    try {
      await completeOnboarding(
        selectedRole,
        selectedRole === 'admin' ? selectedDesignation ?? undefined : undefined
      );
    } catch {
      setSaving(false);
    }
  };

  const canProceed = step === 'role'
    ? selectedRole !== null
    : selectedDesignation !== null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.content, isWide && styles.contentWide]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>{step === 'role' ? '👋' : '🏛️'}</Text>
          <Text style={styles.title}>
            {step === 'role' ? 'Welcome to Attendly' : 'Select your role'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'role'
              ? 'Tell us about yourself to get started'
              : 'Choose your administrative designation'}
          </Text>
        </View>

        {/* Cards */}
        {step === 'role' ? (
          <View style={[styles.cardGrid, isWide && styles.cardGridWide]}>
            <TouchableOpacity
              style={[styles.roleCard, selectedRole === 'teacher' && styles.roleCardSelected]}
              onPress={() => handleRoleSelect('teacher')}
              activeOpacity={0.7}
            >
              <Text style={styles.cardEmoji}>📚</Text>
              <Text style={styles.cardTitle}>I'm a Teacher</Text>
              <Text style={styles.cardDesc}>Manage classes, mark attendance, create forms, and track student progress</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleCard, selectedRole === 'admin' && styles.roleCardSelected]}
              onPress={() => handleRoleSelect('admin')}
              activeOpacity={0.7}
            >
              <Text style={styles.cardEmoji}>🏛️</Text>
              <Text style={styles.cardTitle}>I'm Administration</Text>
              <Text style={styles.cardDesc}>Manage batches, assign courses, oversee attendance, and handle approvals</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.cardGrid, isWide && styles.cardGridWide3]}>
            <TouchableOpacity
              style={[styles.roleCard, selectedDesignation === 'principal' && styles.roleCardSelected]}
              onPress={() => setSelectedDesignation('principal')}
              activeOpacity={0.7}
            >
              <Text style={styles.cardEmoji}>👔</Text>
              <Text style={styles.cardTitle}>Principal</Text>
              <Text style={styles.cardDesc}>Full platform access including user role management</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleCard, selectedDesignation === 'hod' && styles.roleCardSelected]}
              onPress={() => setSelectedDesignation('hod')}
              activeOpacity={0.7}
            >
              <Text style={styles.cardEmoji}>🎓</Text>
              <Text style={styles.cardTitle}>Head of Department</Text>
              <Text style={styles.cardDesc}>Department-level access, approve teacher requests</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleCard, selectedDesignation === 'office_staff' && styles.roleCardSelected]}
              onPress={() => setSelectedDesignation('office_staff')}
              activeOpacity={0.7}
            >
              <Text style={styles.cardEmoji}>📋</Text>
              <Text style={styles.cardTitle}>Office Staff</Text>
              <Text style={styles.cardDesc}>Manage batches, courses, and student data</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Back + Continue */}
        <View style={styles.footer}>
          {step === 'designation' && (
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => { setStep('role'); setSelectedDesignation(null); }}
            >
              <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.continueBtn, !canProceed && styles.continueBtnDisabled]}
            onPress={handleNext}
            disabled={!canProceed || saving}
            activeOpacity={0.8}
          >
            <Text style={[styles.continueBtnText, !canProceed && styles.continueBtnTextDisabled]}>
              {saving ? 'Setting up…' : step === 'role' && selectedRole === 'admin' ? 'Next →' : 'Get Started →'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: '100%',
    paddingHorizontal: spacing.lg,
    maxWidth: 720,
  },
  contentWide: {
    paddingHorizontal: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.ink900,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.ink500,
    textAlign: 'center',
  },
  cardGrid: {
    gap: spacing.md,
  },
  cardGridWide: {
    flexDirection: 'row',
  },
  cardGridWide3: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  roleCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
    minHeight: 180,
    justifyContent: 'center',
  },
  roleCardSelected: {
    borderColor: colors.blue600,
    backgroundColor: '#EBF2FB',
  },
  cardEmoji: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontFamily: fonts.sansMedium,
    fontSize: 18,
    color: colors.ink900,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  cardDesc: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.ink500,
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  backBtn: {
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
  },
  backBtnText: {
    fontFamily: fonts.sansMedium,
    fontSize: 15,
    color: colors.ink700,
  },
  continueBtn: {
    flex: 1,
    maxWidth: 300,
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: colors.blue600,
    alignItems: 'center',
  },
  continueBtnDisabled: {
    backgroundColor: colors.border,
  },
  continueBtnText: {
    fontFamily: fonts.sansMedium,
    fontSize: 15,
    color: '#fff',
  },
  continueBtnTextDisabled: {
    color: colors.ink300,
  },
});
