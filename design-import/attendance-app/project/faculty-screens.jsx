// Attendly faculty mobile screens — Home, Class detail, Leave approvals, Reports

function FacultyHome() {
  const today = [
    { time: '9:00',  code: 'CS301', name: 'Compiler Design', room: 'LH‑2', status: 'done', present: 52, total: 58 },
    { time: '10:00', code: 'CS303', name: 'Operating Systems', room: 'LH‑4', status: 'now' },
    { time: '11:30', code: 'CS351', name: 'CS Lab',          room: 'Lab 3', status: 'later' },
    { time: '2:00',  code: 'CS305', name: 'Algorithms',      room: 'LH‑1', status: 'later' },
  ];
  return (
    <div style={{ fontFamily: font, background: C.surfaceAlt, minHeight: '100%', paddingBottom: 100 }}>
      <div style={{ padding: '54px 20px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 13, color: C.ink500 }}>Tuesday, 14 April</div>
          <div style={{ fontSize: 22, fontWeight: 500, marginTop: 2, letterSpacing: -0.3 }}>Good morning, Dr. Suja</div>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 999, background: C.blue200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.blue900, fontSize: 13, fontWeight: 500 }}>SN</div>
      </div>

      {/* Hero — attendance pending */}
      <div style={{ padding: '8px 20px 0' }}>
        <div style={{
          background: C.blue900, color: '#fff', borderRadius: 16, padding: 20,
          position: 'relative', overflow: 'hidden',
        }}>
          <Eyebrow color={C.blue200}>To do · now</Eyebrow>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <div style={{ fontSize: 52, fontWeight: 500, letterSpacing: -1.5, lineHeight: 1, fontFamily: mono }}>3</div>
            <div style={{ fontSize: 14, color: C.blue200 }}>classes need marking</div>
          </div>
          <div style={{ marginTop: 14, fontSize: 14, color: '#fff', lineHeight: 1.4 }}>
            Operating Systems is live now. Tap to mark.
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
            <Btn variant="accent" size="sm">Mark now</Btn>
            <div style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '7px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500 }}>All present (1 tap)</div>
          </div>
          <div style={{ position: 'absolute', right: -30, top: -30, width: 120, height: 120, borderRadius: 999, background: C.blue800, opacity: 0.5 }} />
        </div>
      </div>

      {/* 2-up */}
      <div style={{ padding: '12px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: C.blue50, borderRadius: 12, padding: 12 }}>
          <Eyebrow color={C.blue600}>Leave queue</Eyebrow>
          <div style={{ fontSize: 22, fontWeight: 500, color: C.blue900, fontFamily: mono }}>5</div>
          <div style={{ fontSize: 11, color: C.blue800, marginTop: 4 }}>pending · oldest 2d</div>
        </div>
        <div style={{ background: C.coral50, borderRadius: 12, padding: 12 }}>
          <Eyebrow color={C.coral600}>At-risk</Eyebrow>
          <div style={{ fontSize: 22, fontWeight: 500, color: C.coral900, fontFamily: mono }}>12</div>
          <div style={{ fontSize: 11, color: C.coral800, marginTop: 4 }}>below 75% in your classes</div>
        </div>
      </div>

      {/* Today's teaching */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 10, letterSpacing: -0.2 }}>Your teaching today</div>
        <Card style={{ padding: 0 }}>
          {today.map((cls, i) => {
            const st = cls.status === 'done'
              ? <Chip kind="safe" dot={false}>Marked · {cls.present}/{cls.total}</Chip>
              : cls.status === 'now'
                ? <Chip kind="duty" dot={false}><span style={{ width: 6, height: 6, borderRadius: 999, background: C.blue400 }}/>Mark now</Chip>
                : <span style={{ fontSize: 12, color: C.ink300 }}>Later</span>;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                borderBottom: i < today.length - 1 ? `0.5px solid ${C.border}` : 'none',
              }}>
                <div style={{ minWidth: 42, fontFamily: mono, fontSize: 12, color: C.ink500 }}>{cls.time}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{cls.name}</div>
                  <div style={{ fontSize: 12, color: C.ink500, marginTop: 2 }}>
                    <span style={{ fontFamily: mono }}>{cls.code}</span> · {cls.room}
                  </div>
                </div>
                {st}
              </div>
            );
          })}
        </Card>
      </div>

      {/* Community duty-leave alerts */}
      <div style={{ padding: '20px 20px 0' }}>
        <Eyebrow>Community requests awaiting you</Eyebrow>
        <div style={{
          background: C.coral50, borderLeft: `3px solid ${C.coral400}`,
          borderRadius: '0 12px 12px 0', padding: '12px 14px',
        }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: C.coral900 }}>3 duty leaves for Hackstorm 2026</div>
          <div style={{ fontSize: 12, color: C.coral800, marginTop: 4 }}>IEEE · Sat 19 Apr · tap to bulk approve</div>
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  );
}

// ─────────────────────────────────────────────
// Class detail — faculty
// ─────────────────────────────────────────────
function FacultyClassDetail() {
  const atRisk = [
    { name: 'Ananya R', reg: 'KTE21CS015', pct: 68 },
    { name: 'Fathima N', reg: 'KTE21CS027', pct: 71 },
    { name: 'Rohan P',   reg: 'KTE21CS048', pct: 73 },
  ];
  return (
    <div style={{ fontFamily: font, background: C.surfaceAlt, minHeight: '100%', paddingBottom: 100 }}>
      <div style={{ padding: '54px 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 999, background: '#fff', border: `0.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M10 2L4 7l6 5" stroke={C.ink700} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </div>
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ fontSize: 12, color: C.ink500, fontFamily: mono }}>CS303 · S6 CSE‑B · 58 students</div>
        <h1 style={{ fontSize: 22, fontWeight: 500, margin: '2px 0 0', letterSpacing: -0.3 }}>Operating Systems</h1>
      </div>

      {/* hero aggregate */}
      <div style={{ padding: '20px 20px 0' }}>
        <Card>
          <Eyebrow>Class average</Eyebrow>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <div style={{ fontSize: 42, fontWeight: 500, fontFamily: mono, lineHeight: 1, letterSpacing: -1 }}>79<span style={{ fontSize: 22 }}>%</span></div>
            <Chip kind="warn">Watch</Chip>
          </div>
          <div style={{ fontSize: 11, color: C.ink500, marginTop: 10, fontFamily: mono }}>1624 / 2054 hrs marked</div>
          <div style={{ marginTop: 12 }}><Progress value={79} kind="warn" /></div>
        </Card>
      </div>

      {/* distribution */}
      <div style={{ padding: '12px 20px 0' }}>
        <Card>
          <Eyebrow>Distribution</Eyebrow>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 4 }}>
            {[
              { k: 'Safe',  v: 34, color: '#4e8a28' },
              { k: 'Watch', v: 12, color: '#d08b2e' },
              { k: 'Risk',  v: 12, color: C.coral400 },
            ].map(d => (
              <div key={d.k} style={{ padding: '10px 12px', background: C.surfaceAlt, borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: C.ink500, letterSpacing: 0.3, textTransform: 'uppercase', fontWeight: 500 }}>{d.k}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                  <div style={{ fontSize: 22, fontFamily: mono, fontWeight: 500, lineHeight: 1 }}>{d.v}</div>
                  <div style={{ width: 8, height: 8, borderRadius: 999, background: d.color }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* at-risk list */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: -0.2 }}>At‑risk</div>
          <span style={{ fontSize: 12, color: C.ink500, fontFamily: mono }}>12</span>
        </div>
        <Card style={{ padding: 0 }}>
          {atRisk.map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
              borderBottom: i < atRisk.length - 1 ? `0.5px solid ${C.border}` : 'none',
            }}>
              <div style={{ width: 30, height: 30, borderRadius: 999, background: C.riskBg, color: C.riskFg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500 }}>
                {s.name.split(' ').map(w => w[0]).slice(0,2).join('')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{s.name}</div>
                <div style={{ fontSize: 10, color: C.ink500, fontFamily: mono, marginTop: 2 }}>{s.reg}</div>
              </div>
              <Chip kind="risk" dot={false}>{s.pct}%</Chip>
            </div>
          ))}
        </Card>
      </div>

      <div style={{ padding: '20px', display: 'flex', gap: 10 }}>
        <Btn variant="secondary" style={{ flex: 1 }}>Message class</Btn>
        <Btn variant="primary" style={{ flex: 1 }}>Mark now</Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Leave approvals — faculty mobile queue
// ─────────────────────────────────────────────
function FacultyLeaveApprovals() {
  const leaves = [
    { who: 'Aysha Salim', reg: 'KTE21CS021', kind: 'duty', reason: 'IEEE Hackstorm 2026 · representing college team', dates: 'Sat 19 Apr', community: 'IEEE', prof: true, impact: 'Will stay at 82%' },
    { who: 'Joel Thomas', reg: 'KTE21CS036', kind: 'medical', reason: 'Dengue · 3 days bed rest', dates: '15 – 17 Apr', prof: true, impact: 'Drops to 76% (Watch)' },
    { who: 'Priya Mohan', reg: 'KTE21CS045', kind: 'duty', reason: 'NSS blood donation camp', dates: 'Wed 23 Apr', community: 'NSS', prof: true, impact: 'Stays at 88%' },
    { who: 'Rohan Pillai', reg: 'KTE21CS048', kind: 'personal', reason: 'Family function at hometown', dates: '17 – 18 Apr', impact: 'Drops to 71% (Risk)' },
  ];

  return (
    <div style={{ fontFamily: font, background: C.surfaceAlt, minHeight: '100%', paddingBottom: 100 }}>
      <div style={{ padding: '58px 20px 8px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 13, color: C.ink500 }}>You · CSE</div>
          <h1 style={{ fontSize: 22, fontWeight: 500, margin: '2px 0 0', letterSpacing: -0.3 }}>Leave approvals</h1>
        </div>
        <div style={{ background: C.coral400, color: '#fff', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500, fontFamily: mono }}>{leaves.length} pending</div>
      </div>

      {/* filter chips */}
      <div className="nowheel" style={{ padding: '12px 20px 0', display: 'flex', gap: 6, overflow: 'auto' }}>
        {['Pending 4', 'Duty leave 2', 'Medical 1', 'Personal 1', 'History'].map((t, i) => (
          <div key={t} style={{
            padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500,
            background: i === 0 ? C.ink900 : '#fff',
            color: i === 0 ? '#fff' : C.ink700,
            border: i === 0 ? 'none' : `0.5px solid ${C.border}`,
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>{t}</div>
        ))}
      </div>

      <div style={{ padding: '14px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {leaves.map((l, i) => {
          const chipKind = l.kind === 'duty' ? 'duty' : l.kind === 'medical' ? 'warn' : 'neutral';
          return (
            <div key={i} style={{
              background: '#fff', border: `0.5px solid ${C.border}`, borderRadius: 12, padding: 14,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 999, background: C.blue50, color: C.blue800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, flexShrink: 0 }}>
                  {l.who.split(' ').map(w => w[0]).slice(0,2).join('')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{l.who}</div>
                    <Chip kind={chipKind} dot={false}>{l.kind}</Chip>
                  </div>
                  <div style={{ fontSize: 11, color: C.ink500, marginTop: 2, fontFamily: mono }}>{l.reg}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: C.ink700, marginTop: 10, lineHeight: 1.45 }}>{l.reason}</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 11, color: C.ink500 }}>
                <span style={{ fontFamily: mono }}>{l.dates}</span>
                {l.community && <span>· {l.community}</span>}
                {l.prof && <span style={{ color: C.blue600 }}>· Proof attached</span>}
              </div>
              <div style={{
                marginTop: 10, padding: '8px 10px', fontSize: 12,
                background: l.impact.includes('Risk') ? C.riskBg : l.impact.includes('Watch') ? C.warnBg : C.safeBg,
                color: l.impact.includes('Risk') ? C.riskFg : l.impact.includes('Watch') ? C.warnFg : C.safeFg,
                borderRadius: 6,
              }}>After approval: {l.impact}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <Btn variant="primary" size="sm" style={{ flex: 1 }}>Approve</Btn>
                <Btn variant="secondary" size="sm" style={{ flex: 1 }}>Decline</Btn>
                <Btn variant="ghost" size="sm">Later</Btn>
              </div>
            </div>
          );
        })}
      </div>

      <BottomNav active="home" />
    </div>
  );
}

// ─────────────────────────────────────────────
// Reports — faculty mobile
// ─────────────────────────────────────────────
function FacultyReports() {
  const subjects = [
    { code: 'CS301', name: 'Compiler Design',    sem: 'S6', avg: 82, dist: [34, 14, 10] },
    { code: 'CS303', name: 'Operating Systems',  sem: 'S6', avg: 79, dist: [34, 12, 12] },
    { code: 'CS351', name: 'CS Lab',             sem: 'S6', avg: 88, dist: [49, 6,  3]  },
  ];
  return (
    <div style={{ fontFamily: font, background: C.surfaceAlt, minHeight: '100%', paddingBottom: 100 }}>
      <div style={{ padding: '58px 20px 8px' }}>
        <div style={{ fontSize: 13, color: C.ink500 }}>Semester 6 · ending 15 May</div>
        <h1 style={{ fontSize: 22, fontWeight: 500, margin: '2px 0 0', letterSpacing: -0.3 }}>Reports</h1>
      </div>

      {/* quick exports */}
      <div style={{ padding: '14px 20px 0' }}>
        <Eyebrow>Quick exports</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { l: 'Course attendance',  s: 'CSV · all subjects', bg: C.blue50, fg: C.blue900, accent: C.blue600 },
            { l: 'At‑risk cohort',     s: 'PDF · below 75%',     bg: C.coral50, fg: C.coral900, accent: C.coral400 },
            { l: 'Monthly summary',    s: 'PDF · April',         bg: '#fff', fg: C.ink900, accent: C.ink500, border: true },
            { l: 'NAAC attainment',    s: 'XLSX · OBE ready',    bg: '#fff', fg: C.ink900, accent: C.ink500, border: true },
          ].map(r => (
            <div key={r.l} style={{
              background: r.bg, borderRadius: 12, padding: 14,
              border: r.border ? `0.5px solid ${C.border}` : 'none',
            }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: r.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="14" viewBox="0 0 12 14"><path d="M6 1v9m0 0l3-3m-3 3L3 7M1 12h10" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: r.fg, marginTop: 10 }}>{r.l}</div>
              <div style={{ fontSize: 11, color: C.ink500, marginTop: 3 }}>{r.s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Subject averages */}
      <div style={{ padding: '20px 20px 0' }}>
        <Eyebrow>Subject averages</Eyebrow>
        <Card style={{ padding: 0 }}>
          {subjects.map((s, i) => {
            const kind = s.avg >= 80 ? 'safe' : s.avg >= 75 ? 'warn' : 'risk';
            return (
              <div key={i} style={{
                padding: '14px 16px',
                borderBottom: i < subjects.length - 1 ? `0.5px solid ${C.border}` : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: C.ink500, fontFamily: mono, marginTop: 2 }}>{s.code} · {s.sem}</div>
                  </div>
                  <Chip kind={kind}>{s.avg}%</Chip>
                </div>
                <Progress value={s.avg} kind={kind} />
                <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 10, color: C.ink500, fontFamily: mono }}>
                  <span>Safe {s.dist[0]}</span><span>Watch {s.dist[1]}</span><span>Risk {s.dist[2]}</span>
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      {/* Scheduled reports */}
      <div style={{ padding: '20px 20px 0' }}>
        <Eyebrow>Scheduled</Eyebrow>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Weekly attendance summary</div>
          <div style={{ fontSize: 12, color: C.ink500, marginTop: 4 }}>Auto‑emailed to HoD every Monday 8:00 · last sent 2d ago</div>
        </Card>
      </div>

      <BottomNav active="home" />
    </div>
  );
}

Object.assign(window, { FacultyHome, FacultyClassDetail, FacultyLeaveApprovals, FacultyReports });
