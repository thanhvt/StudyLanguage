// ============================================
// Module: Speaking (10 key screens)
// ============================================

function renderSpeaking() {
  // D1: Topic Selection
  const topicSelect = phone('D1: Topic Selection', 'Grid categories', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">Luyện Nói</span><span class="action">⋮</span></div>
    <div class="scroll-content">
      <div style="padding:0 16px 8px"><div class="section-title">📚 Chọn chủ đề</div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 16px">
        <div style="padding:20px 16px;border-radius:var(--r-lg);background:var(--bg-card);border:1px solid var(--border);text-align:center">
          <div style="font-size:32px;margin-bottom:8px">💻</div><div style="font-size:13px;font-weight:600">Technology</div><div style="font-size:11px;color:var(--text-tertiary);margin-top:2px">25 sentences</div>
        </div>
        <div style="padding:20px 16px;border-radius:var(--r-lg);background:var(--accent-soft);border:1px solid var(--accent);text-align:center">
          <div style="font-size:32px;margin-bottom:8px">✈️</div><div style="font-size:13px;font-weight:600;color:var(--accent)">Travel</div><div style="font-size:11px;color:var(--text-tertiary);margin-top:2px">30 sentences</div>
        </div>
        <div style="padding:20px 16px;border-radius:var(--r-lg);background:var(--bg-card);border:1px solid var(--border);text-align:center">
          <div style="font-size:32px;margin-bottom:8px">🍳</div><div style="font-size:13px;font-weight:600">Food</div><div style="font-size:11px;color:var(--text-tertiary);margin-top:2px">20 sentences</div>
        </div>
        <div style="padding:20px 16px;border-radius:var(--r-lg);background:var(--bg-card);border:1px solid var(--border);text-align:center">
          <div style="font-size:32px;margin-bottom:8px">💼</div><div style="font-size:13px;font-weight:600">Business</div><div style="font-size:11px;color:var(--text-tertiary);margin-top:2px">18 sentences</div>
        </div>
        <div style="padding:20px 16px;border-radius:var(--r-lg);background:var(--bg-card);border:1px solid var(--border);text-align:center">
          <div style="font-size:32px;margin-bottom:8px">🏥</div><div style="font-size:13px;font-weight:600">Health</div><div style="font-size:11px;color:var(--text-tertiary);margin-top:2px">15 sentences</div>
        </div>
        <div style="padding:20px 16px;border-radius:var(--r-lg);background:var(--bg-card);border:1px solid var(--border);text-align:center">
          <div style="font-size:32px;margin-bottom:8px">🎬</div><div style="font-size:13px;font-weight:600">Entertainment</div><div style="font-size:11px;color:var(--text-tertiary);margin-top:2px">22 sentences</div>
        </div>
      </div>
    </div>
    ${tabBar('speak')}
  `);

  // D2: Practice - Ready
  const practiceReady = phone('D2: Practice - Ready', 'Sentence + IPA + tips', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">Travel • 3/30</span><span class="action">💡</span></div>
    <div style="flex:1;display:flex;flex-direction:column;padding:16px">
      <div class="progress-bar" style="height:3px;margin-bottom:24px"><div class="progress-fill" style="width:10%"></div></div>
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center">
        <div style="font-size:22px;font-weight:700;text-align:center;line-height:1.5;margin-bottom:16px">"I'd like to book a round-trip ticket to Paris."</div>
        <div style="font-size:14px;color:var(--text-tertiary);text-align:center;margin-bottom:12px">/aɪd laɪk tə bʊk ə raʊnd trɪp ˈtɪkɪt tə ˈpærɪs/</div>
        <div style="display:flex;gap:8px;margin-bottom:24px">
          <span style="padding:4px 10px;border-radius:var(--r-full);background:var(--accent-soft);font-size:11px;color:var(--accent)">🔊 Nghe mẫu</span>
          <span style="padding:4px 10px;border-radius:var(--r-full);background:var(--bg-tertiary);font-size:11px;color:var(--text-secondary)">📝 IPA</span>
        </div>
        <div style="padding:12px 16px;border-radius:var(--r-md);background:var(--accent-soft);border-left:3px solid var(--accent);font-size:13px;color:var(--text-secondary);line-height:1.5;width:100%">
          💡 <strong style="color:var(--accent)">Mẹo:</strong> Chú ý nhấn "round-trip" và nối âm "ticket to"
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:12px;padding:16px 0">
        <div class="record-btn" style="font-size:28px">🎤</div>
        <div style="font-size:13px;color:var(--text-tertiary)">Nhấn giữ để ghi âm</div>
      </div>
    </div>
  `);

  // D3: Practice - Recording
  const practiceRecording = phone('D3: Practice - Recording', 'Waveform + timer', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">Travel • 3/30</span><span class="action"></span></div>
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px">
      <div style="font-size:18px;font-weight:600;text-align:center;margin-bottom:24px;opacity:0.5">"I'd like to book a round-trip ticket to Paris."</div>
      <div class="waveform" style="height:60px;margin-bottom:24px">
        <div class="wave-bar" style="height:25px;background:var(--accent-secondary)"></div>
        <div class="wave-bar" style="height:40px;background:var(--accent-secondary)"></div>
        <div class="wave-bar" style="height:20px;background:var(--accent-secondary)"></div>
        <div class="wave-bar" style="height:50px;background:var(--accent-secondary)"></div>
        <div class="wave-bar" style="height:30px;background:var(--accent-secondary)"></div>
        <div class="wave-bar" style="height:45px;background:var(--accent-secondary)"></div>
        <div class="wave-bar" style="height:25px;background:var(--accent-secondary)"></div>
        <div class="wave-bar" style="height:35px;background:var(--accent-secondary)"></div>
      </div>
      <div style="font-family:var(--font-display);font-size:32px;font-weight:700;color:var(--accent-secondary);margin-bottom:8px">0:03</div>
      <div style="font-size:13px;color:var(--text-tertiary);margin-bottom:32px">Đang ghi âm...</div>
      <div style="font-size:12px;color:var(--text-muted)">↑ Vuốt lên để huỷ</div>
    </div>
    <div style="display:flex;justify-content:center;padding:24px">
      <div class="record-btn recording" style="font-size:24px;background:var(--accent-secondary)">⏹</div>
    </div>
  `);

  // D5: Feedback Screen
  const feedbackScreen = phone('D5: Feedback Screen', 'Score + Word analysis + Heatmap', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">Kết quả</span><span class="action">📤</span></div>
    <div class="scroll-content">
      <!-- Score Circle -->
      <div style="display:flex;justify-content:center;padding:20px">
        <div style="width:120px;height:120px;border-radius:50%;border:6px solid var(--success);display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 0 30px rgba(34,197,94,0.2)">
          <div style="font-family:var(--font-display);font-size:36px;font-weight:800;color:var(--success)">92</div>
          <div style="font-size:11px;color:var(--text-tertiary)">/100</div>
        </div>
      </div>
      <!-- Word Analysis -->
      <div class="section-card">
        <div class="section-title">📊 Phân tích từng từ</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          <span style="padding:4px 8px;border-radius:var(--r-sm);background:rgba(34,197,94,0.15);color:#22C55E;font-size:13px">I'd ✓</span>
          <span style="padding:4px 8px;border-radius:var(--r-sm);background:rgba(34,197,94,0.15);color:#22C55E;font-size:13px">like ✓</span>
          <span style="padding:4px 8px;border-radius:var(--r-sm);background:rgba(34,197,94,0.15);color:#22C55E;font-size:13px">to ✓</span>
          <span style="padding:4px 8px;border-radius:var(--r-sm);background:rgba(245,158,11,0.15);color:#F59E0B;font-size:13px">book ⚠</span>
          <span style="padding:4px 8px;border-radius:var(--r-sm);background:rgba(34,197,94,0.15);color:#22C55E;font-size:13px">a ✓</span>
          <span style="padding:4px 8px;border-radius:var(--r-sm);background:rgba(239,68,68,0.15);color:#EF4444;font-size:13px">round-trip ✗</span>
          <span style="padding:4px 8px;border-radius:var(--r-sm);background:rgba(34,197,94,0.15);color:#22C55E;font-size:13px">ticket ✓</span>
        </div>
      </div>
      <!-- Phoneme Heatmap -->
      <div class="section-card">
        <div class="section-title">🔥 Phoneme Heatmap</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <div style="padding:6px 12px;border-radius:var(--r-sm);background:rgba(34,197,94,0.15);font-size:12px"><span style="color:#22C55E">/θ/</span> 🟢</div>
          <div style="padding:6px 12px;border-radius:var(--r-sm);background:rgba(245,158,11,0.15);font-size:12px"><span style="color:#F59E0B">/ʃ/</span> 🟡</div>
          <div style="padding:6px 12px;border-radius:var(--r-sm);background:rgba(239,68,68,0.15);font-size:12px"><span style="color:#EF4444">/ð/</span> 🔴</div>
          <div style="padding:6px 12px;border-radius:var(--r-sm);background:rgba(34,197,94,0.15);font-size:12px"><span style="color:#22C55E">/r/</span> 🟢</div>
        </div>
      </div>
      <!-- Actions -->
      <div style="display:flex;gap:8px;padding:0 16px">
        <button class="cta-btn secondary" style="flex:1;margin:0;padding:12px;font-size:14px">🔊 AI Clone</button>
        <button class="cta-btn" style="flex:1;margin:0;padding:12px;font-size:14px">🔄 Thử lại</button>
      </div>
    </div>
  `);

  // D7: Conversation Coach
  const coachSession = phone('D7: Coach - Session', 'Chat UI + pronunciation alerts', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">💬 Coach • Daily Routine</span><span class="action">⏱ 8:24</span></div>
    <div class="scroll-content" style="display:flex;flex-direction:column;gap:4px;padding:8px 0">
      <div class="chat-bubble ai">Hello! Let's talk about your daily routine. What time do you usually wake up? 😊</div>
      <div class="chat-bubble user">I usually wake up at 7 o'clock in the morning.</div>
      <div style="padding:2px 16px"><span style="font-size:11px;color:var(--warning);background:rgba(245,158,11,0.1);padding:2px 8px;border-radius:var(--r-full)">⚠️ "usually" → /ˈjuːʒuəli/</span></div>
      <div class="chat-bubble ai">That sounds great! What do you do after waking up? Do you exercise or have breakfast first?</div>
      <div class="chat-bubble user">I usually have breakfast first, then I go to the gym.</div>
      <div class="chat-bubble ai">Nice routine! 💪 What kind of exercises do you do at the gym?</div>
      <div style="padding:4px 16px"><div style="font-size:12px;color:var(--text-tertiary)">💡 Gợi ý trả lời:</div>
        <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap">
          <span style="padding:6px 10px;border-radius:var(--r-full);background:var(--bg-card);border:1px solid var(--border);font-size:12px;color:var(--text-secondary)">I do cardio...</span>
          <span style="padding:6px 10px;border-radius:var(--r-full);background:var(--bg-card);border:1px solid var(--border);font-size:12px;color:var(--text-secondary)">I lift weights...</span>
        </div>
      </div>
    </div>
    <div style="padding:8px 16px 28px;display:flex;gap:8px;align-items:center;background:var(--bg-card);border-top:1px solid var(--border)">
      <div class="record-btn" style="width:48px;height:48px;font-size:20px;border-width:2px">🎤</div>
      <div style="font-size:12px;color:var(--text-tertiary)">Nhấn giữ để trả lời</div>
    </div>
  `);

  // D11: Shadowing Mode
  const shadowingMode = phone('D11: Shadowing Mode', 'AI playback + user comparison', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">🎯 Shadowing</span><span class="action">⚙️</span></div>
    <div style="flex:1;padding:16px;display:flex;flex-direction:column;gap:16px">
      <div style="text-align:center;font-size:18px;font-weight:600;line-height:1.5">"The quick brown fox jumps over the lazy dog."</div>
      <!-- AI Waveform -->
      <div class="section-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-size:12px;font-weight:600;color:var(--accent)">🤖 AI Model</span>
          <span style="font-size:11px;color:var(--text-muted)">2.4s</span>
        </div>
        <div style="height:32px;background:var(--accent-soft);border-radius:var(--r-sm);display:flex;align-items:center;justify-content:center">
          <div style="display:flex;gap:1px;align-items:center;height:24px">
            ${Array(30).fill(0).map((_,i) => `<div style="width:3px;height:${8+Math.random()*16}px;background:var(--accent);border-radius:1px;opacity:${i < 20 ? 1 : 0.3}"></div>`).join('')}
          </div>
        </div>
      </div>
      <!-- User Waveform -->
      <div class="section-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-size:12px;font-weight:600;color:var(--skill-speaking)">🎤 Bạn</span>
          <span style="font-size:11px;color:var(--text-muted)">2.6s</span>
        </div>
        <div style="height:32px;background:var(--skill-speaking-bg);border-radius:var(--r-sm);display:flex;align-items:center;justify-content:center">
          <div style="display:flex;gap:1px;align-items:center;height:24px">
            ${Array(30).fill(0).map((_,i) => `<div style="width:3px;height:${6+Math.random()*14}px;background:var(--skill-speaking);border-radius:1px;opacity:${i < 18 ? 1 : 0.3}"></div>`).join('')}
          </div>
        </div>
      </div>
      <!-- Comparison -->
      <div class="section-card" style="background:var(--gradient-hero)">
        <div style="font-size:13px;font-weight:600;margin-bottom:8px">📊 So sánh</div>
        <div style="display:flex;gap:12px">
          <div style="flex:1;text-align:center"><div style="font-size:18px;font-weight:700;color:var(--success)">88%</div><div style="font-size:11px;color:var(--text-tertiary)">Pitch</div></div>
          <div style="flex:1;text-align:center"><div style="font-size:18px;font-weight:700;color:var(--warning)">75%</div><div style="font-size:11px;color:var(--text-tertiary)">Tempo</div></div>
          <div style="flex:1;text-align:center"><div style="font-size:18px;font-weight:700;color:var(--success)">91%</div><div style="font-size:11px;color:var(--text-tertiary)">Intonation</div></div>
        </div>
      </div>
      <div style="display:flex;gap:8px;padding:0 0 8px">
        <span class="chip" style="flex:1;text-align:center;padding:8px">Delay: 0.5s</span>
        <span class="chip" style="flex:1;text-align:center;padding:8px">Speed: 0.8x</span>
      </div>
    </div>
    <div style="display:flex;gap:8px;padding:8px 16px 28px">
      <button class="cta-btn secondary" style="flex:1;margin:0;padding:12px;font-size:14px">▶️ Nghe lại</button>
      <button class="cta-btn" style="flex:1;margin:0;padding:12px;font-size:14px">🔄 Thử lại</button>
    </div>
  `);

  // D14: Progress Dashboard
  const progressDashboard = phone('D14: Progress Dashboard', 'Radar chart, heatmap, badges', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">📊 Tiến trình</span><span class="action"></span></div>
    <div class="scroll-content">
      <div class="stats-row">
        <div class="stat-card"><div class="stat-value">🔥 12</div><div class="stat-label">Streak</div></div>
        <div class="stat-card"><div class="stat-value">8/10</div><div class="stat-label">Daily Goal</div></div>
        <div class="stat-card"><div class="stat-value">5.2h</div><div class="stat-label">Total</div></div>
      </div>
      <!-- Radar Chart Placeholder -->
      <div class="section-card">
        <div class="section-title">🎯 Kỹ năng</div>
        <div style="height:160px;display:flex;align-items:center;justify-content:center">
          <svg width="150" height="150" viewBox="0 0 150 150">
            <polygon points="75,15 130,50 120,120 30,120 20,50" fill="none" stroke="var(--border)" stroke-width="1"/>
            <polygon points="75,35 110,58 105,105 45,105 40,58" fill="none" stroke="var(--border)" stroke-width="1"/>
            <polygon points="75,30 120,52 112,115 38,115 30,52" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
            <text x="75" y="12" text-anchor="middle" fill="var(--text-secondary)" font-size="9">Pronunciation</text>
            <text x="138" y="52" text-anchor="start" fill="var(--text-secondary)" font-size="9">Fluency</text>
            <text x="126" y="128" text-anchor="start" fill="var(--text-secondary)" font-size="9">Vocab</text>
            <text x="24" y="128" text-anchor="end" fill="var(--text-secondary)" font-size="9">Grammar</text>
            <text x="12" y="52" text-anchor="end" fill="var(--text-secondary)" font-size="9">Listening</text>
          </svg>
        </div>
      </div>
      <!-- Calendar Heatmap -->
      <div class="section-card">
        <div class="section-title">🗓️ Hoạt động</div>
        <div class="heatmap">
          ${Array(28).fill(0).map(() => {
            const levels = ['','l1','l2','l3','l4'];
            return `<div class="heatmap-cell ${levels[Math.floor(Math.random()*5)]}"></div>`;
          }).join('')}
        </div>
      </div>
      <!-- Badges -->
      <div class="section-card">
        <div class="section-title">🏆 Huy hiệu</div>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <div style="text-align:center"><div style="font-size:32px">🌟</div><div style="font-size:10px;color:var(--text-tertiary)">First Word</div></div>
          <div style="text-align:center"><div style="font-size:32px">🔥</div><div style="font-size:10px;color:var(--text-tertiary)">7 Day Streak</div></div>
          <div style="text-align:center"><div style="font-size:32px">💎</div><div style="font-size:10px;color:var(--text-tertiary)">Perfect Score</div></div>
          <div style="text-align:center;opacity:0.3"><div style="font-size:32px">🎯</div><div style="font-size:10px;color:var(--text-tertiary)">100 Words</div></div>
        </div>
      </div>
    </div>
    ${tabBar('speak')}
  `);

  return moduleSection('speaking', '🗣️', 'Speaking', 7,
    topicSelect + practiceReady + practiceRecording + feedbackScreen + coachSession + shadowingMode + progressDashboard);
}
