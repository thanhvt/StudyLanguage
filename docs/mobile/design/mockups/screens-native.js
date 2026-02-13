// ============================================
// Module: Native Features (4 screens)
// ============================================

function renderNative() {
  // I1: iOS Widget
  const widget = phone('I1: iOS Widgets', 'Small, Medium, Large', `
    <div style="height:100%;background:linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);padding:60px 16px 40px;display:flex;flex-direction:column;gap:16px">
      <div style="padding:16px;backdrop-filter:blur(20px);background:rgba(255,255,255,0.08);border-radius:20px;border:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;gap:12px">
        <div style="font-size:28px">📚</div>
        <div style="flex:1"><div style="font-size:12px;color:rgba(255,255,255,0.5)">StudyLanguage</div><div style="font-size:16px;font-weight:700;color:#fff">🔥 12 day streak</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">25 min today</div></div>
      </div>
      <div style="font-size:10px;color:rgba(255,255,255,0.3);text-align:center;margin:-8px 0">▲ Small Widget (2×2)</div>
      <div style="padding:16px;backdrop-filter:blur(20px);background:rgba(255,255,255,0.08);border-radius:20px;border:1px solid rgba(255,255,255,0.1)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div style="display:flex;align-items:center;gap:8px"><span style="font-size:20px">📚</span><span style="font-size:13px;font-weight:600;color:#fff">StudyLanguage</span></div>
          <span style="font-size:12px;color:rgba(255,255,255,0.5)">🔥 12</span>
        </div>
        <div style="display:flex;gap:8px">
          <div style="flex:1;padding:10px;border-radius:12px;background:rgba(79,107,237,0.2);text-align:center"><div style="font-size:16px">🎧</div><div style="font-size:10px;color:rgba(255,255,255,0.6);margin-top:4px">Continue</div></div>
          <div style="flex:1;padding:10px;border-radius:12px;background:rgba(34,197,94,0.2);text-align:center"><div style="font-size:16px">🗣️</div><div style="font-size:10px;color:rgba(255,255,255,0.6);margin-top:4px">Practice</div></div>
          <div style="flex:1;padding:10px;border-radius:12px;background:rgba(217,119,6,0.2);text-align:center"><div style="font-size:16px">📖</div><div style="font-size:10px;color:rgba(255,255,255,0.6);margin-top:4px">Read</div></div>
        </div>
      </div>
      <div style="font-size:10px;color:rgba(255,255,255,0.3);text-align:center;margin:-8px 0">▲ Medium Widget (4×2)</div>
      <div style="padding:16px;backdrop-filter:blur(20px);background:rgba(255,255,255,0.08);border-radius:20px;border:1px solid rgba(255,255,255,0.1)">
        <div style="display:flex;justify-content:space-between;margin-bottom:12px"><span style="font-size:13px;font-weight:600;color:#fff">📚 Weekly Progress</span><span style="font-size:12px;color:rgba(255,255,255,0.4)">🔥 12</span></div>
        <div style="display:flex;justify-content:space-between;align-items:flex-end;height:50px;margin-bottom:8px">
          ${['M','T','W','T','F','S','S'].map((d,i) => {
            const h = [30,45,20,50,35,10,10][i];
            return `<div style="text-align:center;flex:1"><div style="width:14px;background:${h>15?'rgba(6,182,212,0.7)':'rgba(255,255,255,0.1)'};height:${h}px;border-radius:3px;margin:0 auto 4px"></div><span style="font-size:8px;color:rgba(255,255,255,0.3)">${d}</span></div>`;
          }).join('')}
        </div>
        <div style="display:flex;gap:6px;margin-top:8px">
          <div style="flex:1;text-align:center;padding:6px;border-radius:8px;background:rgba(255,255,255,0.05)"><div style="font-size:14px;font-weight:700;color:#06B6D4">3.5h</div><div style="font-size:9px;color:rgba(255,255,255,0.4)">Total</div></div>
          <div style="flex:1;text-align:center;padding:6px;border-radius:8px;background:rgba(255,255,255,0.05)"><div style="font-size:14px;font-weight:700;color:#22C55E">42</div><div style="font-size:9px;color:rgba(255,255,255,0.4)">Sessions</div></div>
          <div style="flex:1;text-align:center;padding:6px;border-radius:8px;background:rgba(255,255,255,0.05)"><div style="font-size:14px;font-weight:700;color:#F59E0B">156</div><div style="font-size:9px;color:rgba(255,255,255,0.4)">Words</div></div>
        </div>
      </div>
      <div style="font-size:10px;color:rgba(255,255,255,0.3);text-align:center;margin:-8px 0">▲ Large Widget (4×4)</div>
    </div>
  `);

  // I2: Push Notification
  const notification = phone('I2: Push Notification', 'Standard + Rich', `
    <div style="height:100%;background:linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);padding:60px 16px;display:flex;flex-direction:column;gap:12px">
      <div style="font-size:11px;color:rgba(255,255,255,0.3);text-align:center;margin-bottom:4px">LOCK SCREEN NOTIFICATIONS</div>
      <div style="padding:14px 16px;backdrop-filter:blur(20px);background:rgba(255,255,255,0.12);border-radius:16px;border:1px solid rgba(255,255,255,0.1)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <span style="font-size:16px">📚</span><span style="font-size:11px;color:rgba(255,255,255,0.5);font-weight:600">STUDYLANGUAGE</span><span style="font-size:11px;color:rgba(255,255,255,0.3)">Now</span>
        </div>
        <div style="font-size:14px;font-weight:600;color:#fff">🔥 Streak Warning!</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.6);margin-top:2px">2 giờ nữa bạn sẽ mất streak 12 ngày. Học 5 phút nhé!</div>
      </div>
      <div style="padding:14px 16px;backdrop-filter:blur(20px);background:rgba(255,255,255,0.12);border-radius:16px;border:1px solid rgba(255,255,255,0.1)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <span style="font-size:16px">📚</span><span style="font-size:11px;color:rgba(255,255,255,0.5);font-weight:600">STUDYLANGUAGE</span><span style="font-size:11px;color:rgba(255,255,255,0.3)">2m ago</span>
        </div>
        <div style="font-size:14px;font-weight:600;color:#fff">🏆 Huy hiệu mới!</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.6);margin-top:2px">Bạn vừa nhận "Perfect Score" — 100 điểm pronunciation!</div>
      </div>
      <div style="padding:14px 16px;backdrop-filter:blur(20px);background:rgba(255,255,255,0.12);border-radius:16px;border:1px solid rgba(255,255,255,0.1)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <span style="font-size:16px">📚</span><span style="font-size:11px;color:rgba(255,255,255,0.5);font-weight:600">STUDYLANGUAGE</span><span style="font-size:11px;color:rgba(255,255,255,0.3)">7:00 PM</span>
        </div>
        <div style="font-size:14px;font-weight:600;color:#fff">📅 Daily Reminder</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.6);margin-top:2px">Đã đến giờ luyện tập! Cùng học 15 phút nào 🎧</div>
        <div style="display:flex;gap:6px;margin-top:8px">
          <div style="padding:6px 12px;border-radius:10px;background:rgba(6,182,212,0.3);font-size:12px;color:#06B6D4;font-weight:600">🎧 Start</div>
          <div style="padding:6px 12px;border-radius:10px;background:rgba(255,255,255,0.05);font-size:12px;color:rgba(255,255,255,0.4)">Later</div>
        </div>
      </div>
    </div>
  `);

  // I5: Download Manager
  const downloadMgr = phone('I5: Download Manager', 'List, progress, storage', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">Downloads</span><span class="action">⋮</span></div>
    <div class="scroll-content">
      <div class="section-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-size:13px;font-weight:600">💾 Storage Used</span>
          <span style="font-size:12px;color:var(--text-tertiary)">1.2 GB / 5 GB</span>
        </div>
        <div class="progress-bar" style="height:8px;border-radius:4px"><div class="progress-fill" style="width:24%;border-radius:4px"></div></div>
      </div>
      <div class="section-card">
        <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
          <span style="font-size:20px">🎧</span>
          <div style="flex:1"><div style="font-size:13px;font-weight:600">Coffee Shop Talk</div><div style="font-size:11px;color:var(--text-tertiary)">45 MB • Downloaded ✅</div></div>
          <span style="color:var(--error);font-size:14px">🗑</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
          <span style="font-size:20px">🎧</span>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600">Airport Check-in</div>
            <div style="font-size:11px;color:var(--accent)">Downloading... 65%</div>
            <div class="progress-bar" style="height:3px;margin-top:4px"><div class="progress-fill" style="width:65%"></div></div>
          </div>
          <span style="color:var(--text-muted);font-size:14px">⏸</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px;padding:8px 0">
          <span style="font-size:20px">🗣️</span>
          <div style="flex:1"><div style="font-size:13px;font-weight:600">Tongue Twisters Pack</div><div style="font-size:11px;color:var(--text-tertiary)">120 MB • Queued</div></div>
          <span style="color:var(--text-muted);font-size:14px">⬇️</span>
        </div>
      </div>
    </div>
  `);

  // I4: Offline Indicator
  const offline = phone('I4: Offline Mode', 'Banner + limitations', `
    ${statusBar()}
    <div style="background:var(--warning);color:#000;padding:6px 16px;font-size:12px;font-weight:600;text-align:center;display:flex;align-items:center;justify-content:center;gap:6px">⚠️ Offline — Chỉ nội dung đã tải</div>
    <div class="app-bar"><span class="back">←</span><span class="title">Luyện Nghe</span><span class="action">⋮</span></div>
    <div class="scroll-content">
      <div class="section-card">
        <div class="section-title">📥 Available Offline</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:var(--r-md);background:var(--bg-tertiary)">
            <span style="font-size:18px">🎧</span>
            <div style="flex:1"><div style="font-size:13px;font-weight:600">Coffee Shop Talk</div><div style="font-size:11px;color:var(--text-tertiary)">45 MB • ✅ Ready</div></div>
            <span style="color:var(--accent)">▶️</span>
          </div>
        </div>
      </div>
      <div class="section-card" style="opacity:0.5">
        <div class="section-title">🌐 Requires Internet</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:var(--r-md);background:var(--bg-tertiary)">
            <span style="font-size:18px">🎧</span>
            <div style="flex:1"><div style="font-size:13px;font-weight:600">Generate New Lesson</div><div style="font-size:11px;color:var(--error)">❌ Unavailable offline</div></div>
          </div>
        </div>
      </div>
    </div>
    ${tabBar('listen')}
  `);

  return moduleSection('native', '📱', 'Native Features', 4,
    widget + notification + downloadMgr + offline);
}
