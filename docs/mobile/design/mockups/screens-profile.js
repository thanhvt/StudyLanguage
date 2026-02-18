// ============================================
// Module: Profile & Settings (6 screens)
// ============================================

function renderProfile() {
  // G1: Profile
  const profile = phone('G1: Profile', 'Avatar, stats, settings list', `
    ${statusBar()}
    <div class="scroll-content">
      <div style="display:flex;flex-direction:column;align-items:center;padding:16px 16px 24px">
        <div class="avatar">👤</div>
        <div style="font-family:var(--font-display);font-size:20px;font-weight:700;margin-top:12px">Thành Vũ Trịnh</div>
        <div style="font-size:13px;color:var(--text-tertiary)">thanhvt1.ho@gmail.com</div>
      </div>
      <div class="stats-row">
        <div class="stat-card"><div class="stat-value">🔥 7</div><div class="stat-label">Streak</div></div>
        <div class="stat-card"><div class="stat-value">3.5h</div><div class="stat-label">Time</div></div>
        <div class="stat-card"><div class="stat-value">156</div><div class="stat-label">Words</div></div>
      </div>
      <div class="section-card">
        <div class="section-title">📈 This Week</div>
        <div style="display:flex;justify-content:space-between;align-items:center;height:30px">
          ${['M','T','W','T','F','S','S'].map((d,i) => `<div style="text-align:center"><div style="width:10px;height:10px;border-radius:50%;background:${i<4?'var(--accent)':'var(--bg-tertiary)'};margin:0 auto 3px"></div><span style="font-size:9px;color:var(--text-muted)">${d}</span></div>`).join('')}
        </div>
      </div>
      <div style="padding:4px 16px"><div class="section-title">⚙️ Settings</div></div>
      <div class="list-item"><span class="li-icon">🎨</span><div class="li-content"><div class="li-title">Appearance</div></div><span class="li-arrow">›</span></div>
      <div class="list-item"><span class="li-icon">🔔</span><div class="li-content"><div class="li-title">Notifications</div></div><span class="li-arrow">›</span></div>
      <div class="list-item"><span class="li-icon">📥</span><div class="li-content"><div class="li-title">Download & Storage</div></div><span class="li-arrow">›</span></div>
      <div class="list-item"><span class="li-icon">🔊</span><div class="li-content"><div class="li-title">Audio Settings</div></div><span class="li-arrow">›</span></div>
      <div class="list-item"><span class="li-icon">🔒</span><div class="li-content"><div class="li-title">Privacy</div></div><span class="li-arrow">›</span></div>
      <div class="list-item"><span class="li-icon">ℹ️</span><div class="li-content"><div class="li-title">About</div></div><span class="li-arrow">›</span></div>
      <div style="padding:16px"><button class="cta-btn" style="background:var(--error);margin:0;width:100%">🚪 Đăng xuất</button></div>
    </div>
    ${tabBar('settings')}
  `);

  // G2: Appearance
  const appearance = phone('G2: Appearance', 'Theme, accent, font, language', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">Appearance</span><span class="action">✓</span></div>
    <div class="scroll-content">
      <div class="section-card">
        <div class="section-title">🎨 Theme</div>
        <div class="chip-row"><span class="chip">☀️ Light</span><span class="chip active">🌙 Dark</span><span class="chip">📱 Auto</span></div>
      </div>
      <div class="section-card">
        <div class="section-title">🎨 Accent Color</div>
        <div style="display:flex;gap:12px;align-items:center">
          <div style="width:36px;height:36px;border-radius:50%;background:#06B6D4;border:3px solid var(--border)"></div>
          <div style="width:36px;height:36px;border-radius:50%;background:#F59E0B;border:3px solid var(--accent);box-shadow:0 0 0 2px var(--accent-glow)"></div>
          <div style="width:36px;height:36px;border-radius:50%;background:#8B5CF6;border:3px solid var(--border)"></div>
          <div style="width:36px;height:36px;border-radius:50%;background:#EC4899;border:3px solid var(--border)"></div>
          <div style="width:36px;height:36px;border-radius:50%;background:#3B82F6;border:3px solid var(--border)"></div>
          <div style="width:36px;height:36px;border-radius:50%;background:#22C55E;border:3px solid var(--border)"></div>
        </div>
      </div>
      <div class="section-card">
        <div class="section-title">🔤 Font Size</div>
        <div class="chip-row"><span class="chip">Small</span><span class="chip active">Medium</span><span class="chip">Large</span></div>
        <div style="margin-top:12px;padding:12px;border-radius:var(--r-md);background:var(--bg-tertiary)"><div style="font-size:15px">The quick brown fox jumps over the lazy dog</div></div>
      </div>
      <div class="section-card">
        <div class="section-title">🌐 Language</div>
        <div class="chip-row"><span class="chip">English</span><span class="chip active">Tiếng Việt</span></div>
      </div>
    </div>
  `);

  // G3: Notifications
  const notifications = phone('G3: Notifications', 'Reminders, streak, quiet hours', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">Notifications</span><span class="action">✓</span></div>
    <div class="scroll-content">
      <div class="section-card">
        <div class="toggle-row"><div><div class="toggle-label">📅 Daily Reminder</div><div class="toggle-sub">Nhắc nhở luyện tập hàng ngày</div></div><div class="toggle-switch on"></div></div>
        <div style="padding:8px 0;font-size:13px;color:var(--accent)">⏰ 19:00</div>
      </div>
      <div class="section-card">
        <div class="toggle-row"><div><div class="toggle-label">🔥 Streak Warning</div><div class="toggle-sub">"2 giờ nữa mất streak!"</div></div><div class="toggle-switch on"></div></div>
        <div style="padding:8px 0;font-size:13px;color:var(--accent)">⏰ 21:00</div>
      </div>
      <div class="section-card">
        <div class="toggle-row"><div><div class="toggle-label">🏆 Achievement Alerts</div></div><div class="toggle-switch on"></div></div>
      </div>
      <div class="section-card">
        <div class="toggle-row"><div><div class="toggle-label">🌙 Quiet Hours</div><div class="toggle-sub">22:00 - 07:00</div></div><div class="toggle-switch on"></div></div>
      </div>
    </div>
  `);

  // G5: Audio Settings
  const audio = phone('G5: Audio Settings', 'BG music, ducking, speed', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">Audio Settings</span><span class="action">✓</span></div>
    <div class="scroll-content">
      <div class="section-card">
        <div class="toggle-row"><div><div class="toggle-label">🎵 Background Music</div><div class="toggle-sub">Lofi Study Chill</div></div><div class="toggle-switch on"></div></div>
        <div style="display:flex;align-items:center;gap:8px;padding:8px 0;font-size:13px;color:var(--text-secondary)">
          <span>🔉</span>
          <div style="flex:1;height:4px;background:var(--bg-tertiary);border-radius:2px"><div style="width:30%;height:100%;background:var(--accent);border-radius:2px"></div></div>
          <span>30%</span>
        </div>
        <div style="display:flex;gap:12px;justify-content:center;padding:4px 0">
          <span style="font-size:18px;color:var(--text-secondary)">⏮️</span>
          <span style="font-size:18px;color:var(--accent)">⏯️</span>
          <span style="font-size:18px;color:var(--text-secondary)">⏭️</span>
          <span style="font-size:14px;color:var(--text-muted)">🔀</span>
        </div>
      </div>
      <div class="section-card">
        <div class="toggle-row"><div><div class="toggle-label">🔉 Smart Ducking</div><div class="toggle-sub">Tự giảm nhạc khi AI nói</div></div><div class="toggle-switch on"></div></div>
        <div class="toggle-row"><div><div class="toggle-label">🔊 Sound Effects</div></div><div class="toggle-switch on"></div></div>
      </div>
      <div class="section-card">
        <div class="section-title">⚡ Default Playback Speed</div>
        <div class="chip-row"><span class="chip">0.5</span><span class="chip">0.8</span><span class="chip active">1.0</span><span class="chip">1.2</span><span class="chip">1.5</span><span class="chip">2.0</span></div>
      </div>
      <div class="section-card">
        <div class="toggle-row"><div><div class="toggle-label">🤖 Auto-play Audio</div></div><div class="toggle-switch on"></div></div>
        <div class="toggle-row"><div><div class="toggle-label">🙌 Hands-free Mode</div><div class="toggle-sub">Không cần chạm màn hình</div></div><div class="toggle-switch"></div></div>
      </div>
    </div>
  `);

  // G8: Logout Dialog
  const logoutDialog = phone('G8: Logout Dialog', 'Confirmation modal', `
    ${statusBar()}
    <div style="flex:1;opacity:0.15"></div>
    <div style="position:absolute;inset:0;background:var(--overlay);display:flex;align-items:center;justify-content:center;padding:32px">
      <div style="background:var(--bg-card);border-radius:var(--r-xl);padding:24px;width:100%;border:1px solid var(--border);box-shadow:var(--shadow-lg)">
        <div style="text-align:center;margin-bottom:16px">
          <div style="font-size:40px;margin-bottom:8px">🚪</div>
          <div style="font-family:var(--font-display);font-size:18px;font-weight:700">Đăng xuất?</div>
        </div>
        <div style="font-size:14px;color:var(--text-secondary);text-align:center;line-height:1.5;margin-bottom:20px">
          Bạn có chắc muốn đăng xuất?<br>
          <span style="color:var(--warning);font-size:13px">Dữ liệu chưa sync sẽ bị mất.</span>
        </div>
        <div style="display:flex;gap:8px">
          <button class="cta-btn secondary" style="flex:1;margin:0;padding:12px;font-size:14px">Hủy</button>
          <button class="cta-btn" style="flex:1;margin:0;padding:12px;font-size:14px;background:var(--error)">Đăng xuất</button>
        </div>
      </div>
    </div>
  `);

  return moduleSection('profile', '👤', 'Profile & Settings', 6,
    profile + appearance + notifications + audio + logoutDialog +
    // G7: About (inline small)
    phone('G7: About', 'Version, links, copyright', `
      ${statusBar()}
      <div class="app-bar"><span class="back">←</span><span class="title">About</span><span class="action"></span></div>
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:32px">
        <div style="font-size:56px">📚</div>
        <div style="font-family:var(--font-display);font-size:22px;font-weight:800">StudyLanguage</div>
        <div style="font-size:13px;color:var(--text-muted)">Version 1.0.0</div>
      </div>
      <div style="padding:0 16px">
        <div class="list-item"><span class="li-title">Terms of Service</span><span class="li-arrow">›</span></div>
        <div class="list-item"><span class="li-title">Privacy Policy</span><span class="li-arrow">›</span></div>
        <div class="list-item"><span class="li-title">Licenses</span><span class="li-arrow">›</span></div>
        <div class="list-item"><span class="li-title">Contact Support</span><span class="li-arrow">›</span></div>
        <div class="list-item"><span class="li-title">Rate the App ⭐</span><span class="li-arrow">›</span></div>
      </div>
      <div style="text-align:center;padding:16px;font-size:12px;color:var(--text-muted)">Made with ❤️ for learning<br>© 2026 StudyLanguage</div>
    `)
  );
}
