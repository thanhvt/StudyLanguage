// ============================================
// Module: Common UI States (5 screens)
// ============================================

function renderCommon() {
  // J1: Loading States
  const loading = phone('J1: Loading States', 'Spinner, Inline, Full', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">Loading States</span><span class="action"></span></div>
    <div class="scroll-content">
      <div class="section-card" style="text-align:center;padding:24px">
        <div style="font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:12px">Full Screen Spinner</div>
        <div style="font-size:32px;animation:wave 1s ease-in-out infinite">⏳</div>
        <div style="font-size:13px;color:var(--text-tertiary);margin-top:8px">Đang tải dữ liệu...</div>
      </div>
      <div class="section-card">
        <div style="font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:12px">Inline Loading</div>
        <div style="display:flex;align-items:center;gap:8px;padding:12px;border-radius:var(--r-md);background:var(--bg-tertiary)">
          <div style="width:16px;height:16px;border:2px solid var(--accent);border-top-color:transparent;border-radius:50%;animation:wave 0.8s linear infinite"></div>
          <span style="font-size:13px;color:var(--text-secondary)">Đang tạo bài nghe...</span>
        </div>
      </div>
      <div class="section-card">
        <div style="font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:12px">Skeleton Cards</div>
        <div class="skeleton" style="height:60px;margin-bottom:8px;border-radius:var(--r-md)"></div>
        <div class="skeleton" style="height:60px;margin-bottom:8px;border-radius:var(--r-md)"></div>
        <div class="skeleton" style="height:20px;width:60%;border-radius:var(--r-sm)"></div>
      </div>
    </div>
  `);

  // J2: Error States
  const errorState = phone('J2: Error States', 'Network, Server, Generic', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">Luyện Nghe</span><span class="action"></span></div>
    <div class="empty-state" style="flex:1">
      <div class="empty-icon">🌐❌</div>
      <div class="empty-title">Không có kết nối mạng</div>
      <div class="empty-desc">Kiểm tra kết nối Internet<br>và thử lại</div>
      <button class="cta-btn" style="max-width:200px;margin:8px 0 0">🔄 Thử lại</button>
    </div>
    <!-- Toast Errors -->
    <div style="position:absolute;bottom:100px;left:16px;right:16px">
      <div style="padding:12px 16px;border-radius:var(--r-md);background:var(--error);color:#fff;display:flex;align-items:center;gap:8px;font-size:13px;box-shadow:0 4px 20px rgba(239,68,68,0.3)">
        <span>❌</span>
        <span style="flex:1">Server error. Vui lòng thử lại sau.</span>
        <span style="opacity:0.7">✕</span>
      </div>
    </div>
    ${tabBar('listen')}
  `);

  // J4: Toast/Snackbar
  const toasts = phone('J4: Toast / Snackbar', 'Success, Error, Info, Bookmark', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">Toast Examples</span><span class="action"></span></div>
    <div class="scroll-content" style="display:flex;flex-direction:column;gap:10px;padding:16px">
      <!-- Success -->
      <div style="padding:12px 16px;border-radius:var(--r-md);background:rgba(34,197,94,0.15);border:1px solid rgba(34,197,94,0.3);display:flex;align-items:center;gap:8px;font-size:13px">
        <span>✅</span><span style="flex:1;color:var(--success)">Bài học đã được lưu!</span><span style="opacity:0.5">✕</span>
      </div>
      <!-- Error -->
      <div style="padding:12px 16px;border-radius:var(--r-md);background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);display:flex;align-items:center;gap:8px;font-size:13px">
        <span>❌</span><span style="flex:1;color:var(--error)">Không thể ghi âm. Kiểm tra micro.</span><span style="opacity:0.5">✕</span>
      </div>
      <!-- Info -->
      <div style="padding:12px 16px;border-radius:var(--r-md);background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.3);display:flex;align-items:center;gap:8px;font-size:13px">
        <span>ℹ️</span><span style="flex:1;color:var(--info)">Phiên bản mới đã sẵn sàng!</span><span style="opacity:0.5">✕</span>
      </div>
      <!-- Bookmark -->
      <div style="padding:12px 16px;border-radius:var(--r-md);background:var(--accent-soft);border:1px solid var(--accent);display:flex;align-items:center;gap:8px;font-size:13px">
        <span>🔖</span><span style="flex:1;color:var(--accent)">Đã bookmark tại 3:24</span><span style="color:var(--accent);font-weight:600">Xem</span>
      </div>
      <!-- Warning -->
      <div style="padding:12px 16px;border-radius:var(--r-md);background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.3);display:flex;align-items:center;gap:8px;font-size:13px">
        <span>⚠️</span><span style="flex:1;color:var(--warning)">Dung lượng gần đầy (4.8/5 GB)</span><span style="opacity:0.5">✕</span>
      </div>
    </div>
  `);

  // J6: Bottom Sheet Variants
  const bottomSheets = phone('J6: Bottom Sheet', 'Standard, actions', `
    ${statusBar()}
    <div style="flex:1;opacity:0.15"></div>
    <div class="bottom-sheet-overlay">
      <div class="bottom-sheet">
        <div class="handle"></div>
        <div style="font-size:16px;font-weight:700;margin-bottom:16px">Actions</div>
        <div class="list-item" style="padding:14px 0"><span class="li-icon">▶️</span><div class="li-content"><div class="li-title">Resume Playback</div></div></div>
        <div class="list-item" style="padding:14px 0"><span class="li-icon">🔖</span><div class="li-content"><div class="li-title">Add Bookmark</div></div></div>
        <div class="list-item" style="padding:14px 0"><span class="li-icon">📤</span><div class="li-content"><div class="li-title">Share</div></div></div>
        <div class="list-item" style="padding:14px 0"><span class="li-icon">📥</span><div class="li-content"><div class="li-title">Download for Offline</div></div></div>
        <div class="list-item" style="padding:14px 0;border:none"><span class="li-icon" style="color:var(--error)">🗑</span><div class="li-content"><div class="li-title" style="color:var(--error)">Delete</div></div></div>
      </div>
    </div>
  `);

  // J7: Tab Bar States
  const tabStates = phone('J7: Tab Bar', 'Active states + badge', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">Tab Bar States</span><span class="action"></span></div>
    <div class="scroll-content" style="padding:16px">
      <div class="section-card">
        <div class="section-title">Default (Home active)</div>
        <div style="display:flex;justify-content:space-around;align-items:center;padding:12px 0;background:var(--tab-bg);border-radius:var(--r-md);border:1px solid var(--border)">
          <div style="text-align:center"><div style="font-size:20px">🏠</div><div style="font-size:10px;color:var(--tab-active);font-weight:600">Home</div><div style="width:4px;height:4px;border-radius:50%;background:var(--tab-active);margin:2px auto 0"></div></div>
          <div style="text-align:center"><div style="font-size:20px">🎧</div><div style="font-size:10px;color:var(--tab-inactive)">Listen</div></div>
          <div style="text-align:center"><div style="font-size:20px">🗣️</div><div style="font-size:10px;color:var(--tab-inactive)">Speak</div></div>
          <div style="text-align:center"><div style="font-size:20px">📖</div><div style="font-size:10px;color:var(--tab-inactive)">Read</div></div>
          <div style="text-align:center;position:relative"><div style="font-size:20px">☰</div><div style="font-size:10px;color:var(--tab-inactive)">More</div><div style="position:absolute;top:-2px;right:-4px;width:8px;height:8px;border-radius:50%;background:var(--error)"></div></div>
        </div>
      </div>
      <div class="section-card">
        <div class="section-title">Listen active</div>
        <div style="display:flex;justify-content:space-around;align-items:center;padding:12px 0;background:var(--tab-bg);border-radius:var(--r-md);border:1px solid var(--border)">
          <div style="text-align:center"><div style="font-size:20px">🏠</div><div style="font-size:10px;color:var(--tab-inactive)">Home</div></div>
          <div style="text-align:center"><div style="font-size:20px">🎧</div><div style="font-size:10px;color:var(--tab-active);font-weight:600">Listen</div><div style="width:4px;height:4px;border-radius:50%;background:var(--tab-active);margin:2px auto 0"></div></div>
          <div style="text-align:center"><div style="font-size:20px">🗣️</div><div style="font-size:10px;color:var(--tab-inactive)">Speak</div></div>
          <div style="text-align:center"><div style="font-size:20px">📖</div><div style="font-size:10px;color:var(--tab-inactive)">Read</div></div>
          <div style="text-align:center"><div style="font-size:20px">☰</div><div style="font-size:10px;color:var(--tab-inactive)">More</div></div>
        </div>
      </div>
    </div>
  `);

  return moduleSection('common', '🧩', 'Common UI States', 5,
    loading + errorState + toasts + bottomSheets + tabStates);
}
