// ============================================
// Module: Dashboard (1 screen - Auth only, no Guest)
// ============================================

function renderDashboard() {
  // B1: Auth Dashboard
  const authDashboard = phone('B1: Dashboard (Auth)', 'Morning greeting + Active streak', `
    ${statusBar()}
    <div class="scroll-content">
      <!-- Greeting -->
      <div style="padding:8px 16px 4px">
        <div style="font-family:var(--font-display);font-size:26px;font-weight:800">Chào buổi sáng, Thành! 👋</div>
        <div style="font-size:14px;color:var(--text-secondary);margin-top:4px">
          Chuỗi <span style="color:var(--accent);font-weight:700">12 ngày</span> liên tiếp 🔥
        </div>
      </div>

      <!-- Stats Row -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-value">🔥 12</div>
          <div class="stat-label">Streak</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">3.5h</div>
          <div class="stat-label">Tổng giờ</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">156</div>
          <div class="stat-label">Từ mới</div>
        </div>
      </div>

      <!-- Study Goal -->
      <div class="section-card" style="margin-top:4px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-size:14px;font-weight:600">⏱️ Mục tiêu hôm nay</span>
          <span style="font-size:13px;color:var(--accent);font-weight:600">25/30 phút</span>
        </div>
        <div class="progress-bar" style="height:8px;border-radius:4px">
          <div class="progress-fill" style="width:83%;border-radius:4px"></div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div style="padding:4px 16px 8px">
        <div class="section-title">⚡ Luyện tập nhanh</div>
      </div>
      <div style="display:flex;gap:10px;padding:0 16px;margin-bottom:16px">
        <!-- Listening Card -->
        <div style="flex:1;padding:16px;border-radius:var(--r-lg);background:var(--skill-listening-bg);border:1px solid rgba(79,107,237,0.2)">
          <div style="font-size:28px;margin-bottom:8px">🎧</div>
          <div style="font-size:14px;font-weight:700;color:var(--skill-listening)">Nghe</div>
          <div style="font-size:11px;color:var(--text-tertiary);margin-top:4px">15 phút</div>
        </div>
        <!-- Speaking Card -->
        <div style="flex:1;padding:16px;border-radius:var(--r-lg);background:var(--skill-speaking-bg);border:1px solid rgba(34,197,94,0.2)">
          <div style="font-size:28px;margin-bottom:8px">🗣️</div>
          <div style="font-size:14px;font-weight:700;color:var(--skill-speaking)">Nói</div>
          <div style="font-size:11px;color:var(--text-tertiary);margin-top:4px">10 phút</div>
        </div>
        <!-- Reading Card -->
        <div style="flex:1;padding:16px;border-radius:var(--r-lg);background:var(--skill-reading-bg);border:1px solid rgba(217,119,6,0.2)">
          <div style="font-size:28px;margin-bottom:8px">📖</div>
          <div style="font-size:14px;font-weight:700;color:var(--skill-reading)">Đọc</div>
          <div style="font-size:11px;color:var(--text-tertiary);margin-top:4px">5 phút</div>
        </div>
      </div>

      <!-- Weekly Activity -->
      <div class="section-card">
        <div class="section-title">📈 Tuần này</div>
        <div style="display:flex;justify-content:space-between;align-items:flex-end;height:80px;padding:8px 0">
          <div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1">
            <div style="width:24px;background:var(--accent);border-radius:4px;height:45px"></div>
            <span style="font-size:10px;color:var(--text-muted)">T2</span>
          </div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1">
            <div style="width:24px;background:var(--accent);border-radius:4px;height:60px"></div>
            <span style="font-size:10px;color:var(--text-muted)">T3</span>
          </div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1">
            <div style="width:24px;background:var(--accent);border-radius:4px;height:30px"></div>
            <span style="font-size:10px;color:var(--text-muted)">T4</span>
          </div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1">
            <div style="width:24px;background:var(--accent);border-radius:4px;height:72px"></div>
            <span style="font-size:10px;color:var(--text-muted)">T5</span>
          </div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1">
            <div style="width:24px;background:var(--accent);border-radius:4px;height:55px"></div>
            <span style="font-size:10px;color:var(--text-muted)">T6</span>
          </div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1">
            <div style="width:24px;background:var(--bg-tertiary);border-radius:4px;height:10px"></div>
            <span style="font-size:10px;color:var(--text-muted)">T7</span>
          </div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1">
            <div style="width:24px;background:var(--bg-tertiary);border-radius:4px;height:10px"></div>
            <span style="font-size:10px;color:var(--text-muted)">CN</span>
          </div>
        </div>
      </div>

      <!-- Recent Lessons -->
      <div class="section-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <span class="section-title" style="margin:0">🕐 Bài học gần đây</span>
          <span style="font-size:12px;color:var(--accent)">Xem tất cả →</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:var(--r-md);background:var(--bg-tertiary)">
            <span style="color:var(--skill-listening);font-size:18px">🎧</span>
            <div style="flex:1"><div style="font-size:13px;font-weight:600">Coffee Shop Talk</div><div style="font-size:11px;color:var(--text-tertiary)">5 phút trước • 15 phút</div></div>
            <span style="font-size:16px;color:var(--accent)">▶️</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:var(--r-md);background:var(--bg-tertiary)">
            <span style="color:var(--skill-speaking);font-size:18px">🗣️</span>
            <div style="flex:1"><div style="font-size:13px;font-weight:600">Tech Pronunciation</div><div style="font-size:11px;color:var(--text-tertiary)">2 giờ trước • 8 phút</div></div>
            <span style="font-size:16px;color:var(--accent)">▶️</span>
          </div>
        </div>
      </div>
    </div>
    ${tabBar('home')}
  `);

  return moduleSection('dashboard', '🏠', 'Dashboard', 1, authDashboard);
}
