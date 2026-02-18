// ============================================
// Module: History (8 key screens)
// ============================================

function renderHistory() {
  // F1: Timeline + Analytics
  const timeline = phone('F1: Timeline + Analytics', 'Stats, heatmap, AI insight', `
    ${statusBar()}
    <div style="padding:14px 16px 8px;font-family:var(--font-display);font-size:22px;font-weight:800">📜 Lịch sử học tập</div>
    <div style="padding:0 16px 8px">
      <div class="chip-row"><span class="chip active">All</span><span class="chip">🎧</span><span class="chip">🗣️</span><span class="chip">📖</span></div>
    </div>
    <div class="scroll-content">
      <div class="stats-row">
        <div class="stat-card"><div class="stat-value">🔥 12</div><div class="stat-label">Streak</div></div>
        <div class="stat-card"><div class="stat-value">3.5h</div><div class="stat-label">Total</div></div>
        <div class="stat-card"><div class="stat-value">42</div><div class="stat-label">Lessons</div></div>
      </div>
      <div class="section-card">
        <div class="section-title">📈 Tuần này</div>
        <div style="display:flex;justify-content:space-between;align-items:flex-end;height:60px">
          ${['T2','T3','T4','T5','T6','T7','CN'].map((d,i) => {
            const h = [35,50,25,60,45,10,10][i];
            return `<div style="display:flex;flex-direction:column;align-items:center;gap:3px;flex:1"><div style="width:20px;background:${h>15?'var(--accent)':'var(--bg-tertiary)'};border-radius:3px;height:${h}px"></div><span style="font-size:9px;color:var(--text-muted)">${d}</span></div>`;
          }).join('')}
        </div>
      </div>
      <!-- AI Insight -->
      <div class="section-card" style="background:var(--gradient-hero)">
        <div style="font-size:13px;font-weight:600;margin-bottom:4px">💡 AI Insight</div>
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.5">Bạn học tốt nhất vào buổi sáng (06:00 - 08:00). Hãy duy trì thói quen này!</div>
        <div style="margin-top:8px;font-size:12px;color:var(--accent)">📊 Xem chi tiết →</div>
      </div>
      <!-- Session Cards -->
      <div class="divider">Hôm nay</div>
      <div class="section-card skill-accent listening" style="display:flex;align-items:center;gap:10px">
        <div style="flex:1"><div style="font-size:14px;font-weight:600">🎧 Coffee Shop Talk</div><div style="font-size:11px;color:var(--text-tertiary)">09:30 • 15 min</div></div>
        <span class="score-badge high">80%</span>
      </div>
      <div class="section-card skill-accent speaking" style="display:flex;align-items:center;gap:10px">
        <div style="flex:1"><div style="font-size:14px;font-weight:600">🗣️ Tech Pronunciation</div><div style="font-size:11px;color:var(--text-tertiary)">10:15 • 8 min</div></div>
        <span class="score-badge high">85</span>
      </div>
      <div class="section-card skill-accent reading" style="display:flex;align-items:center;gap:10px">
        <div style="flex:1"><div style="font-size:14px;font-weight:600">📖 Climate Change</div><div style="font-size:11px;color:var(--text-tertiary)">14:30 • 5 min</div></div>
        <span class="score-badge medium">4/5</span>
      </div>
    </div>
    ${tabBar('history')}
  `);

  // F4: Session Detail - Listening
  const detailListening = phone('F4: Detail - Listening', 'Performance + Transcript', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">Coffee Shop Talk</span><span class="action">⋮</span></div>
    <div class="scroll-content">
      <div style="padding:8px 16px;display:flex;gap:8px;font-size:12px;color:var(--text-tertiary)">
        <span>🎧 Listening</span><span>📅 26/01/2026</span><span>⏱️ 15 min</span>
      </div>
      <div class="section-card">
        <div class="section-title">📊 Performance</div>
        <div style="margin-bottom:8px;font-size:14px;font-weight:600">Comprehension: 80%</div>
        <div class="progress-bar" style="height:8px;border-radius:4px"><div class="progress-fill" style="width:80%;border-radius:4px;background:var(--success)"></div></div>
        <div style="display:flex;gap:16px;margin-top:12px;font-size:13px;color:var(--text-secondary)">
          <span>📝 Bookmarks: 3</span><span>📚 New words: 5</span>
        </div>
      </div>
      <div class="section-card">
        <div class="section-title">⚙️ Settings Used</div>
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.8">• Mode: Podcast<br>• Speakers: 2<br>• Topic: Daily Conversation<br>• Speed: 1.0x</div>
      </div>
      <div class="section-card">
        <div class="section-title">📖 Transcript</div>
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.6">A: Hi, can I order a large latte?<br>B: Sure! What size would you...<br><span style="color:var(--accent)">View full transcript →</span></div>
      </div>
      <div style="display:flex;gap:8px;padding:0 16px">
        <button class="cta-btn secondary" style="flex:1;margin:0;padding:12px;font-size:14px">▶️ Replay</button>
        <button class="cta-btn" style="flex:1;margin:0;padding:12px;font-size:14px">🔄 Practice</button>
      </div>
    </div>
  `);

  // F10: Empty State
  const emptyState = phone('F10: Empty State', 'No history yet', `
    ${statusBar()}
    <div style="padding:14px 16px 8px;font-family:var(--font-display);font-size:22px;font-weight:800">📜 Lịch sử học tập</div>
    <div style="padding:0 16px 8px"><div class="chip-row"><span class="chip active">All</span><span class="chip">🎧</span><span class="chip">🗣️</span><span class="chip">📖</span></div></div>
    <div class="empty-state" style="flex:1">
      <div class="empty-icon">📚✨</div>
      <div class="empty-title">Chưa có lịch sử học tập</div>
      <div class="empty-desc">Bắt đầu bài học đầu tiên<br>để theo dõi tiến trình!</div>
      <div style="display:flex;flex-direction:column;gap:8px;width:100%;max-width:200px;margin-top:8px">
        <button class="cta-btn" style="margin:0;padding:12px;font-size:13px">🎧 Bắt đầu nghe</button>
        <button class="cta-btn secondary" style="margin:0;padding:12px;font-size:13px">🗣️ Bắt đầu nói</button>
      </div>
    </div>
    ${tabBar('history')}
  `);

  // F11: Skeleton Loading
  const skeleton = phone('F11: Skeleton Loading', 'Shimmer animation', `
    ${statusBar()}
    <div style="padding:14px 16px 8px;font-family:var(--font-display);font-size:22px;font-weight:800">📜 Lịch sử học tập</div>
    <div style="padding:0 16px 8px"><div class="chip-row"><span class="chip active">All</span><span class="chip">🎧</span><span class="chip">🗣️</span><span class="chip">📖</span></div></div>
    <div style="padding:0 16px">
      <div style="display:flex;gap:8px;margin-bottom:16px">
        <div class="skeleton" style="flex:1;height:60px"></div>
        <div class="skeleton" style="flex:1;height:60px"></div>
        <div class="skeleton" style="flex:1;height:60px"></div>
      </div>
      <div class="skeleton" style="height:14px;width:80px;margin-bottom:12px"></div>
      <div class="skeleton" style="height:72px;margin-bottom:8px;border-radius:var(--r-lg)"></div>
      <div class="skeleton" style="height:72px;margin-bottom:8px;border-radius:var(--r-lg)"></div>
      <div class="skeleton" style="height:72px;margin-bottom:8px;border-radius:var(--r-lg)"></div>
    </div>
    ${tabBar('history')}
  `);

  // F14: Search
  const search = phone('F14: Search History', 'Results with highlight', `
    ${statusBar()}
    <div style="padding:8px 16px">
      <div style="display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:var(--r-lg);background:var(--bg-card);border:1px solid var(--border-strong)">
        <span style="color:var(--text-muted)">🔍</span>
        <span style="flex:1;font-size:15px;color:var(--text-primary)">coffee shop</span>
        <span style="color:var(--text-muted);font-size:14px">✕</span>
      </div>
    </div>
    <div style="padding:4px 16px;font-size:12px;color:var(--text-tertiary)">Results (3 sessions)</div>
    <div class="scroll-content">
      <div class="section-card skill-accent listening" style="display:flex;align-items:center;gap:10px">
        <div style="flex:1"><div style="font-size:14px;font-weight:600">🎧 <strong style="background:var(--accent-soft);padding:0 2px">Coffee</strong> Shop Talk</div><div style="font-size:11px;color:var(--text-tertiary)">26/01/2026 • 15 min</div></div>
      </div>
      <div class="section-card skill-accent listening" style="display:flex;align-items:center;gap:10px">
        <div style="flex:1"><div style="font-size:14px;font-weight:600">🎧 <strong style="background:var(--accent-soft);padding:0 2px">Coffee</strong> Order</div><div style="font-size:11px;color:var(--text-tertiary)">20/01/2026 • 10 min</div></div>
      </div>
      <div class="section-card skill-accent reading" style="display:flex;align-items:center;gap:10px">
        <div style="flex:1"><div style="font-size:14px;font-weight:600">📖 <strong style="background:var(--accent-soft);padding:0 2px">Coffee</strong> Shop Journal</div><div style="font-size:11px;color:var(--text-tertiary)">15/01/2026 • 8 min</div></div>
      </div>
    </div>
  `);

  // F15: Export/Share
  const exportShare = phone('F15: Export/Share', 'Preview card + actions', `
    ${statusBar()}
    <div style="flex:1;opacity:0.2"></div>
    <div class="bottom-sheet-overlay">
      <div class="bottom-sheet">
        <div class="handle"></div>
        <div style="font-size:16px;font-weight:700;margin-bottom:16px;text-align:center">Chia sẻ kết quả</div>
        <div style="padding:16px;border-radius:var(--r-lg);background:var(--gradient-hero);border:1px solid var(--border);margin-bottom:16px;text-align:center">
          <div style="font-size:14px;font-weight:700;margin-bottom:4px">📚 StudyLanguage</div>
          <div style="font-size:18px;font-weight:700;margin:12px 0">🎧 Coffee Shop Talk</div>
          <div style="font-size:14px;color:var(--text-secondary)">Score: 80%</div>
          <div style="font-size:14px;color:var(--accent);margin-top:4px">🔥 12 day streak</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:8px">26/01/2026</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <button class="cta-btn" style="margin:0;padding:14px">📱 Share Image</button>
          <button class="cta-btn secondary" style="margin:0;padding:14px">📄 Export PDF</button>
          <button class="cta-btn secondary" style="margin:0;padding:14px">📋 Copy Link</button>
        </div>
      </div>
    </div>
  `);

  return moduleSection('history', '📜', 'History', 6,
    timeline + detailListening + emptyState + skeleton + search + exportShare);
}
