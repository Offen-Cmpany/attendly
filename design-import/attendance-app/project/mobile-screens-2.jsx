// Attendly mobile — extended screens (timetable, communities, updates, leave)

function Timetable() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const hours = ['9', '10', '11', '12', '1', '2', '3'];
  // grid of {subj, color, state} keyed by h*5+d
  const slots = {
    // Mon
    '0-0': { s: 'CS301', c: 'blue', st: 'done' },
    '0-1': { s: 'CS303', c: 'coral', st: 'done' },
    '0-2': { s: 'CS305', c: 'blue', st: 'done' },
    '0-3': { s: 'LUNCH', c: 'lunch' },
    '0-4': { s: 'CS351', c: 'lab', st: 'done' },
    '0-5': { s: 'CS351', c: 'lab', st: 'done' },
    '0-6': null,
    // Tue (today)
    '1-0': { s: 'CS301', c: 'blue', st: 'done' },
    '1-1': { s: 'CS303', c: 'coral', st: 'now' },
    '1-2': { s: 'CS351', c: 'lab', st: 'later' },
    '1-3': { s: 'LUNCH', c: 'lunch' },
    '1-4': { s: 'HU300', c: 'blue', st: 'later' },
    '1-5': { s: 'HU300', c: 'blue', st: 'later' },
    '1-6': null,
    // Wed
    '2-0': { s: 'CS305', c: 'blue', st: 'later' },
    '2-1': { s: 'CS301', c: 'blue', st: 'later' },
    '2-2': { s: 'CS303', c: 'coral', st: 'later' },
    '2-3': { s: 'LUNCH', c: 'lunch' },
    '2-4': { s: 'CS353', c: 'lab', st: 'later' },
    '2-5': { s: 'CS353', c: 'lab', st: 'later' },
    '2-6': null,
    // Thu
    '3-0': { s: 'HU300', c: 'blue', st: 'later' },
    '3-1': { s: 'CS305', c: 'blue', st: 'later' },
    '3-2': { s: 'CS301', c: 'blue', st: 'later' },
    '3-3': { s: 'LUNCH', c: 'lunch' },
    '3-4': { s: 'MENTOR', c: 'coral', st: 'later' },
    '3-5': null, '3-6': null,
    // Fri
    '4-0': { s: 'CS303', c: 'coral', st: 'later' },
    '4-1': { s: 'CS305', c: 'blue', st: 'later' },
    '4-2': { s: 'HU300', c: 'blue', st: 'later' },
    '4-3': { s: 'LUNCH', c: 'lunch' },
    '4-4': { s: 'CS351', c: 'lab', st: 'later' },
    '4-5': { s: 'CS351', c: 'lab', st: 'later' },
    '4-6': null,
  };

  const colorFor = (c, st) => {
    if (c === 'lunch') return { bg: C.neutralBg, fg: C.neutralFg };
    if (st === 'done') {
      if (c === 'blue') return { bg: C.blue600, fg: '#fff' };
      if (c === 'coral') return { bg: C.coral400, fg: '#fff' };
      if (c === 'lab') return { bg: C.blue800, fg: '#fff' };
    }
    if (st === 'now') return { bg: C.coral50, fg: C.coral900, border: `1.5px solid ${C.coral400}` };
    // later
    if (c === 'blue') return { bg: C.blue50, fg: C.blue900 };
    if (c === 'coral') return { bg: C.coral50, fg: C.coral900 };
    if (c === 'lab') return { bg: '#EEF4FA', fg: C.blue800 };
    return { bg: '#fff', fg: C.ink500 };
  };

  return (
    <div style={{ fontFamily: font, background: C.surfaceAlt, minHeight: '100%', paddingBottom: 100 }}>
      <div style={{ padding: '58px 20px 8px' }}>
        <div style={{ fontSize: 13, color: C.ink500 }}>Week of</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <h1 style={{ fontSize: 22, fontWeight: 500, margin: 0, letterSpacing: -0.3 }}>14 Apr – 18 Apr</h1>
        </div>
      </div>

      {/* week toggle */}
      <div style={{ padding: '8px 20px 0', display: 'flex', gap: 6 }}>
        {['This week', 'Next week'].map((t, i) => (
          <div key={i} style={{
            padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500,
            background: i === 0 ? C.ink900 : 'transparent',
            color: i === 0 ? '#fff' : C.ink500,
            border: i === 0 ? 'none' : `0.5px solid ${C.border}`,
          }}>{t}</div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ padding: '12px 20px 0', display: 'flex', gap: 12, fontSize: 11, color: C.ink500 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: C.blue600 }} /> Done
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: C.coral50, border: `1.5px solid ${C.coral400}` }} /> Now
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: C.blue50 }} /> Upcoming
        </span>
      </div>

      {/* grid */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '28px repeat(5, 1fr)',
          gap: 4, fontSize: 10,
        }}>
          <div />
          {days.map((d, i) => (
            <div key={d} style={{
              textAlign: 'center', padding: '6px 0', fontSize: 11, fontWeight: 500,
              color: i === 1 ? C.blue600 : C.ink500,
            }}>
              {d}
              <div style={{ fontSize: 13, marginTop: 2, fontFamily: mono, color: i === 1 ? C.blue600 : C.ink900 }}>
                {14 + i}
              </div>
            </div>
          ))}
          {hours.map((h, hi) => (
            <React.Fragment key={h}>
              <div style={{
                fontSize: 10, color: C.ink300, fontFamily: mono,
                textAlign: 'right', paddingTop: 6, paddingRight: 2,
              }}>{h}</div>
              {days.map((_, di) => {
                const k = `${di}-${hi}`;
                const slot = slots[k];
                if (!slot) return <div key={k} style={{ height: 36, borderRadius: 6, background: 'rgba(0,0,0,0.02)' }} />;
                const cl = colorFor(slot.c, slot.st);
                if (slot.c === 'lunch') {
                  return <div key={k} style={{
                    height: 36, borderRadius: 6, background: cl.bg, color: cl.fg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, letterSpacing: 0.3, textTransform: 'uppercase', fontWeight: 500,
                  }}>Lunch</div>;
                }
                return (
                  <div key={k} style={{
                    height: 36, borderRadius: 6, background: cl.bg, color: cl.fg,
                    border: cl.border || 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 500, fontFamily: mono,
                    position: 'relative',
                  }}>
                    {slot.s}
                    {slot.st === 'now' && (
                      <div style={{ position: 'absolute', top: 3, right: 4, width: 5, height: 5, borderRadius: 999, background: C.coral400 }} />
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* next class card */}
      <div style={{ padding: '20px' }}>
        <div style={{ background: '#fff', border: `0.5px solid ${C.border}`, borderRadius: 12, padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 4, height: 40, background: C.coral400, borderRadius: 2 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: C.coral600, fontWeight: 500, letterSpacing: 0.3, textTransform: 'uppercase' }}>Now</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: C.ink900, marginTop: 2 }}>Operating Systems</div>
            <div style={{ fontSize: 12, color: C.ink500, marginTop: 2, fontFamily: mono }}>LH‑4 · ends 10:50</div>
          </div>
          <Btn variant="ghost" size="sm">Details</Btn>
        </div>
      </div>

      <BottomNav active="timetable" />
    </div>
  );
}

// ============================================================================
// Communities screen
// ============================================================================
function Communities() {
  const joined = [
    { name: 'IEEE Student Branch', tag: 'IE', color: C.coral400, members: 248, unread: 3, ev: 'Hackstorm · Sat' },
    { name: 'MuLearn GCEK', tag: 'ML', color: C.blue600, members: 412, unread: 0, ev: 'Weekly task drops Mon' },
    { name: 'NSS Unit 42', tag: 'NS', color: C.blue800, members: 186, unread: 1, ev: 'Blood camp · Wed' },
  ];
  const discover = [
    { name: 'CSI Chapter', tag: 'CS', color: '#6a4fb5', members: 312 },
    { name: 'Drama Club', tag: 'DC', color: C.coral600, members: 94 },
    { name: 'Tathva Hackathon Team', tag: 'TH', color: '#2a7a5a', members: 58 },
  ];
  return (
    <div style={{ fontFamily: font, background: C.surfaceAlt, minHeight: '100%', paddingBottom: 100 }}>
      <div style={{ padding: '58px 20px 8px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 13, color: C.ink500 }}>GCE Kannur</div>
          <h1 style={{ fontSize: 22, fontWeight: 500, margin: '2px 0 0', letterSpacing: -0.3 }}>Communities</h1>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: 999, background: C.blue600,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20,
        }}>+</div>
      </div>

      {/* search */}
      <div style={{ padding: '12px 20px 0' }}>
        <div style={{
          height: 40, background: '#fff', border: `0.5px solid ${C.border}`,
          borderRadius: 8, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 10,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke={C.ink300} strokeWidth="1.5"/><path d="M11 11l3 3" stroke={C.ink300} strokeWidth="1.5" strokeLinecap="round"/></svg>
          <span style={{ fontSize: 14, color: C.ink300 }}>Search communities, events…</span>
        </div>
      </div>

      {/* joined */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: -0.2 }}>Your communities</div>
          <span style={{ fontSize: 12, color: C.ink500, fontFamily: mono }}>3</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {joined.map(c => (
            <div key={c.name} style={{
              background: '#fff', border: `0.5px solid ${C.border}`, borderRadius: 12,
              padding: 14, display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10, background: c.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 500, fontFamily: mono, fontSize: 15, flexShrink: 0,
              }}>{c.tag}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: C.ink900 }}>{c.name}</div>
                  {c.unread > 0 && (
                    <div style={{
                      minWidth: 16, height: 16, padding: '0 5px', borderRadius: 999,
                      background: C.coral400, color: '#fff', fontSize: 10, fontWeight: 500,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{c.unread}</div>
                  )}
                </div>
                <div style={{ fontSize: 12, color: C.ink500, marginTop: 3 }}>
                  <span style={{ fontFamily: mono }}>{c.members}</span> members · {c.ev}
                </div>
              </div>
              {Icon.chevron(12, C.ink300)}
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming events */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 10, letterSpacing: -0.2 }}>Upcoming</div>
        <div style={{
          background: '#fff', borderRadius: 12, border: `0.5px solid ${C.border}`,
          overflow: 'hidden',
        }}>
          <div style={{ padding: 14, display: 'flex', gap: 12, borderBottom: `0.5px solid ${C.border}` }}>
            <div style={{
              width: 54, textAlign: 'center', flexShrink: 0,
              padding: '8px 0', background: C.coral50, borderRadius: 8,
            }}>
              <div style={{ fontSize: 10, color: C.coral600, letterSpacing: 0.3, textTransform: 'uppercase', fontWeight: 500 }}>Sat</div>
              <div style={{ fontSize: 20, color: C.coral900, fontFamily: mono, fontWeight: 500, marginTop: 2, lineHeight: 1 }}>19</div>
              <div style={{ fontSize: 9, color: C.coral800, marginTop: 2, fontFamily: mono }}>APR</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Hackstorm 2026</div>
              <div style={{ fontSize: 11, color: C.ink500, marginTop: 4, display: 'flex', gap: 10 }}>
                <span>IEEE</span><span>9:00 – 21:00</span><span>Seminar Hall</span>
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                <Chip kind="duty" dot={false}>Duty leave ok</Chip>
                <Chip kind="neutral" dot={false}>34 going</Chip>
              </div>
            </div>
          </div>
          <div style={{ padding: 14, display: 'flex', gap: 12 }}>
            <div style={{
              width: 54, textAlign: 'center', flexShrink: 0,
              padding: '8px 0', background: C.blue50, borderRadius: 8,
            }}>
              <div style={{ fontSize: 10, color: C.blue600, letterSpacing: 0.3, textTransform: 'uppercase', fontWeight: 500 }}>Wed</div>
              <div style={{ fontSize: 20, color: C.blue900, fontFamily: mono, fontWeight: 500, marginTop: 2, lineHeight: 1 }}>23</div>
              <div style={{ fontSize: 9, color: C.blue800, marginTop: 2, fontFamily: mono }}>APR</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Blood donation camp</div>
              <div style={{ fontSize: 11, color: C.ink500, marginTop: 4, display: 'flex', gap: 10 }}>
                <span>NSS Unit 42</span><span>10:00 – 15:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Discover */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 10, letterSpacing: -0.2 }}>Discover</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {discover.map(c => (
            <div key={c.name} style={{
              background: '#fff', border: `0.5px solid ${C.border}`, borderRadius: 12, padding: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, background: c.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontFamily: mono, fontWeight: 500, fontSize: 13,
              }}>{c.tag}</div>
              <div style={{ fontSize: 13, fontWeight: 500, marginTop: 10, lineHeight: 1.25 }}>{c.name}</div>
              <div style={{ fontSize: 11, color: C.ink500, marginTop: 4, fontFamily: mono }}>{c.members} members</div>
              <div style={{ marginTop: 10, fontSize: 11, color: C.blue600, fontWeight: 500 }}>Join</div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav active="communities" />
    </div>
  );
}

// ============================================================================
// University updates
// ============================================================================
function Updates() {
  const items = [
    { tag: 'KTU', kind: 'exam', time: '2h', title: 'S6 end‑semester hall tickets live', body: 'Download before Friday from ktu.edu.in/portal', pinned: true },
    { tag: 'KTU', kind: 'result', time: '1d', title: 'S4 (2023 scheme) results published', body: 'Check portal. Revaluation window 7 days.' },
    { tag: 'GCEK', kind: 'circular', time: '2d', title: 'Monsoon schedule effective 1 June', body: 'Classes 8:30 – 3:30. Lab hours unchanged.' },
    { tag: 'Calicut', kind: 'holiday', time: '3d', title: 'Vishu holiday notification', body: 'Mon 14 Apr declared holiday for all affiliated colleges.' },
    { tag: 'KTU', kind: 'circular', time: '5d', title: 'Academic calendar 2026‑27 draft', body: 'Feedback open till 25 April on portal.' },
  ];
  const chipStyles = {
    exam: { bg: C.riskBg, fg: C.riskFg },
    result: { bg: C.safeBg, fg: C.safeFg },
    holiday: { bg: C.coral50, fg: C.coral900 },
    circular: { bg: C.blue50, fg: C.blue900 },
  };
  return (
    <div style={{ fontFamily: font, background: C.surfaceAlt, minHeight: '100%', paddingBottom: 100 }}>
      <div style={{ padding: '58px 20px 8px' }}>
        <div style={{ fontSize: 13, color: C.ink500 }}>A.P.J. Abdul Kalam Tech University</div>
        <h1 style={{ fontSize: 22, fontWeight: 500, margin: '2px 0 0', letterSpacing: -0.3 }}>University updates</h1>
      </div>

      {/* filter tabs */}
      <div style={{ padding: '12px 20px 0', display: 'flex', gap: 6, overflow: 'auto' }}>
        {['All', 'Exam', 'Result', 'Holiday', 'Circular'].map((t, i) => (
          <div key={t} style={{
            padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500,
            background: i === 0 ? C.ink900 : '#fff',
            color: i === 0 ? '#fff' : C.ink700,
            border: i === 0 ? 'none' : `0.5px solid ${C.border}`,
            whiteSpace: 'nowrap',
          }}>{t}</div>
        ))}
      </div>

      <div style={{ padding: '14px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((it, i) => {
          const cs = chipStyles[it.kind];
          return (
            <div key={i} style={{
              background: '#fff', border: `0.5px solid ${C.border}`, borderRadius: 12, padding: 14,
              position: 'relative',
            }}>
              {it.pinned && (
                <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: C.ink500 }}>
                  {Icon.pin(12, C.ink500)} Pinned
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <span style={{
                  fontSize: 10, fontWeight: 500, padding: '2px 6px', borderRadius: 4,
                  background: C.blue600, color: '#fff', fontFamily: mono,
                }}>{it.tag}</span>
                <span style={{
                  fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 999,
                  background: cs.bg, color: cs.fg,
                }}>{it.kind}</span>
                <span style={{ fontSize: 10, color: C.ink300, fontFamily: mono, marginLeft: 'auto', marginRight: it.pinned ? 60 : 0 }}>{it.time} ago</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>{it.title}</div>
              <div style={{ fontSize: 12, color: C.ink500, marginTop: 4, lineHeight: 1.45 }}>{it.body}</div>
            </div>
          );
        })}
      </div>

      <BottomNav active="home" />
    </div>
  );
}

Object.assign(window, { Timetable, Communities, Updates });
