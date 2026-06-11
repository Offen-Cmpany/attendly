import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fonts, space, radius, hairline } from '../../src/theme';
import { useAuth } from '../../src/lib/auth';
import { getAttendanceRecordsByDateRange, AttendanceRecord } from '../../src/lib/db';
import { Card, Eyebrow, Button } from '../../src/components/atoms';

// Simple helper to format dates as YYYY-MM-DD local
const toDateString = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { role, user } = useAuth();
  
  // Guard
  if (role === 'student') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: fonts.sansMedium, color: colors.ink500 }}>Access Denied</Text>
      </View>
    );
  }

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(toDateString(new Date()));
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceRecord[]>>({});

  const isTeacher = role === 'teacher';
  
  // Year & Month for display
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    // Fetch data for the current month view
    const fetchMonthData = async () => {
      setLoading(true);
      try {
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 0);
        
        // Admins see all, Teachers see only their own
        const records = await getAttendanceRecordsByDateRange(
          toDateString(start),
          toDateString(end),
          isTeacher ? user?.id : undefined
        );
        setAttendanceData(records);
      } catch (err) {
        console.error('Failed to fetch calendar data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMonthData();
  }, [year, month, isTeacher, user?.id]);

  // Calendar Grid Generation
  const calendarGrid = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const weeks: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = [];
    
    // Pad first week
    for (let i = 0; i < firstDay; i++) currentWeek.push(null);
    
    // Fill days
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(new Date(year, month, day));
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    
    // Pad last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }
    
    return weeks;
  }, [year, month]);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const changeMonth = (delta: number) => {
    const newDate = new Date(year, month + delta, 1);
    setCurrentDate(newDate);
  };

  const selectedDayRecords = attendanceData[selectedDateStr] || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top + space.lg }]}>
      <View style={styles.header}>
        <View>
          <Eyebrow>{isTeacher ? 'My Schedule' : 'Global Oversight'}</Eyebrow>
          <Text style={styles.h1}>Attendance Calendar</Text>
        </View>
      </View>

      <Card style={styles.calendarCard}>
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navBtn}>
            <Text style={styles.navText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>{monthNames[month]} {year}</Text>
          <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navBtn}>
            <Text style={styles.navText}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.daysRow}>
          {dayNames.map(d => (
            <Text key={d} style={styles.dayName}>{d}</Text>
          ))}
        </View>

        {calendarGrid.map((week, wIndex) => (
          <View key={wIndex} style={styles.weekRow}>
            {week.map((dayObj, dIndex) => {
              if (!dayObj) return <View key={dIndex} style={styles.dayCell} />;
              
              const dStr = toDateString(dayObj);
              const isSelected = selectedDateStr === dStr;
              const hasRecords = !!attendanceData[dStr] && attendanceData[dStr].length > 0;
              const isToday = dStr === toDateString(new Date());

              return (
                <TouchableOpacity 
                  key={dIndex} 
                  style={[
                    styles.dayCell, 
                    isSelected && styles.dayCellSelected,
                    isToday && !isSelected && styles.dayCellToday
                  ]}
                  onPress={() => setSelectedDateStr(dStr)}
                >
                  <Text style={[
                    styles.dayText,
                    isSelected && styles.dayTextSelected,
                    hasRecords && !isSelected && styles.dayTextHasRecords
                  ]}>
                    {dayObj.getDate()}
                  </Text>
                  {hasRecords && <View style={[styles.dot, isSelected && styles.dotSelected]} />}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </Card>

      <View style={styles.sessionsSection}>
        <View style={styles.sessionsHeader}>
          <Text style={styles.sessionsTitle}>
            Sessions on {new Date(selectedDateStr).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </Text>
          {loading && <ActivityIndicator color={colors.blue600} size="small" />}
        </View>

        {selectedDayRecords.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No attendance records for this date.</Text>
          </View>
        )}

        {selectedDayRecords.map(record => (
          <Card key={record.id} style={styles.sessionCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.courseCode}>{record.courseCode}</Text>
              <Text style={styles.courseName}>{record.courseName}</Text>
              {record.topic ? (
                <Text style={styles.topicText}>Topic: {record.topic}</Text>
              ) : null}
            </View>
            <Button 
              title="Edit" 
              variant="secondary" 
              onPress={() => router.push(`/edit-attendance/${record.id}`)}
              style={{ minWidth: 70 }}
            />
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
  content: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xxl,
    gap: space.lg,
  },
  header: {
    marginBottom: space.sm,
  },
  h1: {
    fontFamily: fonts.sansMedium,
    fontSize: 28,
    color: colors.ink900,
    marginTop: 4,
    letterSpacing: -0.5,
  },
  calendarCard: {
    padding: space.md,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.lg,
  },
  navBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  navText: {
    fontSize: 24,
    color: colors.ink500,
  },
  monthText: {
    fontFamily: fonts.sansMedium,
    fontSize: 18,
    color: colors.ink900,
  },
  daysRow: {
    flexDirection: 'row',
    marginBottom: space.sm,
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.ink300,
    textTransform: 'uppercase',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: space.xs,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  dayCellSelected: {
    backgroundColor: colors.blue600,
  },
  dayCellToday: {
    backgroundColor: colors.blue50,
  },
  dayText: {
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.ink900,
  },
  dayTextSelected: {
    color: '#fff',
    fontFamily: fonts.sansMedium,
  },
  dayTextHasRecords: {
    color: colors.blue800,
    fontFamily: fonts.sansMedium,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.blue600,
    position: 'absolute',
    bottom: 6,
  },
  dotSelected: {
    backgroundColor: '#fff',
  },
  sessionsSection: {
    marginTop: space.sm,
  },
  sessionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.md,
  },
  sessionsTitle: {
    fontFamily: fonts.sansMedium,
    fontSize: 16,
    color: colors.ink900,
  },
  emptyState: {
    padding: space.xl,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: radius.lg,
    borderWidth: hairline,
    borderColor: colors.border,
  },
  emptyText: {
    fontFamily: fonts.sans,
    color: colors.ink500,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.sm,
  },
  courseCode: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.ink500,
    marginBottom: 2,
  },
  courseName: {
    fontFamily: fonts.sansMedium,
    fontSize: 15,
    color: colors.ink900,
  },
  topicText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.ink500,
    marginTop: 4,
  },
});
