// Attendly mobile screens — React components
// Each exported screen slots into IOSDevice body (below large title)

const C = {
  blue50: '#E6F1FB', blue100: '#B5D4F4', blue200: '#85B7EB',
  blue400: '#378ADD', blue600: '#185FA5', blue800: '#0C447C', blue900: '#042C53',
  coral50: '#FAECE7', coral200: '#F0997B', coral400: '#D85A30',
  coral600: '#993C1D', coral800: '#712B13', coral900: '#4A1B0C',
  safeBg: '#EAF3DE', safeFg: '#27500A',
  warnBg: '#FAEEDA', warnFg: '#633806',
  riskBg: '#FCEBEB', riskFg: '#501313',
  neutralBg: '#F1EFE8', neutralFg: '#444441',
  ink900: '#111112', ink700: '#2a2a2c', ink500: '#5a5a5d', ink300: '#9a9a9d',
  border: 'rgba(0,0,0,0.08)', surface: '#ffffff', surfaceAlt: '#f7f6f2',
};

const font = "'Inter', 'Manjari', system-ui, sans-serif";
const mono = "'JetBrains Mono', ui-monospace, monospace";

// Small atomic bits -----------------------------------------------------------

function Chip({ kind = 'safe', children, dot = true }) {
  const map = {
    safe: [C.safeBg, C.safeFg],
    warn: [C.warnBg, C.warnFg],
    risk: [C.riskBg, C.riskFg],
    duty: [C.blue50, C.blue900],
    streak: [C.coral50, C.coral900],
    neutral: [C.neutralBg, C.neutralFg],
  };
  const [bg, fg] = map[kind];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 999,
      background: bg, color: fg,
      fontSize: 12, fontWeight: 500, lineHeight: 1.3, whiteSpace: 'nowrap',
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 999, background: 'currentColor', opacity: 0.85 }} />}
      {children}
    </span>
  );
}

function Eyebrow({ children, color = C.ink500 }) {
  return <div style={{
    fontSize: 11, fontWeight: 500, letterSpacing: 0.3,
    textTransform: 'uppercase', color, marginBottom: 6,
  }}>{children}</div>;
}

function Btn({ variant = 'primary', size = 'md', children, style, ...p }) {
  const variants = {
    primary: { background: C.blue600, color: '#fff', border: 'none' },
    secondary: { background: 'transparent', color: C.blue600, border: `1px solid ${C.blue600}` },
    accent: { background: C.coral400, color: '#fff', border: 'none' },
    ghost: { background: 'transparent', color: C.ink500, border: 'none' },
  };
  const sz = size === 'sm' ? { height: 32, padding: '0 12px', fontSize: 13 } : { height: 40, padding: '0 18px', fontSize: 14 };
  return (
    <button {...p} style={{
      ...variants[variant], ...sz,
      borderRadius: size === 'sm' ? 6 : 8,
      fontFamily: font, fontWeight: 500, cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      letterSpacing: -0.1, lineHeight: 1,
      ...style,
    }}>{children}</button>
  );
}

function Progress({ value, kind = 'safe', height = 8 }) {
  const fg = kind === 'safe' ? '#4e8a28' : kind === 'warn' ? '#d08b2e' : C.coral400;
  return (
    <div style={{ height, borderRadius: 999, background: '#f0efe9', overflow: 'hidden', position: 'relative' }}>
      <div style={{ height: '100%', width: `${value}%`, background: fg, borderRadius: 999, transition: 'width .4s' }} />
    </div>
  );
}

function Card({ children, style }) {
  return <div style={{
    background: '#fff', border: `0.5px solid ${C.border}`,
    borderRadius: 12, padding: 16, ...style,
  }}>{children}</div>;
}

// Icons -----------------------------------------------------------------------
const Icon = {
  home: (s=22, c=C.ink500) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9z" stroke={c} strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  calendar: (s=22, c=C.ink500) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2" stroke={c} strokeWidth="1.6"/><path d="M3 9h18M8 3v4M16 3v4" stroke={c} strokeWidth="1.6" strokeLinecap="round"/></svg>,
  people: (s=22, c=C.ink500) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="9" cy="9" r="3.2" stroke={c} strokeWidth="1.6"/><circle cx="17" cy="10" r="2.6" stroke={c} strokeWidth="1.6"/><path d="M3 19c0-3 3-5 6-5s6 2 6 5M15 19c0-2 2-4 4-4s3 1.5 3 4" stroke={c} strokeWidth="1.6" strokeLinecap="round"/></svg>,
  person: (s=22, c=C.ink500) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke={c} strokeWidth="1.6"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke={c} strokeWidth="1.6" strokeLinecap="round"/></svg>,
  bell: (s=20, c=C.ink500) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M6 10a6 6 0 1112 0v4l2 3H4l2-3v-4zM10 20a2 2 0 004 0" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  flame: (s=16, c=C.coral400) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 3c1 3-2 5-2 8a4 4 0 008 0c0-2-1-3-2-5 0 2-2 3-3 2 1-2 0-4-1-5zM7 14a5 5 0 1010 0c0-1-.5-2-1-3-.5 1.5-2 2-3 1-1 1-1 3 0 4-2 0-3-1-3-2-1 0-2 0-3 0z" fill={c}/></svg>,
  chevron: (s=14, c=C.ink300) => <svg width={s} height={s} viewBox="0 0 14 14" fill="none"><path d="M5 2l5 5-5 5" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  check: (s=14, c='#fff') => <svg width={s} height={s} viewBox="0 0 14 14" fill="none"><path d="M2 7.5l3.5 3.5L12 3" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  close: (s=14, c='#fff') => <svg width={s} height={s} viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M11 3l-8 8" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  pin: (s=14, c=C.ink500) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 2v8m-4 0h8l-2 2H6l-2-2z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/></svg>,
  clock: (s=14, c=C.ink500) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke={c} strokeWidth="1.4"/><path d="M8 5v3l2 1.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
};

// ============================================================================
// Bottom nav (shared)
// ============================================================================
function BottomNav({ active = 'home' }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Icon.home },
    { id: 'timetable', label: 'Timetable', icon: Icon.calendar },
    { id: 'communities', label: 'Communities', icon: Icon.people },
    { id: 'profile', label: 'Profile', icon: Icon.person },
  ];
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      paddingBottom: 28, paddingTop: 8,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(18px)',
      borderTop: `0.5px solid ${C.border}`,
      display: 'flex', justifyContent: 'space-around',
      fontFamily: font,
    }}>
      {tabs.map(t => {
        const on = t.id === active;
        return (
          <div key={t.id} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 3, minWidth: 64,
          }}>
            <div style={{
              padding: '5px 14px', borderRadius: 999,
              background: on ? C.blue50 : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {t.icon(22, on ? C.blue600 : C.ink500)}
            </div>
            <div style={{
              fontSize: 10, fontWeight: 500,
              color: on ? C.blue600 : C.ink500,
            }}>{t.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// SCREEN 1 — STUDENT HOME
// ============================================================================
function StudentHome() {
  const classes = [
    { time: '9:00', code: 'CS301', name: 'Compiler Design', room: 'LH‑2', status: 'present' },
    { time: '10:00', code: 'CS303', name: 'Operating Systems', room: 'LH‑4', status: 'now' },
    { time: '11:30', code: 'CS351', name: 'CS Lab', room: 'Lab 3', status: 'later' },
    { time: '2:00', code: 'HU300', name: 'Industrial Economics', room: 'LH‑1', status: 'later' },
  ];
  return (
    <div style={{ fontFamily: font, background: C.surfaceAlt, minHeight: '100%', paddingBottom: 100 }}>
      {/* Top header */}
      <div style={{ padding: '54px 20px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 13, color: C.ink500 }}>Tuesday, 14 April</div>
          <div style={{ fontSize: 22, fontWeight: 500, marginTop: 2, letterSpacing: -0.3 }}>Hi, Aysha</div>
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: 999,
          background: '#fff', border: `0.5px solid ${C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
        }}>
          {Icon.bell(18, C.ink700)}
          <div style={{ position: 'absolute', top: 9, right: 11, width: 7, height: 7, borderRadius: 999, background: C.coral400, border: '1.5px solid #fff' }} />
        </div>
      </div>

      {/* Hero attendance card */}
      <div style={{ padding: '8px 20px 0' }}>
        <div style={{
          background: C.blue900, color: '#fff',
          borderRadius: 16, padding: 20,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: 0.3, textTransform: 'uppercase', color: C.blue200, marginBottom: 6 }}>
            Overall attendance
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <div style={{ fontSize: 52, fontWeight: 500, letterSpacing: -1.5, lineHeight: 1, fontFamily: mono }}>82<span style={{ fontSize: 28 }}>%</span></div>
            <Chip kind="safe">Safe</Chip>
          </div>
          <div style={{ marginTop: 14, fontSize: 15, lineHeight: 1.4, color: '#fff' }}>
            You can skip <b style={{ fontWeight: 500 }}>14 more hours</b> and stay eligible.
          </div>
          <div style={{ marginTop: 16 }}>
            <Progress value={82} kind="safe" />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: C.blue200 }}>
              <span>Eligibility cutoff 75%</span>
              <span style={{ fontFamily: mono }}>236 / 288 hrs</span>
            </div>
          </div>
          {/* decorative corner */}
          <div style={{ position: 'absolute', right: -40, top: -40, width: 140, height: 140, borderRadius: 999, background: C.blue800, opacity: 0.5 }} />
        </div>
      </div>

      {/* Streak + goal 2-up */}
      <div style={{ padding: '12px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: C.coral50, borderRadius: 12, padding: 12 }}>
          <Eyebrow color={C.coral600}>Streak</Eyebrow>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            {Icon.flame(18, C.coral400)}
            <span style={{ fontSize: 22, fontWeight: 500, color: C.coral900, fontFamily: mono }}>7</span>
            <span style={{ fontSize: 12, color: C.coral800 }}>day</span>
          </div>
          <div style={{ fontSize: 11, color: C.coral800, marginTop: 4 }}>No missed classes this week</div>
        </div>
        <div style={{ background: C.blue50, borderRadius: 12, padding: 12 }}>
          <Eyebrow color={C.blue600}>This week</Eyebrow>
          <div style={{ fontSize: 22, fontWeight: 500, color: C.blue900, fontFamily: mono }}>21<span style={{ fontSize: 13, color: C.blue800 }}> / 24</span></div>
          <div style={{ fontSize: 11, color: C.blue800, marginTop: 4 }}>Hours attended</div>
        </div>
      </div>

      {/* Today's classes */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: -0.2 }}>Today's classes</div>
          <div style={{ fontSize: 12, color: C.blue600, fontWeight: 500 }}>See week</div>
        </div>
        <Card style={{ padding: 0 }}>
          {classes.map((cls, i) => {
            const statusNode = cls.status === 'present'
              ? <div style={{ width: 22, height: 22, borderRadius: 999, background: C.safeBg, color: C.safeFg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icon.check(12, C.safeFg)}</div>
              : cls.status === 'now'
                ? <Chip kind="duty" dot={false}><span style={{ width: 6, height: 6, borderRadius: 999, background: C.blue400, animation: 'pulse 1.4s infinite' }}/>Now</Chip>
                : <span style={{ fontSize: 12, color: C.ink300 }}>Later</span>;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                borderBottom: i < classes.length - 1 ? `0.5px solid ${C.border}` : 'none',
              }}>
                <div style={{ minWidth: 42, fontFamily: mono, fontSize: 12, color: C.ink500 }}>{cls.time}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: C.ink900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cls.name}</div>
                  <div style={{ fontSize: 12, color: C.ink500, marginTop: 2 }}>
                    <span style={{ fontFamily: mono }}>{cls.code}</span> · {cls.room}
                  </div>
                </div>
                {statusNode}
              </div>
            );
          })}
        </Card>
      </div>

      {/* University strip */}
      <div style={{ padding: '20px 20px 0' }}>
        <Eyebrow>University updates</Eyebrow>
        <div style={{
          background: C.blue50, borderLeft: `3px solid ${C.blue400}`,
          borderRadius: '0 12px 12px 0', padding: '12px 14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              fontSize: 10, fontWeight: 500, padding: '2px 6px', borderRadius: 4,
              background: C.blue600, color: '#fff',
            }}>KTU</span>
            <span style={{ fontSize: 11, color: C.blue800 }}>2 hours ago</span>
          </div>
          <div style={{ fontSize: 14, color: C.blue900, lineHeight: 1.4 }}>
            S6 end‑semester exam hall tickets available on portal. Download before Friday.
          </div>
        </div>
      </div>

      {/* Community strip */}
      <div style={{ padding: '16px 20px 0' }}>
        <Eyebrow>From your communities</Eyebrow>
        <div style={{
          background: C.coral50, borderLeft: `3px solid ${C.coral400}`,
          borderRadius: '0 12px 12px 0', padding: '12px 14px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: C.coral200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 500, fontFamily: mono }}>IE</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: C.coral900 }}>IEEE Student Branch</div>
            <div style={{ fontSize: 12, color: C.coral800, marginTop: 2 }}>Hackstorm 2026 · Sat · duty‑leave eligible</div>
          </div>
          {Icon.chevron(12, C.coral600)}
        </div>
      </div>

      <BottomNav active="home" />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }`}</style>
    </div>
  );
}

// ============================================================================
// SCREEN 2 — SUBJECT DETAIL (skip calculator)
// ============================================================================
function SubjectDetail() {
  const log = [
    { date: 'Tue 14 Apr', time: '9:00', status: 'present' },
    { date: 'Mon 13 Apr', time: '11:30', status: 'present' },
    { date: 'Fri 10 Apr', time: '9:00', status: 'absent' },
    { date: 'Thu 9 Apr', time: '2:00', status: 'duty' },
    { date: 'Wed 8 Apr', time: '9:00', status: 'present' },
    { date: 'Tue 7 Apr', time: '11:30', status: 'present' },
  ];
  return (
    <div style={{ fontFamily: font, background: C.surfaceAlt, minHeight: '100%', paddingBottom: 40 }}>
      {/* top bar */}
      <div style={{ padding: '54px 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 999, background: '#fff', border: `0.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M10 2L4 7l6 5" stroke={C.ink700} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div style={{ flex: 1 }} />
      </div>

      {/* subject title */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ fontSize: 12, color: C.ink500, fontFamily: mono }}>CS301 · Semester 6</div>
        <h1 style={{ fontSize: 22, fontWeight: 500, margin: '2px 0 0', letterSpacing: -0.3 }}>Compiler Design</h1>
        <div style={{ fontSize: 12, color: C.ink500, marginTop: 2 }}>Dr. Suja N · 4 credits</div>
      </div>

      {/* hero number */}
      <div style={{ padding: '20px 20px 0' }}>
        <Card>
          <Eyebrow>This subject</Eyebrow>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <div style={{ fontSize: 42, fontWeight: 500, letterSpacing: -1, fontFamily: mono, color: C.ink900, lineHeight: 1 }}>78<span style={{ fontSize: 22 }}>%</span></div>
            <Chip kind="warn">Watch</Chip>
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: C.ink500, fontFamily: mono }}>42 / 54 hrs attended</div>
          <div style={{ marginTop: 12 }}><Progress value={78} kind="warn" /></div>
        </Card>
      </div>

      {/* skip calculator */}
      <div style={{ padding: '12px 20px 0' }}>
        <div style={{
          background: C.warnBg, borderRadius: 12, padding: 16,
          border: `0.5px solid rgba(99,56,6,0.08)`,
        }}>
          <Eyebrow color={C.warnFg}>Decision</Eyebrow>
          <div style={{ fontSize: 16, color: C.warnFg, fontWeight: 500, lineHeight: 1.35, marginTop: 2 }}>
            Attend the next 4 classes to get back above 80%.
          </div>
          <div style={{ fontSize: 12, color: C.warnFg, opacity: 0.75, marginTop: 6 }}>
            Skip one more and you'll drop to Risk.
          </div>
        </div>
      </div>

      {/* trend sparkline */}
      <div style={{ padding: '16px 20px 0' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Eyebrow>Trend · last 8 weeks</Eyebrow>
            <span style={{ fontSize: 11, color: C.ink500 }}>−3% vs mid‑sem</span>
          </div>
          <svg viewBox="0 0 320 80" style={{ width: '100%', height: 80 }}>
            <line x1="0" y1="20" x2="320" y2="20" stroke={C.border} strokeDasharray="2 3"/>
            <text x="2" y="16" fill={C.ink300} fontSize="9" fontFamily={mono}>80</text>
            <line x1="0" y1="35" x2="320" y2="35" stroke={C.border} strokeDasharray="2 3"/>
            <text x="2" y="31" fill={C.ink300} fontSize="9" fontFamily={mono}>75</text>
            <polyline fill="none" stroke={C.coral400} strokeWidth="2"
              points="10,10 50,15 90,12 130,18 170,22 210,28 250,32 295,26"/>
            {[[10,10],[50,15],[90,12],[130,18],[170,22],[210,28],[250,32],[295,26]].map(([x,y],i)=>(
              <circle key={i} cx={x} cy={y} r="3" fill="#fff" stroke={C.coral400} strokeWidth="1.5"/>
            ))}
          </svg>
        </Card>
      </div>

      {/* log */}
      <div style={{ padding: '16px 20px 0' }}>
        <Eyebrow>Attendance log</Eyebrow>
        <Card style={{ padding: 0 }}>
          {log.map((row, i) => {
            const chip = row.status === 'present'
              ? <Chip kind="safe" dot={false}>Present</Chip>
              : row.status === 'absent'
                ? <Chip kind="risk" dot={false}>Absent</Chip>
                : <Chip kind="duty" dot={false}>Duty leave</Chip>;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', padding: '12px 16px',
                borderBottom: i < log.length - 1 ? `0.5px solid ${C.border}` : 'none',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: C.ink900 }}>{row.date}</div>
                  <div style={{ fontSize: 11, color: C.ink500, fontFamily: mono }}>{row.time}</div>
                </div>
                {chip}
              </div>
            );
          })}
        </Card>
      </div>

      {/* Action bar */}
      <div style={{ padding: '20px' }}>
        <Btn variant="accent" style={{ width: '100%' }}>Request duty leave</Btn>
      </div>
    </div>
  );
}

// ============================================================================
// SCREEN 3 — FACULTY MARK ATTENDANCE
// ============================================================================
function FacultyMarkAttendance() {
  const roster = [
    { n: '24', name: 'Abhinav K', reg: 'KTE21CS012', present: true },
    { n: '25', name: 'Ananya R', reg: 'KTE21CS015', present: false },
    { n: '26', name: 'Arjun M', reg: 'KTE21CS018', present: true },
    { n: '27', name: 'Aysha Salim', reg: 'KTE21CS021', present: true },
    { n: '28', name: 'Devika P', reg: 'KTE21CS024', present: true },
    { n: '29', name: 'Fathima N', reg: 'KTE21CS027', present: false },
    { n: '30', name: 'Gokul S', reg: 'KTE21CS030', present: true },
    { n: '31', name: 'Hari Krishnan', reg: 'KTE21CS033', present: true },
    { n: '32', name: 'Joel Thomas', reg: 'KTE21CS036', present: true, duty: true },
    { n: '33', name: 'Kavya R', reg: 'KTE21CS039', present: true },
  ];
  const absent = roster.filter(r => !r.present).length;
  const duty = roster.filter(r => r.duty).length;
  return (
    <div style={{ fontFamily: font, background: C.surfaceAlt, minHeight: '100%', paddingBottom: 120 }}>
      {/* top bar */}
      <div style={{ padding: '54px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 36, height: 36, borderRadius: 999, background: '#fff', border: `0.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M10 2L4 7l6 5" stroke={C.ink700} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <Chip kind="duty" dot={false}>Offline · queued</Chip>
      </div>

      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ fontSize: 12, color: C.ink500, fontFamily: mono }}>CS303 · S6 CSE‑B · Hour 2</div>
        <h1 style={{ fontSize: 22, fontWeight: 500, margin: '2px 0 0', letterSpacing: -0.3 }}>Operating Systems</h1>
      </div>

      {/* summary card */}
      <div style={{ padding: '14px 20px 0' }}>
        <Card style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 500, fontFamily: mono, color: C.ink900 }}>56</div>
            <div style={{ fontSize: 11, color: C.ink500 }}>Present</div>
          </div>
          <div style={{ width: 0.5, background: C.border }} />
          <div>
            <div style={{ fontSize: 22, fontWeight: 500, fontFamily: mono, color: C.coral400 }}>{absent}</div>
            <div style={{ fontSize: 11, color: C.ink500 }}>Absent</div>
          </div>
          <div style={{ width: 0.5, background: C.border }} />
          <div>
            <div style={{ fontSize: 22, fontWeight: 500, fontFamily: mono, color: C.blue600 }}>{duty}</div>
            <div style={{ fontSize: 11, color: C.ink500 }}>Duty leave</div>
          </div>
          <div style={{ width: 0.5, background: C.border }} />
          <div>
            <div style={{ fontSize: 22, fontWeight: 500, fontFamily: mono, color: C.ink900 }}>58</div>
            <div style={{ fontSize: 11, color: C.ink500 }}>Total</div>
          </div>
        </Card>
      </div>

      {/* toggle-all banner */}
      <div style={{ padding: '12px 20px 0', fontSize: 12, color: C.ink500 }}>
        Tap a row to toggle absent. Default is present.
      </div>

      {/* roster */}
      <div style={{ padding: '8px 20px 0' }}>
        <Card style={{ padding: 0 }}>
          {roster.map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
              borderBottom: i < roster.length - 1 ? `0.5px solid ${C.border}` : 'none',
              background: !s.present ? C.riskBg : 'transparent',
            }}>
              <div style={{ width: 22, fontSize: 11, color: C.ink500, fontFamily: mono, textAlign: 'right' }}>{s.n}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: !s.present ? C.riskFg : C.ink900 }}>{s.name}</div>
                <div style={{ fontSize: 10, color: C.ink500, fontFamily: mono, marginTop: 2 }}>{s.reg}</div>
              </div>
              {s.duty && <Chip kind="duty" dot={false}>Duty</Chip>}
              <div style={{
                width: 28, height: 28, borderRadius: 999, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: s.present ? C.blue600 : '#fff',
                border: s.present ? 'none' : `1.5px solid ${C.coral400}`,
              }}>
                {s.present ? Icon.check(14, '#fff') : Icon.close(12, C.coral400)}
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* action bar */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: '#fff', borderTop: `0.5px solid ${C.border}`,
        padding: '14px 20px 32px', display: 'flex', gap: 10,
      }}>
        <Btn variant="secondary" style={{ flex: 1 }}>Mark all present</Btn>
        <Btn variant="primary" style={{ flex: 1.2 }}>Save attendance</Btn>
      </div>
    </div>
  );
}

Object.assign(window, {
  C, font, mono, Chip, Eyebrow, Btn, Progress, Card, Icon, BottomNav,
  StudentHome, SubjectDetail, FacultyMarkAttendance,
});
