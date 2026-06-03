// Attendly web app — faculty/admin desktop surface

function WebApp() {
  const atRisk = [
    { name: 'Ananya Ramachandran', reg: 'KTE21CS015', pct: 68, trend: '−4', classes: 'CS303, CS305' },
    { name: 'Fathima Nasrin', reg: 'KTE21CS027', pct: 71, trend: '−2', classes: 'CS301, HU300' },
    { name: 'Rohan Pillai', reg: 'KTE21CS048', pct: 73, trend: '−1', classes: 'CS303' },
    { name: 'Sneha K', reg: 'KTE21CS054', pct: 74, trend: '−3', classes: 'CS305, CS351' },
  ];
  const leaves = [
    { who: 'Aysha Salim', reg: 'KTE21CS021', kind: 'duty', reason: 'IEEE Hackstorm 2026', dates: '19 Apr', community: 'IEEE', status: 'pending' },
    { who: 'Joel Thomas', reg: 'KTE21CS036', kind: 'medical', reason: 'Dengue · bed rest', dates: '15–17 Apr', status: 'pending' },
    { who: 'Priya Mohan', reg: 'KTE21CS045', kind: 'duty', reason: 'NSS blood donation camp', dates: '23 Apr', community: 'NSS', status: 'pending' },
  ];

  return (
    <div style={{ fontFamily: font, background: '#fafaf7', minHeight: '100%', display: 'flex', color: C.ink900 }}>
      {/* SIDEBAR */}
      <aside style={{
        width: 230, background: '#fff', borderRight: `0.5px solid ${C.border}`,
        padding: '20px 0', display: 'flex', flexDirection: 'column', flexShrink: 0,
      }}>
        <div style={{ padding: '0 20px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7, background: C.blue600,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 500, fontSize: 14, fontFamily: mono,
          }}>a</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: -0.2 }}>Attendly</div>
            <div style={{ fontSize: 10, color: C.ink500, fontFamily: mono }}>GCEK · v1.0</div>
          </div>
        </div>

        {[
          { label: 'Dashboard', icon: '▦', active: true },
          { label: 'Classes', icon: '◫' },
          { label: 'Mark attendance', icon: '✓' },
          { label: 'Leave approvals', icon: '↵', badge: 3 },
          { label: 'Reports', icon: '⇣' },
          { label: 'Communities', icon: '◉' },
        ].map(it => (
          <div key={it.label} style={{
            margin: '0 10px', padding: '8px 12px',
            borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
            background: it.active ? C.blue50 : 'transparent',
            color: it.active ? C.blue800 : C.ink700,
            fontSize: 13, fontWeight: 500,
          }}>
            <span style={{ fontFamily: mono, fontSize: 14, width: 18, textAlign: 'center', color: it.active ? C.blue600 : C.ink300 }}>{it.icon}</span>
            <span style={{ flex: 1 }}>{it.label}</span>
            {it.badge && (
              <span style={{
                background: C.coral400, color: '#fff', fontSize: 10, fontWeight: 500,
                padding: '1px 6px', borderRadius: 999,
              }}>{it.badge}</span>
            )}
          </div>
        ))}

        <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: `0.5px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 999, background: C.coral200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 13, fontWeight: 500,
          }}>SN</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Dr. Suja N</div>
            <div style={{ fontSize: 10, color: C.ink500 }}>CSE · HoD</div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, minWidth: 0, padding: '24px 32px 40px' }}>
        {/* header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12, color: C.ink500 }}>Tuesday, 14 April 2026 · Week 14</div>
            <h1 style={{ fontSize: 28, fontWeight: 500, margin: '2px 0 0', letterSpacing: -0.5 }}>Department dashboard</h1>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{
              height: 36, minWidth: 260, background: '#fff', border: `0.5px solid ${C.border}`, borderRadius: 8,
              padding: '0 12px', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <svg width="14" height="14" viewBox="0 0 16 16"><circle cx="7" cy="7" r="5" stroke={C.ink300} strokeWidth="1.5" fill="none"/><path d="M11 11l3 3" stroke={C.ink300} strokeWidth="1.5" strokeLinecap="round"/></svg>
              <span style={{ fontSize: 13, color: C.ink300 }}>Search student, register number…</span>
              <span style={{ marginLeft: 'auto', fontSize: 10, fontFamily: mono, color: C.ink300, border: `0.5px solid ${C.border}`, padding: '1px 5px', borderRadius: 4 }}>⌘K</span>
            </div>
            <Btn variant="primary" size="sm">Export report</Btn>
          </div>
        </div>

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Department average', value: '81', suffix: '%', delta: '+1.2', kind: 'safe', foot: 'vs last week' },
            { label: 'At‑risk students', value: '23', suffix: '', delta: '−5', kind: 'safe', foot: 'below 75%' },
            { label: 'Pending leaves', value: '14', suffix: '', delta: '+3', kind: 'warn', foot: 'oldest · 2d' },
            { label: 'Hours marked today', value: '112', suffix: '/128', delta: null, kind: 'neutral', foot: '7 classes pending' },
          ].map((k, i) => (
            <div key={i} style={{ background: '#fff', border: `0.5px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 11, color: C.ink500, fontWeight: 500, letterSpacing: 0.3, textTransform: 'uppercase' }}>{k.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
                <div style={{ fontSize: 30, fontWeight: 500, fontFamily: mono, lineHeight: 1, letterSpacing: -1 }}>{k.value}<span style={{ fontSize: 16, color: C.ink500 }}>{k.suffix}</span></div>
                {k.delta && (
                  <div style={{ fontSize: 11, fontWeight: 500, color: k.kind === 'safe' ? C.safeFg : k.kind === 'warn' ? C.warnFg : C.ink500, fontFamily: mono }}>
                    {k.delta}
                  </div>
                )}
              </div>
              <div style={{ fontSize: 11, color: C.ink500, marginTop: 6 }}>{k.foot}</div>
            </div>
          ))}
        </div>

        {/* main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* chart */}
          <div style={{ background: '#fff', border: `0.5px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: C.ink500, fontWeight: 500, letterSpacing: 0.3, textTransform: 'uppercase' }}>Attendance by semester</div>
                <div style={{ fontSize: 15, color: C.ink700, marginTop: 4 }}>Computer Science · running average</div>
              </div>
              <div style={{ display: 'flex', gap: 4, padding: 3, background: '#f3f1ec', borderRadius: 6 }}>
                {['Week', 'Month', 'Semester'].map((t, i) => (
                  <div key={t} style={{
                    padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 500,
                    background: i === 1 ? '#fff' : 'transparent',
                    color: i === 1 ? C.ink900 : C.ink500,
                  }}>{t}</div>
                ))}
              </div>
            </div>
            {/* bars */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, height: 180, padding: '0 8px' }}>
              {[
                { sem: 'S1', v: 86, students: 58 },
                { sem: 'S2', v: 82, students: 57 },
                { sem: 'S3', v: 79, students: 54 },
                { sem: 'S4', v: 84, students: 56 },
                { sem: 'S5', v: 78, students: 52 },
                { sem: 'S6', v: 81, students: 58 },
                { sem: 'S7', v: 76, students: 51 },
                { sem: 'S8', v: 88, students: 48 },
              ].map((b, i) => {
                const kind = b.v >= 80 ? 'safe' : b.v >= 75 ? 'warn' : 'risk';
                const color = kind === 'safe' ? '#4e8a28' : kind === 'warn' ? '#d08b2e' : C.coral400;
                return (
                  <div key={b.sem} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 10, color: C.ink500, fontFamily: mono }}>{b.v}%</div>
                    <div style={{
                      width: '100%', height: `${b.v * 1.5}px`, background: color, borderRadius: '4px 4px 0 0',
                      position: 'relative',
                    }}>
                      <div style={{ position: 'absolute', left: 0, right: 0, top: '100%', height: 1, background: C.border }} />
                    </div>
                    <div style={{ fontSize: 11, color: C.ink700, fontWeight: 500, fontFamily: mono }}>{b.sem}</div>
                    <div style={{ fontSize: 9, color: C.ink300, fontFamily: mono, marginTop: -4 }}>n={b.students}</div>
                  </div>
                );
              })}
            </div>
            {/* 75% line indicator */}
            <div style={{ marginTop: 12, fontSize: 11, color: C.ink500, display: 'flex', gap: 14 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, background: '#4e8a28', borderRadius: 2 }} /> Safe ≥80%
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, background: '#d08b2e', borderRadius: 2 }} /> Watch 75–79%
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, background: C.coral400, borderRadius: 2 }} /> Risk &lt;75%
              </span>
            </div>
          </div>

          {/* Leave approvals */}
          <div style={{ background: '#fff', border: `0.5px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: C.ink500, fontWeight: 500, letterSpacing: 0.3, textTransform: 'uppercase' }}>Leave approvals</div>
              <span style={{ fontSize: 11, color: C.blue600, fontWeight: 500 }}>View all {leaves.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {leaves.map((l, i) => (
                <div key={i} style={{ paddingBottom: 14, borderBottom: i < leaves.length - 1 ? `0.5px solid ${C.border}` : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{l.who}</div>
                    <span style={{ fontSize: 10, color: C.ink500, fontFamily: mono }}>{l.reg}</span>
                    <Chip kind={l.kind === 'duty' ? 'duty' : 'warn'} dot={false}>{l.kind}</Chip>
                  </div>
                  <div style={{ fontSize: 12, color: C.ink700, lineHeight: 1.45 }}>{l.reason}</div>
                  <div style={{ fontSize: 11, color: C.ink500, marginTop: 4, fontFamily: mono }}>{l.dates}{l.community ? ` · ${l.community}` : ''}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    <Btn variant="primary" size="sm">Approve</Btn>
                    <Btn variant="ghost" size="sm">Decline</Btn>
                    <div style={{ flex: 1 }} />
                    <span style={{ fontSize: 10, color: C.ink300, alignSelf: 'center' }}>Proof attached</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* At-risk table */}
        <div style={{ background: '#fff', border: `0.5px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `0.5px solid ${C.border}` }}>
            <div>
              <div style={{ fontSize: 11, color: C.ink500, fontWeight: 500, letterSpacing: 0.3, textTransform: 'uppercase' }}>At‑risk cohort</div>
              <div style={{ fontSize: 15, color: C.ink700, marginTop: 2 }}>Students below 75% · S6 CSE‑B</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <Btn variant="secondary" size="sm">Message class</Btn>
              <Btn variant="accent" size="sm">Flag for mentor</Btn>
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#fafaf7' }}>
                {['Student', 'Reg. no.', 'Attendance', 'Progress', 'Trend', 'Critical in', ''].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '10px 20px',
                    fontSize: 11, fontWeight: 500, color: C.ink500,
                    letterSpacing: 0.3, textTransform: 'uppercase',
                    borderBottom: `0.5px solid ${C.border}`,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {atRisk.map((s, i) => {
                const kind = s.pct >= 75 ? 'warn' : 'risk';
                return (
                  <tr key={i} style={{ borderBottom: i < atRisk.length - 1 ? `0.5px solid ${C.border}` : 'none' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 999, background: C.blue50, color: C.blue800,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 500,
                        }}>{s.name.split(' ').map(w => w[0]).slice(0,2).join('')}</div>
                        <span style={{ fontWeight: 500 }}>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', fontFamily: mono, color: C.ink500 }}>{s.reg}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <Chip kind={kind}>{s.pct}%</Chip>
                    </td>
                    <td style={{ padding: '14px 20px', width: 180 }}>
                      <Progress value={s.pct} kind={kind} />
                    </td>
                    <td style={{ padding: '14px 20px', fontFamily: mono, color: C.coral600 }}>{s.trend}</td>
                    <td style={{ padding: '14px 20px', color: C.ink500, fontSize: 12 }}>{s.classes}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <Btn variant="ghost" size="sm">View</Btn>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

Object.assign(window, { WebApp });
