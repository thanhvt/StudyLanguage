// ============================================
// Module: Reading (5 screens)
// ============================================

function renderReading() {
  // E1: Config Screen
  const configScreen = phone('E1: Config Screen', 'Topic, Level, Length', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">Luyện Đọc</span><span class="action">⋮</span></div>
    <div class="scroll-content">
      <div class="section-card">
        <div class="section-title">📝 Chủ đề</div>
        <div class="dropdown"><span>Climate Change</span><span class="arrow">▼</span></div>
      </div>
      <div class="section-card">
        <div class="section-title">📊 Trình độ</div>
        <div class="chip-row"><span class="chip">Beginner</span><span class="chip active">Intermediate</span><span class="chip">Advanced</span></div>
      </div>
      <div class="section-card">
        <div class="section-title">📏 Độ dài</div>
        <div class="chip-row"><span class="chip">Short ~200w</span><span class="chip active">Medium ~400w</span><span class="chip">Long ~600w</span></div>
      </div>
      <div class="section-card">
        <div class="section-title">⚙️ Tuỳ chọn</div>
        <div class="toggle-row"><div class="toggle-label">🔊 Tự động đọc (TTS)</div><div class="toggle-switch on"></div></div>
        <div class="toggle-row"><div class="toggle-label">✨ Highlight từ mới</div><div class="toggle-switch on"></div></div>
      </div>
    </div>
    <button class="cta-btn">📖 Tạo bài đọc</button>
    ${tabBar('read')}
  `);

  // E2: Article View
  const articleView = phone('E2: Article View', 'Reading + highlighted words', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">Climate Change</span><span class="action">🔊</span></div>
    <div style="padding:8px 16px;display:flex;gap:12px;font-size:11px;color:var(--text-tertiary)">
      <span>📖 ~5 min</span><span>📊 Intermediate</span><span>📝 384 words</span>
    </div>
    <div class="scroll-content" style="padding:8px 16px;font-size:16px;line-height:1.8;color:var(--text-primary)">
      <p style="margin-bottom:16px">Climate change is one of the most <span style="background:var(--accent-soft);padding:2px 4px;border-radius:4px;color:var(--accent);cursor:pointer;border-bottom:2px solid var(--accent)">pressing</span> issues facing our planet today. Scientists around the world warn that global temperatures are rising at an <span style="background:var(--accent-soft);padding:2px 4px;border-radius:4px;color:var(--accent);cursor:pointer;border-bottom:2px solid var(--accent)">unprecedented</span> rate.</p>
      <p style="margin-bottom:16px">The effects of climate change are already visible. Extreme weather events, rising sea levels, and melting glaciers are just a few examples of how our world is changing.</p>
      <p style="margin-bottom:16px">Many countries have started taking action to combat this crisis. <span style="background:var(--accent-soft);padding:2px 4px;border-radius:4px;color:var(--accent);cursor:pointer;border-bottom:2px solid var(--accent)">Renewable</span> energy sources like solar and wind power are becoming more popular and affordable.</p>
    </div>
    <div style="display:flex;justify-content:space-around;padding:8px 16px 28px;border-top:1px solid var(--border);background:var(--bg-card)">
      <span style="font-size:13px;color:var(--text-secondary)">Aa</span>
      <span style="font-size:13px;color:var(--accent);font-weight:600">🔲 Focus</span>
      <span style="font-size:13px;color:var(--text-secondary)">💾 Save</span>
      <span style="font-size:13px;color:var(--text-secondary)">📚 Vocab</span>
    </div>
  `);

  // E3: Focus Mode
  const focusMode = phone('E3: Focus Mode', 'Full-screen, no chrome', `
    <div style="height:100%;display:flex;align-items:center;padding:32px 24px;background:var(--bg-primary);font-size:18px;line-height:2;color:var(--text-primary)">
      <div>Climate change is one of the most pressing issues facing our planet today. Scientists around the world warn that global temperatures are rising at an unprecedented rate. The effects of climate change are already visible.</div>
    </div>
    <div style="position:absolute;bottom:40px;left:50%;transform:translateX(-50%);font-size:12px;color:var(--text-muted);opacity:0.5">Tap to exit Focus Mode</div>
  `);

  // E5: Dictionary Popup
  const dictPopup = phone('E5: Dictionary Popup', 'Word + IPA + Definition + Save', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">Climate Change</span><span class="action">🔊</span></div>
    <div style="flex:1;opacity:0.15;padding:16px;font-size:16px;line-height:1.8">Climate change is one of the most pressing issues...</div>
    <div class="bottom-sheet-overlay">
      <div class="bottom-sheet">
        <div class="handle"></div>
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
          <div>
            <div style="font-family:var(--font-display);font-size:24px;font-weight:800">pressing</div>
            <div style="font-size:14px;color:var(--text-tertiary);margin-top:4px">/ˈpres.ɪŋ/ &nbsp;🔊</div>
          </div>
          <span style="font-size:18px;color:var(--text-muted);cursor:pointer">✕</span>
        </div>
        <div style="font-size:13px;color:var(--accent);font-weight:600;margin-bottom:8px">adjective</div>
        <div style="font-size:15px;margin-bottom:4px">1. Khẩn cấp, cấp bách</div>
        <div style="font-size:15px;margin-bottom:12px">2. Đòi hỏi sự chú ý ngay</div>
        <div style="padding:12px;border-radius:var(--r-md);background:var(--bg-tertiary);margin-bottom:16px">
          <div style="font-size:12px;color:var(--text-tertiary);margin-bottom:4px">📝 Example:</div>
          <div style="font-size:14px;font-style:italic">"This is a pressing matter that needs immediate attention."</div>
        </div>
        <button class="cta-btn" style="width:100%;margin:0">💾 Lưu vào từ vựng</button>
      </div>
    </div>
  `);

  // E4: Reading Practice
  const readingPractice = phone('E4: Reading Practice', 'Record + AI feedback', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">Practice Reading</span><span class="action">💾</span></div>
    <div style="flex:1;display:flex;flex-direction:column">
      <div style="padding:12px 16px;background:var(--bg-card);border-bottom:1px solid var(--border);font-size:14px;line-height:1.6;color:var(--text-secondary)">Climate change is one of the most pressing issues facing our planet today...</div>
      <div style="flex:1;padding:16px;display:flex;flex-direction:column;gap:12px">
        <div style="font-size:13px;font-weight:600">🗣️ Your Turn:</div>
        <div style="font-size:15px;color:var(--text-primary);line-height:1.5">"Climate change is one of the most pressing issues..."</div>
        <div class="section-card" style="margin:0">
          <div style="font-size:13px;font-weight:600;margin-bottom:6px">📊 Feedback:</div>
          <div style="display:flex;gap:16px">
            <div><span style="font-size:20px;font-weight:700;color:var(--success)">92%</span><div style="font-size:11px;color:var(--text-tertiary)">Accuracy</div></div>
            <div><span style="font-size:20px;font-weight:700">15/16</span><div style="font-size:11px;color:var(--text-tertiary)">Words</div></div>
          </div>
        </div>
        <div style="padding:8px 12px;border-radius:var(--r-md);background:rgba(245,158,11,0.1);border-left:3px solid var(--warning)">
          <div style="font-size:12px;color:var(--warning);font-weight:600">⚠️ Improve:</div>
          <div style="font-size:13px;margin-top:2px">"pressing" → /ˈpres.ɪŋ/</div>
        </div>
      </div>
      <div style="padding:8px 16px 28px;display:flex;flex-direction:column;gap:8px;border-top:1px solid var(--border)">
        <div style="display:flex;gap:8px">
          <button class="cta-btn secondary" style="flex:1;margin:0;padding:12px;font-size:13px">▶️ Nghe lại</button>
          <button class="cta-btn" style="flex:1;margin:0;padding:12px;font-size:13px">🔄 Thử lại</button>
        </div>
      </div>
    </div>
  `);

  return moduleSection('reading', '📖', 'Reading', 5,
    configScreen + articleView + focusMode + dictPopup + readingPractice);
}
