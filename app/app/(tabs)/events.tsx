import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Button, Card, Chip, Divider, Eyebrow } from '../../src/components/atoms';
import { useAuth } from '../../src/lib/auth';
import {
  CommunityRecord,
  EventRecord,
  EventRegistration,
  createEventProposal,
  getEventRegistrationSummary,
  listCommunities,
  listEventRegistrations,
  listEvents,
  registerForEvent,
  reviewEventProposal,
  reviewEventRegistration,
} from '../../src/lib/db';
import { colors, fonts, hairline, radius, space } from '../../src/theme';

const EVENT_STATUS_VARIANTS: Record<string, 'neutral' | 'warn' | 'safe' | 'risk'> = {
  pending_approval: 'warn',
  approved: 'safe',
  published: 'safe',
  completed: 'neutral',
  rejected: 'risk',
  cancelled: 'risk',
};

const REGISTRATION_STATUS_VARIANTS: Record<string, 'neutral' | 'warn' | 'safe' | 'risk'> = {
  pending: 'warn',
  approved: 'safe',
  rejected: 'risk',
  cancelled: 'neutral',
};

export default function EventsTab() {
  const { user, role } = useAuth();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const isStudent = role === 'student';

  const [loading, setLoading] = useState(true);
  const [communities, setCommunities] = useState<CommunityRecord[]>([]);
  const [browseEvents, setBrowseEvents] = useState<EventRecord[]>([]);
  const [myEvents, setMyEvents] = useState<EventRecord[]>([]);
  const [registrationSummary, setRegistrationSummary] = useState<Record<string, { total: number; approved: number }>>({});

  const [proposalOpen, setProposalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);
  const [attendees, setAttendees] = useState<EventRegistration[]>([]);
  const [attendeeLoading, setAttendeeLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [communityId, setCommunityId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('');
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [dutyLeaveEligible, setDutyLeaveEligible] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [communityRows, discoverRows, myRows] = await Promise.all([
        listCommunities(),
        isStudent
          ? listEvents({ status: ['approved', 'published'], studentId: user.id })
          : listEvents({ status: ['pending_approval', 'approved', 'published'], includePast: true }),
        listEvents({ createdBy: user.id, includePast: true }),
      ]);

      setCommunities(communityRows);
      setBrowseEvents(discoverRows);
      setMyEvents(myRows);
      if (!communityId && communityRows.length > 0) setCommunityId(communityRows[0].id);

      const summary = await getEventRegistrationSummary([
        ...new Set([...discoverRows, ...myRows].map(event => event.id)),
      ]);
      setRegistrationSummary(summary);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  }, [communityId, isStudent, user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const pendingApprovalEvents = useMemo(
    () => browseEvents.filter(event => event.status === 'pending_approval'),
    [browseEvents]
  );

  const publishedEvents = useMemo(
    () => browseEvents.filter(event => event.status === 'approved' || event.status === 'published'),
    [browseEvents]
  );

  const myRegistrations = useMemo(
    () => publishedEvents.filter(event => !!event.myRegistrationStatus),
    [publishedEvents]
  );

  const resetProposalForm = () => {
    setTitle('');
    setDescription('');
    setLocation('');
    setStartsAt('');
    setEndsAt('');
    setMaxAttendees('');
    setRequiresApproval(true);
    setDutyLeaveEligible(false);
  };

  const handleCreateProposal = async () => {
    if (!user?.id) return;
    if (!communityId || !title.trim() || !description.trim() || !startsAt.trim()) {
      Alert.alert('Missing fields', 'Community, title, description, and start date are required.');
      return;
    }

    try {
      setSubmitting(true);
      await createEventProposal({
        communityId,
        createdBy: user.id,
        title: title.trim(),
        description: description.trim(),
        location: location.trim() || undefined,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: endsAt.trim() ? new Date(endsAt).toISOString() : undefined,
        requiresRegistrationApproval: requiresApproval,
        dutyLeaveEligible,
        maxAttendees: maxAttendees.trim() ? parseInt(maxAttendees, 10) : null,
      });
      resetProposalForm();
      setProposalOpen(false);
      await loadData();
      Alert.alert('Proposal sent', 'Your event is now pending teacher/admin approval.');
    } catch (err: any) {
      Alert.alert('Could not submit', err?.message || 'Failed to create the event proposal.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (event: EventRecord) => {
    if (!user?.id) return;
    try {
      await registerForEvent({ eventId: event.id, studentId: user.id });
      await loadData();
      Alert.alert('Registered', event.requiresRegistrationApproval ? 'Registration is pending approval.' : 'You are confirmed for this event.');
    } catch (err: any) {
      Alert.alert('Registration failed', err?.message || 'Could not register for this event.');
    }
  };

  const handleReviewEvent = async (event: EventRecord, status: 'approved' | 'rejected' | 'published') => {
    if (!user?.id) return;
    try {
      await reviewEventProposal({ eventId: event.id, reviewerId: user.id, status });
      await loadData();
    } catch (err: any) {
      Alert.alert('Update failed', err?.message || 'Could not review the event proposal.');
    }
  };

  const openAttendees = async (event: EventRecord) => {
    setSelectedEvent(event);
    setAttendeeLoading(true);
    try {
      const rows = await listEventRegistrations(event.id);
      setAttendees(rows);
    } catch {
      setAttendees([]);
    } finally {
      setAttendeeLoading(false);
    }
  };

  const handleReviewRegistration = async (registrationId: string, status: 'approved' | 'rejected') => {
    if (!user?.id || !selectedEvent) return;
    try {
      await reviewEventRegistration({ registrationId, reviewerId: user.id, status });
      const rows = await listEventRegistrations(selectedEvent.id);
      setAttendees(rows);
      await loadData();
    } catch (err: any) {
      Alert.alert('Update failed', err?.message || 'Could not review the registration.');
    }
  };

  return (
    <>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + space.lg, paddingBottom: space.xxl },
            isDesktop && { maxWidth: 780, alignSelf: 'center' as const, width: '100%', paddingHorizontal: 32 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <Eyebrow>{isStudent ? 'Communities' : 'Approvals'}</Eyebrow>
            <Text style={styles.h1}>{isStudent ? 'Events & Registrations' : 'Event Control Center'}</Text>
            <Text style={styles.sub}>
              {isStudent
                ? 'Discover approved events, track registrations, and propose community ideas.'
                : 'Approve proposals, watch registrations, and keep attendance-facing events tidy.'}
            </Text>
          </View>

          <Card style={styles.heroCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>{isStudent ? 'Pitch the next big community event' : 'Review what needs attention today'}</Text>
              <Text style={styles.heroText}>
                {isStudent
                  ? 'Students can curate events directly here. Every proposal goes through faculty/admin approval before registrations open.'
                  : `${pendingApprovalEvents.length} proposal${pendingApprovalEvents.length === 1 ? '' : 's'} currently waiting for approval.`}
              </Text>
            </View>
            {isStudent ? (
              <Button title="Propose Event" onPress={() => setProposalOpen(true)} />
            ) : (
              <Chip label={`${pendingApprovalEvents.length} pending`} variant={pendingApprovalEvents.length > 0 ? 'warn' : 'safe'} dot />
            )}
          </Card>

          {isStudent ? (
            <>
              <SectionTitle title="My Proposals" caption="Status of ideas you’ve already sent for review." />
              <EventList
                events={myEvents}
                emptyText="You have not proposed any events yet."
                registrationSummary={registrationSummary}
              />

              <SectionTitle title="Open for Registration" caption="Approved community events students can join now." />
              <View style={{ gap: space.md }}>
                {publishedEvents.length === 0 ? (
                  <Card><Text style={styles.emptyText}>No approved events are open right now.</Text></Card>
                ) : (
                  publishedEvents.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      registrationSummary={registrationSummary[event.id]}
                      footer={
                        event.myRegistrationStatus ? (
                          <Chip label={formatStatus(event.myRegistrationStatus)} variant={REGISTRATION_STATUS_VARIANTS[event.myRegistrationStatus]} dot />
                        ) : (
                          <Button title="Register" size="sm" onPress={() => handleRegister(event)} />
                        )
                      }
                    />
                  ))
                )}
              </View>

              <SectionTitle title="My Registrations" caption="Everything you’re already attending or waiting on." />
              <EventList
                events={myRegistrations}
                emptyText="You have not registered for any events yet."
                registrationSummary={registrationSummary}
                showRegistrationStatus
              />
            </>
          ) : (
            <>
              <SectionTitle title="Pending Event Proposals" caption="Approve or reject before the event goes live to students." />
              <View style={{ gap: space.md }}>
                {pendingApprovalEvents.length === 0 ? (
                  <Card><Text style={styles.emptyText}>Nothing is waiting for approval right now.</Text></Card>
                ) : (
                  pendingApprovalEvents.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      registrationSummary={registrationSummary[event.id]}
                      footer={
                        <View style={styles.actionsRow}>
                          <Button title="Approve" size="sm" onPress={() => handleReviewEvent(event, 'published')} />
                          <Button title="Reject" size="sm" variant="secondary" onPress={() => handleReviewEvent(event, 'rejected')} />
                        </View>
                      }
                    />
                  ))
                )}
              </View>

              <SectionTitle title="Published Events" caption="Review registrations and track who is actually attending." />
              <View style={{ gap: space.md }}>
                {publishedEvents.length === 0 ? (
                  <Card><Text style={styles.emptyText}>No approved events have been published yet.</Text></Card>
                ) : (
                  publishedEvents.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      registrationSummary={registrationSummary[event.id]}
                      footer={<Button title="View Attendees" size="sm" onPress={() => openAttendees(event)} />}
                    />
                  ))
                )}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      <Modal visible={proposalOpen} animationType="slide" presentationStyle="formSheet" onRequestClose={() => setProposalOpen(false)}>
        <SafeAreaView style={styles.modalSafe} edges={['top']}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Propose Event</Text>
              <TouchableOpacity onPress={() => setProposalOpen(false)}>
                <Text style={styles.modalClose}>Close</Text>
              </TouchableOpacity>
            </View>

            <Card style={{ gap: space.md }}>
              <LabeledField label="Community">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
                  {communities.map(community => (
                    <TouchableOpacity
                      key={community.id}
                      style={[styles.pill, communityId === community.id && styles.pillActive]}
                      onPress={() => setCommunityId(community.id)}
                    >
                      <Text style={[styles.pillText, communityId === community.id && styles.pillTextActive]}>{community.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </LabeledField>

              <LabeledField label="Title"><Input value={title} onChangeText={setTitle} placeholder="Hackathon prep bootcamp" /></LabeledField>
              <LabeledField label="Description"><Input value={description} onChangeText={setDescription} placeholder="What is the event and why should it run?" multiline /></LabeledField>
              <LabeledField label="Location"><Input value={location} onChangeText={setLocation} placeholder="Main auditorium" /></LabeledField>
              <LabeledField label="Starts At"><Input value={startsAt} onChangeText={setStartsAt} placeholder="2026-07-10T10:00:00+05:30" /></LabeledField>
              <LabeledField label="Ends At"><Input value={endsAt} onChangeText={setEndsAt} placeholder="2026-07-10T13:00:00+05:30" /></LabeledField>
              <LabeledField label="Max Attendees"><Input value={maxAttendees} onChangeText={setMaxAttendees} placeholder="120" keyboardType="number-pad" /></LabeledField>

              <View style={styles.toggleRow}>
                <TogglePill active={requiresApproval} label="Registration approval required" onPress={() => setRequiresApproval(v => !v)} />
                <TogglePill active={dutyLeaveEligible} label="Duty leave eligible" onPress={() => setDutyLeaveEligible(v => !v)} />
              </View>

              <Button title={submitting ? 'Submitting...' : 'Submit Proposal'} onPress={handleCreateProposal} />
            </Card>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal visible={!!selectedEvent} animationType="slide" presentationStyle="formSheet" onRequestClose={() => setSelectedEvent(null)}>
        <SafeAreaView style={styles.modalSafe} edges={['top']}>
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>{selectedEvent?.title ?? 'Attendees'}</Text>
              <Text style={styles.modalSubtitle}>{selectedEvent?.communityName}</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedEvent(null)}>
              <Text style={styles.modalClose}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            {attendeeLoading ? (
              <Card><Text style={styles.emptyText}>Loading attendees...</Text></Card>
            ) : attendees.length === 0 ? (
              <Card><Text style={styles.emptyText}>Nobody has registered for this event yet.</Text></Card>
            ) : (
              <Card style={{ padding: 0, overflow: 'hidden' }}>
                {attendees.map((registration, index) => (
                  <View key={registration.id}>
                    <View style={styles.attendeeRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.attendeeName}>{registration.studentName || 'Student'}</Text>
                        <Text style={styles.attendeeMeta}>{registration.studentReg || registration.studentEmail || 'No profile metadata'}</Text>
                      </View>
                      <Chip label={formatStatus(registration.status)} variant={REGISTRATION_STATUS_VARIANTS[registration.status]} dot />
                    </View>
                    {registration.status === 'pending' && (
                      <View style={[styles.actionsRow, { paddingHorizontal: space.lg, paddingBottom: space.lg }]}>
                        <Button title="Approve" size="sm" onPress={() => handleReviewRegistration(registration.id, 'approved')} />
                        <Button title="Reject" size="sm" variant="secondary" onPress={() => handleReviewRegistration(registration.id, 'rejected')} />
                      </View>
                    )}
                    {index < attendees.length - 1 && <Divider />}
                  </View>
                ))}
              </Card>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

function SectionTitle({ title, caption }: { title: string; caption: string }) {
  return (
    <View>
      <Eyebrow>{title}</Eyebrow>
      <Text style={styles.sectionCaption}>{caption}</Text>
    </View>
  );
}

function EventList({
  events,
  emptyText,
  registrationSummary,
  showRegistrationStatus,
}: {
  events: EventRecord[];
  emptyText: string;
  registrationSummary: Record<string, { total: number; approved: number }>;
  showRegistrationStatus?: boolean;
}) {
  if (events.length === 0) {
    return <Card><Text style={styles.emptyText}>{emptyText}</Text></Card>;
  }

  return (
    <View style={{ gap: space.md }}>
      {events.map(event => (
        <EventCard
          key={event.id}
          event={event}
          registrationSummary={registrationSummary[event.id]}
          footer={showRegistrationStatus && event.myRegistrationStatus
            ? <Chip label={formatStatus(event.myRegistrationStatus)} variant={REGISTRATION_STATUS_VARIANTS[event.myRegistrationStatus]} dot />
            : undefined}
        />
      ))}
    </View>
  );
}

function EventCard({
  event,
  registrationSummary,
  footer,
}: {
  event: EventRecord;
  registrationSummary?: { total: number; approved: number };
  footer?: React.ReactNode;
}) {
  return (
    <Card style={{ gap: space.md }}>
      <View style={styles.eventHeader}>
        <View style={{ flex: 1, paddingRight: space.md }}>
          <Text style={styles.eventCommunity}>{event.communityName || 'Community Event'}</Text>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventMeta}>{formatDate(event.startsAt)}{event.location ? ` · ${event.location}` : ''}</Text>
        </View>
        <Chip label={formatStatus(event.status)} variant={EVENT_STATUS_VARIANTS[event.status]} dot />
      </View>

      {!!event.description && <Text style={styles.eventDescription}>{event.description}</Text>}

      <View style={styles.statsRow}>
        <Stat label="Requested" value={`${registrationSummary?.total ?? 0}`} />
        <Stat label="Approved" value={`${registrationSummary?.approved ?? 0}`} />
        <Stat label="Capacity" value={event.maxAttendees ? `${event.maxAttendees}` : 'Open'} />
      </View>

      {footer && <View>{footer}</View>}
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function LabeledField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: space.xs }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function Input(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      placeholderTextColor={colors.ink300}
      style={[styles.input, props.multiline && styles.inputMultiline]}
      {...props}
    />
  );
}

function TogglePill({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.pill, active && styles.pillActive]}>
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

function formatStatus(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceAlt },
  scroll: { flex: 1 },
  content: { paddingHorizontal: space.lg, gap: space.lg },
  h1: { fontFamily: fonts.displayBold, fontSize: 28, color: colors.ink900, marginTop: space.xs },
  sub: { fontFamily: fonts.sans, fontSize: 14, color: colors.ink500, marginTop: 2 },
  heroCard: { flexDirection: 'row', gap: space.md, alignItems: 'center', backgroundColor: colors.coral50, borderColor: colors.coral200 },
  heroTitle: { fontFamily: fonts.sansMedium, fontSize: 16, color: colors.coral900 },
  heroText: { fontFamily: fonts.sans, fontSize: 13, color: colors.coral800, marginTop: 4, lineHeight: 18 },
  sectionCaption: { fontFamily: fonts.sans, fontSize: 13, color: colors.ink500, marginTop: 4 },
  emptyText: { fontFamily: fonts.sans, fontSize: 14, color: colors.ink500, textAlign: 'center' },
  eventHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  eventCommunity: { fontFamily: fonts.monoMedium, fontSize: 11, color: colors.ink500, marginBottom: 3 },
  eventTitle: { fontFamily: fonts.sansMedium, fontSize: 16, color: colors.ink900 },
  eventMeta: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginTop: 4 },
  eventDescription: { fontFamily: fonts.sans, fontSize: 13, color: colors.ink700, lineHeight: 18 },
  statsRow: { flexDirection: 'row', gap: space.sm },
  statPill: { flex: 1, backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: space.md, borderWidth: hairline, borderColor: colors.border },
  statLabel: { fontFamily: fonts.sans, fontSize: 11, color: colors.ink500 },
  statValue: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.ink900, marginTop: 4 },
  actionsRow: { flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' },
  modalSafe: { flex: 1, backgroundColor: colors.surfaceAlt },
  modalContent: { padding: space.lg, gap: space.lg },
  modalHeader: {
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderBottomWidth: hairline,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: { fontFamily: fonts.displayBold, fontSize: 22, color: colors.ink900 },
  modalSubtitle: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink500, marginTop: 2 },
  modalClose: { fontFamily: fonts.sansMedium, color: colors.blue600, fontSize: 14 },
  input: {
    borderWidth: hairline,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: space.md,
    paddingVertical: 10,
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.ink900,
  },
  inputMultiline: { minHeight: 110, textAlignVertical: 'top' },
  fieldLabel: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink700 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: hairline,
    borderColor: colors.border,
  },
  pillActive: { backgroundColor: colors.ink900, borderColor: colors.ink900 },
  pillText: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.ink700 },
  pillTextActive: { color: colors.surface },
  toggleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  attendeeRow: { paddingHorizontal: space.lg, paddingVertical: space.lg, flexDirection: 'row', gap: space.md, alignItems: 'center' },
  attendeeName: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink900 },
  attendeeMeta: { fontFamily: fonts.mono, fontSize: 11, color: colors.ink500, marginTop: 3 },
});
