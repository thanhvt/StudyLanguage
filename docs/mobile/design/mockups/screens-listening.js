// ============================================
// Module: Listening (13 screens)
// ============================================

function renderListening() {
  // C1: Config Screen
  const configScreen = phone('C1: Config Screen', 'Topic, Duration, Speakers', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">Luyện Nghe</span><span class="action">⋮</span></div>
    <div class="scroll-content">
      <div class="section-card">
        <div class="section-title">📝 Chủ đề</div>
        <div class="dropdown"><span>Daily Conversation</span><span class="arrow">▼</span></div>
      </div>
      <div class="section-card">
        <div class="section-title">⏱️ Thời lượng</div>
        <div class="chip-row">
          <span class="chip">5 phút</span><span class="chip active">10 phút</span>
          <span class="chip">15 phút</span><span class="chip">20 phút</span>
          <span class="chip" style="border:1px dashed var(--border-strong)">Tuỳ chọn</span>
        </div>
      </div>
      <div class="section-card">
        <div class="section-title">👥 Số người nói</div>
        <div class="chip-row">
          <span class="chip">1</span><span class="chip active">2</span><span class="chip">3</span>
        </div>
      </div>
      <div class="section-card">
        <div class="section-title">🔑 Từ khoá (tuỳ chọn)</div>
        <input class="input-field" placeholder="VD: coffee, travel, work..." style="background:var(--bg-tertiary);border:1px solid var(--border)">
      </div>
      <div class="list-item" style="border:none;justify-content:space-between;padding:12px 16px">
        <span style="font-size:14px;color:var(--accent);font-weight:600">⚙️ Tuỳ chọn nâng cao</span>
        <span style="color:var(--text-muted)">›</span>
      </div>
    </div>
    <button class="cta-btn">🎧 Tạo bài nghe</button>
    ${tabBar('listen')}
  `);

  // C2: Advanced Options Bottom Sheet
  const advancedSheet = phone('C2: Advanced Options', 'Bottom Sheet - TTS & difficulty', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">Luyện Nghe</span><span class="action">⋮</span></div>
    <div style="flex:1;opacity:0.3;padding:16px">
      <div class="section-card" style="opacity:0.5"><div style="height:40px"></div></div>
      <div class="section-card" style="opacity:0.5"><div style="height:40px"></div></div>
    </div>
    <div class="bottom-sheet-overlay">
      <div class="bottom-sheet" style="max-height:70%">
        <div class="handle"></div>
        <div style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:16px">⚙️ Tuỳ chọn nâng cao</div>
        <div class="toggle-row"><div><div class="toggle-label">📊 Độ khó</div></div><div class="chip-row"><span class="chip" style="padding:4px 10px;font-size:11px">Easy</span><span class="chip active" style="padding:4px 10px;font-size:11px">Medium</span><span class="chip" style="padding:4px 10px;font-size:11px">Hard</span></div></div>
        <div class="toggle-row"><div><div class="toggle-label">🗣️ Multi-talker</div><div class="toggle-sub">Nhiều người nói cùng lúc</div></div><div class="toggle-switch on"></div></div>
        <div class="toggle-row"><div><div class="toggle-label">🎭 Cảm xúc giọng nói</div><div class="toggle-sub">AI diễn đạt tự nhiên hơn</div></div><div class="toggle-switch on"></div></div>
        <div class="toggle-row"><div><div class="toggle-label">🔄 Random hoá giọng</div><div class="toggle-sub">Mỗi lần tạo giọng khác nhau</div></div><div class="toggle-switch"></div></div>
        <div style="margin-top:12px"><button class="cta-btn" style="width:100%;margin:0">Áp dụng</button></div>
      </div>
    </div>
  `);

  // C3: Player Screen (Podcast Mode)
  const playerScreen = phone('C3: Player - Podcast', 'Playing + Transcript', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">Coffee Shop Talk</span><span class="action">🔖</span></div>
    <div class="scroll-content">
      <!-- Waveform -->
      <div style="display:flex;justify-content:center;padding:16px 0">
        <div class="waveform">
          <div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div>
          <div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div>
        </div>
      </div>
      <!-- Progress -->
      <div style="padding:0 16px">
        <div class="progress-bar" style="height:4px"><div class="progress-fill" style="width:35%"></div></div>
        <div style="display:flex;justify-content:space-between;margin-top:4px;font-size:11px;color:var(--text-muted)">
          <span>3:24</span><span>10:00</span>
        </div>
      </div>
      <!-- Controls -->
      <div class="playback-controls">
        <div class="control-btn">⏪</div>
        <div class="control-btn">-15</div>
        <div class="play-btn">⏸</div>
        <div class="control-btn">+15</div>
        <div class="control-btn">⏩</div>
      </div>
      <div style="display:flex;justify-content:center;gap:24px;padding:0 0 16px">
        <span style="font-size:12px;color:var(--accent);font-weight:600">1.0x</span>
        <span style="font-size:12px;color:var(--text-tertiary)">🔁 Repeat</span>
        <span style="font-size:12px;color:var(--text-tertiary)">🔖 Bookmark</span>
      </div>
      <!-- Transcript -->
      <div class="section-card">
        <div class="section-title">📖 Transcript</div>
        <div style="font-size:14px;line-height:1.8;color:var(--text-secondary)">
          <div style="padding:6px 0;border-left:2px solid var(--accent);padding-left:10px;color:var(--text-primary);font-weight:500;background:var(--accent-soft);border-radius:0 var(--r-sm) var(--r-sm) 0;margin:4px 0">
            <span style="font-size:11px;color:var(--accent)">A:</span> Hi, can I get a large latte with oat milk?
          </div>
          <div style="padding:6px 0;padding-left:12px">
            <span style="font-size:11px;color:var(--text-tertiary)">B:</span> Sure! Would you like any flavor added to that?
          </div>
          <div style="padding:6px 0;padding-left:12px;color:var(--text-tertiary)">
            <span style="font-size:11px">A:</span> Could I add a shot of vanilla, please?
          </div>
        </div>
      </div>
    </div>
    ${tabBar('listen')}
  `);

  // C5: Speed Control Popup
  const speedPopup = phone('C5: Speed Control', 'Popup with slider + presets', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">Coffee Shop Talk</span><span class="action">🔖</span></div>
    <div style="flex:1;opacity:0.2"></div>
    <div class="bottom-sheet-overlay">
      <div class="bottom-sheet" style="max-height:40%">
        <div class="handle"></div>
        <div style="font-family:var(--font-display);font-size:16px;font-weight:700;margin-bottom:16px;text-align:center">⚡ Tốc độ phát</div>
        <div class="chip-row" style="justify-content:center;margin-bottom:16px">
          <span class="chip" style="padding:6px 12px;font-size:12px">0.5x</span>
          <span class="chip" style="padding:6px 12px;font-size:12px">0.75x</span>
          <span class="chip active" style="padding:6px 14px;font-size:14px;font-weight:700">1.0x</span>
          <span class="chip" style="padding:6px 12px;font-size:12px">1.25x</span>
          <span class="chip" style="padding:6px 12px;font-size:12px">1.5x</span>
          <span class="chip" style="padding:6px 12px;font-size:12px">2.0x</span>
        </div>
        <div style="padding:0 8px">
          <div style="height:4px;background:var(--bg-tertiary);border-radius:2px;position:relative">
            <div style="width:50%;height:100%;background:var(--accent);border-radius:2px"></div>
            <div style="position:absolute;top:-6px;left:50%;width:16px;height:16px;border-radius:50%;background:var(--accent);transform:translateX(-50%);box-shadow:var(--shadow)"></div>
          </div>
        </div>
      </div>
    </div>
  `);

  // C7: Custom Scenarios Panel
  const customScenarios = phone('C7: Custom Scenarios', 'List + Create actions', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">Custom Scenarios</span><span class="action">＋</span></div>
    <div class="scroll-content">
      <div class="section-card">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
          <div style="padding:6px 12px;border-radius:var(--r-full);background:var(--accent-soft);color:var(--accent);font-size:12px;font-weight:600">⭐ Favourites</div>
          <div style="padding:6px 12px;border-radius:var(--r-full);background:var(--bg-tertiary);color:var(--text-secondary);font-size:12px">All</div>
        </div>
        <!-- Scenario Items -->
        <div style="display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;align-items:center;gap:10px;padding:12px;border-radius:var(--r-md);background:var(--bg-tertiary);border:1px solid var(--border)">
            <span style="font-size:24px">☕</span>
            <div style="flex:1"><div style="font-size:14px;font-weight:600">Coffee Shop Order</div><div style="font-size:11px;color:var(--text-tertiary)">2 speakers • 5 min • Easy</div></div>
            <span style="color:var(--accent)">▶️</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;padding:12px;border-radius:var(--r-md);background:var(--bg-tertiary);border:1px solid var(--border)">
            <span style="font-size:24px">✈️</span>
            <div style="flex:1"><div style="font-size:14px;font-weight:600">Airport Check-in</div><div style="font-size:11px;color:var(--text-tertiary)">2 speakers • 10 min • Medium</div></div>
            <span style="color:var(--accent)">▶️</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;padding:12px;border-radius:var(--r-md);background:var(--bg-tertiary);border:1px solid var(--border)">
            <span style="font-size:24px">🏥</span>
            <div style="flex:1"><div style="font-size:14px;font-weight:600">Doctor Visit</div><div style="font-size:11px;color:var(--text-tertiary)">2 speakers • 8 min • Hard</div></div>
            <span style="color:var(--accent)">▶️</span>
          </div>
        </div>
      </div>
    </div>
    <button class="cta-btn">＋ Tạo scenario mới</button>
    ${tabBar('listen')}
  `);

  // C8: TTS Voice Settings
  const ttsSettings = phone('C8: TTS Voice Settings', 'Provider, Voice, Emotion', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">Cài đặt giọng nói</span><span class="action">✓</span></div>
    <div class="scroll-content">
      <div class="section-card">
        <div class="section-title">🔊 Nhà cung cấp</div>
        <div class="chip-row">
          <span class="chip active">OpenAI</span><span class="chip">Azure</span>
        </div>
      </div>
      <div class="section-card">
        <div class="section-title">🗣️ Giọng nói (Speaker 1)</div>
        <div style="display:flex;flex-direction:column;gap:6px">
          <div style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:var(--r-md);background:var(--accent-soft);border:1px solid var(--accent)">
            <span style="font-size:20px">👨</span>
            <div style="flex:1"><div style="font-size:13px;font-weight:600;color:var(--accent)">Alloy</div><div style="font-size:11px;color:var(--text-tertiary)">Neutral, versatile</div></div>
            <span style="color:var(--accent)">🔊</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:var(--r-md);background:var(--bg-tertiary)">
            <span style="font-size:20px">👩</span>
            <div style="flex:1"><div style="font-size:13px;font-weight:600">Nova</div><div style="font-size:11px;color:var(--text-tertiary)">Warm, friendly</div></div>
            <span style="color:var(--text-muted)">🔊</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:var(--r-md);background:var(--bg-tertiary)">
            <span style="font-size:20px">👨</span>
            <div style="flex:1"><div style="font-size:13px;font-weight:600">Echo</div><div style="font-size:11px;color:var(--text-tertiary)">Deep, authoritative</div></div>
            <span style="color:var(--text-muted)">🔊</span>
          </div>
        </div>
      </div>
      <div class="section-card">
        <div class="section-title">🎭 Cảm xúc</div>
        <div class="chip-row">
          <span class="chip active">Neutral</span><span class="chip">Cheerful</span>
          <span class="chip">Serious</span><span class="chip">Excited</span>
        </div>
      </div>
      <div class="section-card">
        <div class="section-title">🎚️ Tuỳ chỉnh</div>
        <div class="toggle-row"><div class="toggle-label">Pitch</div><div style="display:flex;align-items:center;gap:8px"><span style="font-size:12px;color:var(--text-muted)">Low</span><div style="width:100px;height:4px;background:var(--bg-tertiary);border-radius:2px;position:relative"><div style="width:50%;height:100%;background:var(--accent);border-radius:2px"></div></div><span style="font-size:12px;color:var(--text-muted)">High</span></div></div>
        <div class="toggle-row"><div class="toggle-label">Rate</div><div style="display:flex;align-items:center;gap:8px"><span style="font-size:12px;color:var(--text-muted)">Slow</span><div style="width:100px;height:4px;background:var(--bg-tertiary);border-radius:2px;position:relative"><div style="width:60%;height:100%;background:var(--accent);border-radius:2px"></div></div><span style="font-size:12px;color:var(--text-muted)">Fast</span></div></div>
      </div>
    </div>
  `);

  // C10: Global Player - Compact
  const compactPlayer = phone('C10: Compact Player', 'Mini bar at bottom', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">Luyện Nghe</span><span class="action">⋮</span></div>
    <div class="scroll-content">
      <div class="section-card"><div style="height:60px"></div></div>
      <div class="section-card"><div style="height:60px"></div></div>
      <div class="section-card"><div style="height:60px"></div></div>
    </div>
    <!-- Compact Player Bar -->
    <div class="mini-player">
      <div style="width:36px;height:36px;border-radius:var(--r-sm);background:var(--accent-soft);display:flex;align-items:center;justify-content:center;font-size:18px">🎧</div>
      <div style="flex:1"><div style="font-size:13px;font-weight:600">Coffee Shop Talk</div><div style="font-size:11px;color:var(--text-tertiary)">3:24 / 10:00</div></div>
      <div style="display:flex;gap:12px;align-items:center">
        <span style="font-size:20px;color:var(--accent)">⏸</span>
        <span style="font-size:16px;color:var(--text-secondary)">⏭</span>
      </div>
    </div>
    ${tabBar('listen')}
  `);

  // C12: Pocket Mode
  const pocketMode = phone('C12: Pocket Mode', 'Black screen + gesture zones', `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;background:#000;color:#fff;padding:40px">
      <div style="font-size:48px;margin-bottom:24px;opacity:0.5">📱</div>
      <div style="font-size:20px;font-weight:700;opacity:0.7;margin-bottom:8px">POCKET MODE</div>
      <div style="font-size:14px;opacity:0.4;text-align:center;margin-bottom:32px">Coffee Shop Talk</div>
      <div style="display:flex;flex-direction:column;gap:16px;width:100%;opacity:0.3">
        <div style="text-align:center;padding:16px;border:1px dashed rgba(255,255,255,0.2);border-radius:var(--r-md)">← Swipe Left: Previous</div>
        <div style="text-align:center;padding:16px;border:1px dashed rgba(255,255,255,0.2);border-radius:var(--r-md)">Swipe Right: Next →</div>
        <div style="text-align:center;padding:16px;border:1px dashed rgba(255,255,255,0.2);border-radius:var(--r-md)">↑ Swipe Up: Bookmark</div>
        <div style="text-align:center;padding:16px;border:1px dashed rgba(255,255,255,0.2);border-radius:var(--r-md)">Double Tap: Play/Pause</div>
      </div>
    </div>
  `);

  return moduleSection('listening', '🎧', 'Listening', 7,
    configScreen + advancedSheet + playerScreen + speedPopup + customScenarios + ttsSettings + compactPlayer + pocketMode);
}
