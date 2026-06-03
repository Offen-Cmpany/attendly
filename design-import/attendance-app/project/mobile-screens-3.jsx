// Attendly mobile — leave request + profile (small supplementary screens)

function LeaveRequest() {
  return (
    <div style={{ fontFamily: font, background: C.surfaceAlt, minHeight: '100%', paddingBottom: 40 }}>
      <div style={{ padding: '54px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 36, height: 36, borderRadius: 999, background: '#fff', border: `0.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 3l8 8M11 3l-8 8" stroke={C.ink700} strokeWidth="1.8" strokeLinecap="round"/></svg>
        </div>
        <span style={{ fontSize: 13, color: C.ink500 }}>Step 1 of 2</span>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, margin: 0, letterSpacing: -0.3 }}>Request leave</h1>
        <div style={{ fontSize: 13, color: C.ink500, marginTop: 4 }}>
          We'll forward this to Dr. Suja N and notify you when a decision is made.
        </div>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ fontSize: 12, color: C.ink500, marginBottom: 8 }}>Reason</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { id: 'medical', label: 'Medical', sel: false },
            { id: 'duty', label: 'Duty leave', sel: true },
            { id: 'personal', label: 'Personal', sel: false },
            { id: 'other', label: 'Other', sel: false },
          ].map(o => (
            <div key={o.id} style={{
              padding: '12px 14px', borderRadius: 8,
              background: o.sel ? C.blue50 : '#fff',
              border: o.sel ? `1px solid ${C.blue400}` : `0.5px solid ${C.border}`,
              fontSize: 14, fontWeight: 500,
              color: o.sel ? C.blue800 : C.ink700,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              {o.label}
              {o.sel && <div style={{ width: 18, height: 18, borderRadius: 999, background: C.blue600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icon.check(10, '#fff')}</div>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ fontSize: 12, color: C.ink500, marginBottom: 8 }}>Linked event · community</div>
        <div style={{ background: '#fff', border: `0.5px solid ${C.border}`, borderRadius: 8, padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: C.coral400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 500, fontFamily: mono }}>IE</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Hackstorm 2026</div>
            <div style={{ fontSize: 11, color: C.ink500, marginTop: 2 }}>IEEE · Sat 19 Apr · 9:00–21:00</div>
          </div>
          {Icon.chevron(12, C.ink300)}
        </div>
      </div>

      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ fontSize: 12, color: C.ink500, marginBottom: 8 }}>Dates</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ background: '#fff', border: `0.5px solid ${C.border}`, borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ fontSize: 10, color: C.ink500 }}>From</div>
            <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>Sat 19 Apr</div>
          </div>
          <div style={{ background: '#fff', border: `0.5px solid ${C.border}`, borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ fontSize: 10, color: C.ink500 }}>To</div>
            <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>Sat 19 Apr</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ fontSize: 12, color: C.ink500, marginBottom: 8 }}>Note to faculty</div>
        <div style={{
          background: '#fff', border: `0.5px solid ${C.border}`, borderRadius: 8,
          padding: 12, fontSize: 13, color: C.ink700, minHeight: 76, lineHeight: 1.5,
        }}>
          Representing the college IEEE chapter at Hackstorm. Team of 4, will cover missed lab next Tuesday.
        </div>
      </div>

      <div style={{ padding: '16px 20px 0' }}>
        <div style={{
          background: C.blue50, borderLeft: `3px solid ${C.blue400}`,
          borderRadius: '0 8px 8px 0', padding: '10px 12px',
          fontSize: 12, color: C.blue800, lineHeight: 1.5,
        }}>
          Duty leave for community events doesn't count as absent.
          You'll stay at <b style={{ fontWeight: 500 }}>82%</b>.
        </div>
      </div>

      <div style={{ padding: '24px 20px 0', display: 'flex', gap: 10 }}>
        <Btn variant="ghost" style={{ flex: 1 }}>Save draft</Btn>
        <Btn variant="primary" style={{ flex: 1.6 }}>Attach proof & submit</Btn>
      </div>
    </div>
  );
}

function Profile() {
  return (
    <div style={{ fontFamily: font, background: C.surfaceAlt, minHeight: '100%', paddingBottom: 100 }}>
      <div style={{ padding: '58px 20px 12px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 999, background: C.coral200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 500, fontSize: 22,
        }}>AS</div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, margin: 0, letterSpacing: -0.3 }}>Aysha Salim</h1>
          <div style={{ fontSize: 12, color: C.ink500, marginTop: 4, fontFamily: mono }}>KTE21CS021 · S6 CSE‑B</div>
        </div>
      </div>

      <div style={{ padding: '8px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ background: '#fff', border: `0.5px solid ${C.border}`, borderRadius: 12, padding: 12 }}>
          <div style={{ fontSize: 11, color: C.ink500 }}>Attendance goal</div>
          <div style={{ fontSize: 20, fontWeight: 500, fontFamily: mono, marginTop: 4 }}>85%</div>
        </div>
        <div style={{ background: '#fff', border: `0.5px solid ${C.border}`, borderRadius: 12, padding: 12 }}>
          <div style={{ fontSize: 11, color: C.ink500 }}>Semester</div>
          <div style={{ fontSize: 20, fontWeight: 500, fontFamily: mono, marginTop: 4 }}>6 / 8</div>
        </div>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        <Eyebrow>Preferences</Eyebrow>
        <div style={{ background: '#fff', border: `0.5px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
          {[
            { l: 'Language', r: 'English · മലയാളം' },
            { l: 'Attendance alerts', r: 'At 78%' },
            { l: 'Class reminders', r: '10 min before' },
            { l: 'Community notifications', r: 'Events only' },
          ].map((r, i, a) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', padding: '14px 16px',
              borderBottom: i < a.length - 1 ? `0.5px solid ${C.border}` : 'none',
            }}>
              <div style={{ flex: 1, fontSize: 14 }}>{r.l}</div>
              <div style={{ fontSize: 12, color: C.ink500, marginRight: 8 }}>{r.r}</div>
              {Icon.chevron(12, C.ink300)}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        <Eyebrow>Institution</Eyebrow>
        <div style={{ background: '#fff', border: `0.5px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
          {[
            { l: 'College', r: 'GCE Kannur' },
            { l: 'University', r: 'KTU' },
            { l: 'Mentor', r: 'Dr. Suja N' },
          ].map((r, i, a) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', padding: '14px 16px',
              borderBottom: i < a.length - 1 ? `0.5px solid ${C.border}` : 'none',
            }}>
              <div style={{ flex: 1, fontSize: 14 }}>{r.l}</div>
              <div style={{ fontSize: 13, color: C.ink700 }}>{r.r}</div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav active="profile" />
    </div>
  );
}

Object.assign(window, { LeaveRequest, Profile });
