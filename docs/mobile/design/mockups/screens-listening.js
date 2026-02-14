// ============================================
// Module: Listening (13 screens) — UX-Upgraded v2
// BA/QA/UX Review: Cải tiến luồng, bố cục, micro-interactions
// ============================================

function renderListening() {

  // ─────────────────────────────────────────────
  // C1: Config Screen — UX UPGRADED
  // BA insight: User cần thấy ngay topic đã chọn + config tổng quan
  // QA: Mọi section có visual feedback khi active
  // UX: Card layout với depth, collapsible optional, sticky CTA
  // ─────────────────────────────────────────────
  const configScreen = phone('C1: Config Screen', 'Topic, Duration, Speakers — Glass UI', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">🎧 Luyện Nghe</span><span class="action">📻</span></div>
    <div class="scroll-content">
      <!-- Hero Topic Picker — glass card -->
      <div style="margin:0 16px 12px;padding:20px;border-radius:var(--r-xl);background:linear-gradient(135deg,var(--accent-soft),var(--bg-card));border:1px solid var(--accent);position:relative;overflow:hidden">
        <div style="position:absolute;top:-20px;right:-10px;font-size:80px;opacity:0.08">🎧</div>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <div style="font-size:11px;color:var(--accent);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">📝 Chủ đề đã chọn</div>
            <div style="font-size:18px;font-weight:700">☕ Coffee Shop Order</div>
            <div style="font-size:12px;color:var(--text-tertiary);margin-top:4px">Daily Life › Cafes & Restaurants</div>
          </div>
          <div style="width:40px;height:40px;border-radius:var(--r-md);background:var(--accent);display:flex;align-items:center;justify-content:center;color:#000;font-size:16px">✏️</div>
        </div>
        <!-- Config summary pills -->
        <div style="display:flex;gap:6px;margin-top:12px;flex-wrap:wrap">
          <span style="padding:4px 10px;border-radius:var(--r-full);background:var(--bg-tertiary);font-size:11px;color:var(--text-secondary)">⏱️ 10 phút</span>
          <span style="padding:4px 10px;border-radius:var(--r-full);background:var(--bg-tertiary);font-size:11px;color:var(--text-secondary)">👥 2 người</span>
          <span style="padding:4px 10px;border-radius:var(--r-full);background:var(--bg-tertiary);font-size:11px;color:var(--text-secondary)">🌿 Trung cấp</span>
        </div>
      </div>

      <!-- Duration — glass surface card -->
      <div style="margin:0 16px 12px;padding:16px;border-radius:var(--r-lg);background:var(--bg-card);border:1px solid var(--border)">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <div style="font-size:13px;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px">⏱️ Thời lượng</div>
          <span style="font-size:12px;color:var(--accent);font-weight:600">10 phút</span>
        </div>
        <div class="chip-row">
          <span class="chip">5'</span><span class="chip active" style="background:var(--accent);color:#000;border-color:var(--accent)">10'</span>
          <span class="chip">15'</span><span class="chip">20'</span>
          <span class="chip" style="border:1px dashed var(--border-strong)">⏱ Tuỳ</span>
        </div>
      </div>

      <!-- Speakers — glass surface card -->
      <div style="margin:0 16px 12px;padding:16px;border-radius:var(--r-lg);background:var(--bg-card);border:1px solid var(--border)">
        <div style="font-size:13px;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">👥 Số người nói</div>
        <div class="chip-row">
          <span class="chip" style="min-width:44px;text-align:center">1</span>
          <span class="chip active" style="min-width:44px;text-align:center;background:var(--accent);color:#000;border-color:var(--accent)">2</span>
          <span class="chip" style="min-width:44px;text-align:center">3</span>
        </div>
      </div>

      <!-- Collapsible Optional Section — glass -->
      <div style="margin:0 16px 8px;border-radius:var(--r-lg);background:var(--bg-card);border:1px solid var(--border);overflow:hidden">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;cursor:pointer">
          <span style="font-size:14px;font-weight:600;color:var(--text-secondary)">🔧 Tuỳ chọn thêm</span>
          <span style="color:var(--text-muted);font-size:12px;transform:rotate(180deg)">▲</span>
        </div>
        <div style="padding:0 16px 12px">
          <div style="font-size:12px;color:var(--text-tertiary);margin-bottom:6px">🔑 Từ khoá (tuỳ chọn)</div>
          <input class="input-field" placeholder="coffee, travel, work..." style="background:var(--bg-tertiary);border:1px solid var(--border);font-size:13px;padding:10px 12px">
        </div>
        <div style="padding:0 16px 12px">
          <div style="display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:var(--r-md);background:var(--bg-tertiary);border:1px dashed var(--border-strong);cursor:pointer">
            <span style="font-size:16px">✨</span>
            <div style="flex:1"><div style="font-size:13px;font-weight:600;color:var(--text-secondary)">Custom Scenario</div><div style="font-size:11px;color:var(--text-tertiary)">Tạo kịch bản riêng của bạn</div></div>
            <span style="color:var(--text-muted)">›</span>
          </div>
        </div>
      </div>

      <!-- Advanced Options trigger — accent glass -->
      <div style="margin:0 16px 8px;display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-radius:var(--r-lg);background:var(--accent-soft);border:1px solid var(--accent);cursor:pointer">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:16px">⚙️</span>
          <div><div style="font-size:14px;font-weight:600;color:var(--accent)">Tuỳ chọn nâng cao</div><div style="font-size:11px;color:var(--text-tertiary)">TTS, giọng nói, multi-talker</div></div>
        </div>
        <span style="color:var(--accent)">›</span>
      </div>
    </div>

    <!-- Sticky CTA with glow -->
    <button class="cta-btn" style="box-shadow:0 -8px 24px var(--accent-glow)">🎧 Bắt đầu nghe</button>
    ${tabBar('listen')}
  `);

  // ─────────────────────────────────────────────
  // C1b: TopicPickerModal — MỚI
  // BA: User cần browse 100+ scenarios theo category, search, favorites
  // QA: Search debounce, empty state, accordion smooth
  // UX: Full-screen modal, tab bar, search bar, subcategory accordion
  // ─────────────────────────────────────────────
  const topicPickerModal = phone('C1b: Topic Picker', 'Categories, Search, Favorites', `
    ${statusBar()}
    <div class="app-bar"><span class="back">✕</span><span class="title">Chọn chủ đề</span><span class="action">✓</span></div>
    <!-- Search Bar -->
    <div style="padding:8px 16px">
      <div style="display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:var(--r-lg);background:var(--bg-tertiary);border:1px solid var(--border)">
        <span style="color:var(--text-muted);font-size:14px">🔍</span>
        <span style="font-size:13px;color:var(--text-muted)">Tìm scenario...</span>
      </div>
    </div>
    <!-- Category Tabs -->
    <div style="display:flex;gap:6px;padding:4px 16px 12px;overflow-x:auto">
      <div style="padding:6px 14px;border-radius:var(--r-full);background:var(--accent);color:#fff;font-size:12px;font-weight:600;white-space:nowrap">📋 Tất cả</div>
      <div style="padding:6px 14px;border-radius:var(--r-full);background:var(--bg-tertiary);color:var(--text-secondary);font-size:12px;white-space:nowrap">⭐ Yêu thích</div>
      <div style="padding:6px 14px;border-radius:var(--r-full);background:var(--bg-tertiary);color:var(--text-secondary);font-size:12px;white-space:nowrap">🏠 Daily Life</div>
      <div style="padding:6px 14px;border-radius:var(--r-full);background:var(--bg-tertiary);color:var(--text-secondary);font-size:12px;white-space:nowrap">💼 Work</div>
      <div style="padding:6px 14px;border-radius:var(--r-full);background:var(--bg-tertiary);color:var(--text-secondary);font-size:12px;white-space:nowrap">🎓 Academic</div>
    </div>
    <div class="scroll-content" style="padding-top:0">
      <!-- Subcategory Accordion: Expanded -->
      <div style="margin:0 16px 8px">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0">
          <div style="font-size:14px;font-weight:600">🍽️ Cafes & Restaurants</div>
          <span style="color:var(--text-muted);font-size:12px">▼</span>
        </div>
        <!-- Scenario Items -->
        <div style="display:flex;flex-direction:column;gap:6px">
          <div style="display:flex;align-items:center;gap:10px;padding:12px;border-radius:var(--r-md);background:var(--accent-soft);border:1px solid var(--accent)">
            <span style="font-size:20px">☕</span>
            <div style="flex:1"><div style="font-size:13px;font-weight:600;color:var(--accent)">Coffee Shop Order</div><div style="font-size:11px;color:var(--text-tertiary)">Gọi đồ uống, thanh toán</div></div>
            <span style="color:var(--accent)">⭐</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;padding:12px;border-radius:var(--r-md);background:var(--bg-tertiary)">
            <span style="font-size:20px">🍕</span>
            <div style="flex:1"><div style="font-size:13px;font-weight:600">Restaurant Reservation</div><div style="font-size:11px;color:var(--text-tertiary)">Đặt bàn, order, feedback</div></div>
            <span style="color:var(--text-muted)">☆</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;padding:12px;border-radius:var(--r-md);background:var(--bg-tertiary)">
            <span style="font-size:20px">🛒</span>
            <div style="flex:1"><div style="font-size:13px;font-weight:600">Grocery Shopping</div><div style="font-size:11px;color:var(--text-tertiary)">Mua sắm, hỏi giá</div></div>
            <span style="color:var(--text-muted)">☆</span>
          </div>
        </div>
      </div>
      <!-- Subcategory: Collapsed -->
      <div style="margin:0 16px 8px">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-top:1px solid var(--border)">
          <div style="font-size:14px;font-weight:600">✈️ Travel & Transport</div>
          <span style="color:var(--text-muted);font-size:12px">▶</span>
        </div>
      </div>
      <div style="margin:0 16px 8px">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-top:1px solid var(--border)">
          <div style="font-size:14px;font-weight:600">🏥 Health & Wellness</div>
          <span style="color:var(--text-muted);font-size:12px">▶</span>
        </div>
      </div>
    </div>
  `);

  // ─────────────────────────────────────────────
  // C2: Advanced Options — SCREENSHOT-MATCHED
  // BA: Matching real app AdvancedOptionsSheet.tsx exactly
  // UX: Glass surfaces, Speaker A/B dropdowns, info text, close button
  // ─────────────────────────────────────────────
  const advancedSheet = phone('C2: Advanced Options', 'Glass — Level, Voice, Multi-talker', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">Luyện Nghe</span><span class="action">⋮</span></div>
    <div style="flex:1;opacity:0.3;padding:16px">
      <div class="section-card" style="opacity:0.5"><div style="height:40px"></div></div>
    </div>
    <div class="bottom-sheet-overlay">
      <div class="bottom-sheet" style="max-height:82%;overflow-y:auto">
        <div class="handle"></div>
        <!-- Header with ✕ close -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
          <div style="font-family:var(--font-display);font-size:18px;font-weight:700">⚙️ Tuỳ chọn nâng cao</div>
          <div style="width:32px;height:32px;border-radius:50%;background:var(--bg-tertiary);display:flex;align-items:center;justify-content:center;font-size:14px;color:var(--text-tertiary);cursor:pointer">✕</div>
        </div>

        <!-- 🎯 Trình độ — Section with label -->
        <div style="margin-bottom:20px">
          <div style="font-size:13px;font-weight:600;margin-bottom:10px;color:var(--text-secondary)">🎯 Trình độ</div>
          <div class="chip-row" style="gap:10px">
            <span class="chip" style="flex:1;padding:10px 0;font-size:13px;text-align:center;border-color:#22c55e50;color:#22c55e">🌱 Cơ bản</span>
            <span class="chip active" style="flex:1;padding:10px 0;font-size:13px;text-align:center;background:#22c55e18;border-color:#22c55e;color:#22c55e;font-weight:700">🌿 Trung cấp</span>
            <span class="chip" style="flex:1;padding:10px 0;font-size:13px;text-align:center;border-color:#D9770650;color:#D97706">🌳 Nâng cao</span>
          </div>
        </div>

        <!-- 🔊 Giọng đọc — Section -->
        <div style="margin-bottom:20px">
          <div style="font-size:13px;font-weight:600;margin-bottom:10px;color:var(--text-secondary)">🔊 Giọng đọc</div>
          <!-- Random toggle — glass surface -->
          <div style="padding:14px 16px;border-radius:var(--r-lg);background:var(--bg-card);border:1px solid var(--border);margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div>
                <div style="font-size:15px;font-weight:500">🎲 Giọng ngẫu nhiên</div>
                <div style="font-size:12px;color:var(--text-tertiary);margin-top:2px">AI tự chọn giọng phù hợp cho từng speaker</div>
              </div>
              <div class="toggle-switch" style="flex-shrink:0"></div>
            </div>
          </div>
          <!-- Speaker A dropdown — glass surface -->
          <div style="padding:14px 16px;border-radius:var(--r-lg);background:var(--bg-card);border:1px solid var(--border);margin-bottom:8px">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div style="display:flex;align-items:center;gap:8px">
                <span style="font-size:16px">👤</span>
                <span style="font-size:15px;font-weight:500">Speaker A</span>
              </div>
              <div style="display:flex;align-items:center;gap:6px">
                <span style="font-size:13px;color:var(--text-tertiary)">Jenny (Nữ)</span>
                <span style="color:var(--text-muted);font-size:10px">▼</span>
              </div>
            </div>
          </div>
          <!-- Speaker B dropdown — glass surface -->
          <div style="padding:14px 16px;border-radius:var(--r-lg);background:var(--bg-card);border:1px solid var(--border)">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div style="display:flex;align-items:center;gap:8px">
                <span style="font-size:16px">👤</span>
                <span style="font-size:15px;font-weight:500">Speaker B</span>
              </div>
              <div style="display:flex;align-items:center;gap:6px">
                <span style="font-size:13px;color:var(--text-tertiary)">Guy (Nam)</span>
                <span style="color:var(--text-muted);font-size:10px">▼</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 🐲 Multi-talker — Section -->
        <div style="margin-bottom:16px">
          <div style="font-size:13px;font-weight:600;margin-bottom:10px;color:var(--text-secondary)">🐲 Multi-talker</div>
          <!-- Toggle — glass surface -->
          <div style="padding:14px 16px;border-radius:var(--r-lg);background:var(--bg-card);border:1px solid var(--border);margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
              <div>
                <div style="font-size:15px;font-weight:500">Đa giọng nói cùng lúc</div>
                <div style="font-size:12px;color:var(--text-tertiary);margin-top:2px">Gen 1 lần, giọng tự nhiên hơn</div>
              </div>
              <div class="toggle-switch on" style="flex-shrink:0"></div>
            </div>
            <div style="font-size:13px;color:var(--text-secondary);margin-top:6px">Cặp giọng: <strong>Ava - Andrew</strong></div>
          </div>
        </div>

        <!-- Info text -->
        <div style="font-size:12px;color:var(--text-muted);text-align:center;padding:4px 0">
          ℹ️ 9 giọng Azure Neural Voice (5 nữ + 4 nam)
        </div>
      </div>
    </div>
  `);

  // ─────────────────────────────────────────────
  // C3: Player — UX UPGRADED
  // BA: Bookmark ⭐ per exchange, speed cycle inline, gesture hints
  // QA: Active exchange highlight, progress accuracy
  // UX: Richer transcript, tappable words, action bar
  // ─────────────────────────────────────────────
  const playerScreen = phone('C3: Player - Podcast', 'Transcript + Bookmarks + Speed', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">Coffee Shop Talk</span><span class="action" style="display:flex;gap:8px"><span>📱</span><span>🔖</span></span></div>
    <div class="scroll-content">
      <!-- Waveform -->
      <div style="display:flex;justify-content:center;padding:12px 0">
        <div class="waveform">
          <div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div>
          <div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div>
        </div>
      </div>
      <!-- Progress -->
      <div style="padding:0 16px">
        <div class="progress-bar" style="height:4px"><div class="progress-fill" style="width:35%"></div></div>
        <div style="display:flex;justify-content:space-between;margin-top:4px;font-size:11px;color:var(--text-muted)"><span>3:24</span><span>10:00</span></div>
      </div>
      <!-- Controls -->
      <div class="playback-controls">
        <div class="control-btn">⏪</div>
        <div class="control-btn">-15</div>
        <div class="play-btn">⏸</div>
        <div class="control-btn">+15</div>
        <div class="control-btn">⏩</div>
      </div>
      <!-- Action Bar: Speed + Repeat + Bookmark + Pocket -->
      <div style="display:flex;justify-content:center;gap:20px;padding:0 0 12px">
        <div style="padding:4px 12px;border-radius:var(--r-full);background:var(--accent-soft);border:1px solid var(--accent);font-size:12px;color:var(--accent);font-weight:700">1.0x</div>
        <span style="font-size:12px;color:var(--text-tertiary);display:flex;align-items:center">🔁 Repeat</span>
        <span style="font-size:12px;color:var(--text-tertiary);display:flex;align-items:center">🔖 Save</span>
      </div>
      <!-- Transcript with bookmarks -->
      <div class="section-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <div class="section-title" style="margin:0">📖 Transcript</div>
          <span style="font-size:11px;color:var(--text-muted)">Tap từ để tra nghĩa</span>
        </div>
        <div style="font-size:14px;line-height:1.8;color:var(--text-secondary)">
          <!-- Active exchange with bookmark -->
          <div style="padding:8px 10px;border-left:3px solid var(--accent);background:var(--accent-soft);border-radius:0 var(--r-sm) var(--r-sm) 0;margin:4px 0;display:flex;align-items:flex-start;gap:6px">
            <div style="flex:1"><span style="font-size:11px;color:var(--accent);font-weight:600">A:</span> Hi, can I get a large latte with oat milk?</div>
            <span style="font-size:14px;flex-shrink:0">⭐</span>
          </div>
          <!-- Normal exchange -->
          <div style="padding:8px 10px;margin:4px 0;display:flex;align-items:flex-start;gap:6px">
            <div style="flex:1"><span style="font-size:11px;color:var(--text-tertiary)">B:</span> Sure! Would you like any flavor added to that?</div>
            <span style="font-size:14px;opacity:0.15;flex-shrink:0">☆</span>
          </div>
          <div style="padding:8px 10px;margin:4px 0;display:flex;align-items:flex-start;gap:6px">
            <div style="flex:1;color:var(--text-tertiary)"><span style="font-size:11px">A:</span> Could I add a shot of vanilla, please?</div>
            <span style="font-size:14px;opacity:0.15;flex-shrink:0">☆</span>
          </div>
        </div>
      </div>
      <!-- Gesture Hint -->
      <div style="text-align:center;padding:8px 0;font-size:11px;color:var(--text-muted)">
        ← Swipe trái/phải để skip • Double-tap để pause →
      </div>
    </div>
    ${tabBar('listen')}
  `);

  // C5: Speed Control Popup (giữ nguyên concept)
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

  // ─────────────────────────────────────────────
  // C7a: Custom Scenarios — CREATE FORM
  // BA: Matching CustomScenarioInput.tsx — name/desc inputs + ⚡/💾 buttons
  // QA: Validation states, loading spinner on save
  // ─────────────────────────────────────────────
  const customCreateForm = phone('C7a: Custom — Create', 'Form + Quick Use / Save', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">Custom Scenarios</span><span class="action">✕</span></div>
    <div class="scroll-content">
      <!-- Create Form Card — glass surface -->
      <div style="margin:0 16px 16px;padding:16px;border-radius:var(--r-lg);background:var(--bg-card);border:1px solid var(--border)">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <div style="font-size:14px;font-weight:600">✨ Tạo kịch bản mới</div>
        </div>
        <!-- Name Input -->
        <div style="margin-bottom:8px">
          <input class="input-field" placeholder="Tên kịch bản..." value="Job Interview Practice" style="background:var(--bg-tertiary);border:1px solid var(--border);font-size:14px;padding:12px 14px;border-radius:var(--r-md)">
        </div>
        <!-- Description Input -->
        <div style="margin-bottom:12px">
          <div style="padding:12px 14px;border-radius:var(--r-md);background:var(--bg-tertiary);border:1px solid var(--border);min-height:60px">
            <div style="font-size:14px;color:var(--text-primary)">Practice answering common interview questions for tech companies...</div>
          </div>
        </div>
        <!-- Action Buttons -->
        <div style="display:flex;gap:8px">
          <button class="cta-btn" style="flex:1;margin:0;padding:12px;font-size:13px">⚡ Sử dụng ngay</button>
          <button class="cta-btn secondary" style="flex:1;margin:0;padding:12px;font-size:13px">💾 Lưu lại</button>
        </div>
      </div>

      <!-- Saved List Header -->
      <div style="padding:0 16px 8px">
        <div style="font-size:12px;color:var(--text-tertiary)">Đã lưu (3)</div>
      </div>

      <!-- Saved Scenarios Preview (compact) -->
      <div style="padding:0 16px;display:flex;flex-direction:column;gap:6px">
        <div style="display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:var(--r-md);background:var(--bg-card);border:1px solid var(--border)">
          <div style="flex:1"><div style="font-size:14px;font-weight:500">☕ Coffee Shop Order</div><div style="font-size:11px;color:var(--text-tertiary);margin-top:2px">Gọi đồ uống, thanh toán</div></div>
          <span style="font-size:14px;color:var(--warning)">⭐</span>
          <span style="font-size:12px;color:var(--text-muted)">🗑️</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:var(--r-md);background:var(--bg-card);border:1px solid var(--border)">
          <div style="flex:1"><div style="font-size:14px;font-weight:500">✈️ Airport Check-in</div><div style="font-size:11px;color:var(--text-tertiary);margin-top:2px">Boarding, luggage, customs</div></div>
          <span style="font-size:14px;color:var(--text-muted)">☆</span>
          <span style="font-size:12px;color:var(--text-muted)">🗑️</span>
        </div>
      </div>
    </div>
  `);

  // ─────────────────────────────────────────────
  // C7b: Custom Scenarios — SAVED LIST + CRUD
  // BA: Full list with favorite/delete/quick-use, empty state hint
  // QA: Swipe actions, confirm dialog on delete
  // ─────────────────────────────────────────────
  const customSavedList = phone('C7b: Custom — Saved', 'List + ⭐ Fav + 🗑️ Delete', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">Custom Scenarios</span><span class="action">＋</span></div>
    <div class="scroll-content">
      <!-- Filter Tabs -->
      <div style="display:flex;gap:8px;padding:8px 16px 12px">
        <div style="padding:6px 14px;border-radius:var(--r-full);background:var(--accent);color:#000;font-size:12px;font-weight:600">📋 Tất cả</div>
        <div style="padding:6px 14px;border-radius:var(--r-full);background:var(--bg-tertiary);color:var(--text-secondary);font-size:12px">⭐ Yêu thích</div>
      </div>

      <!-- Saved Scenarios List -->
      <div style="padding:0 16px;display:flex;flex-direction:column;gap:6px">
        <!-- Item 1: Favorite -->
        <div style="display:flex;align-items:center;gap:10px;padding:14px;border-radius:var(--r-lg);background:var(--bg-card);border:1px solid var(--border)">
          <div style="flex:1">
            <div style="font-size:15px;font-weight:600">☕ Coffee Shop Order</div>
            <div style="font-size:12px;color:var(--text-tertiary);margin-top:3px">Gọi đồ uống, thanh toán tips</div>
          </div>
          <span style="font-size:16px;color:var(--warning)">⭐</span>
          <span style="font-size:14px;color:var(--error);opacity:0.6;cursor:pointer">🗑️</span>
        </div>
        <!-- Item 2 -->
        <div style="display:flex;align-items:center;gap:10px;padding:14px;border-radius:var(--r-lg);background:var(--bg-card);border:1px solid var(--border)">
          <div style="flex:1">
            <div style="font-size:15px;font-weight:600">✈️ Airport Check-in</div>
            <div style="font-size:12px;color:var(--text-tertiary);margin-top:3px">Boarding, luggage, customs</div>
          </div>
          <span style="font-size:16px;color:var(--text-muted)">☆</span>
          <span style="font-size:14px;color:var(--error);opacity:0.6;cursor:pointer">🗑️</span>
        </div>
        <!-- Item 3 -->
        <div style="display:flex;align-items:center;gap:10px;padding:14px;border-radius:var(--r-lg);background:var(--bg-card);border:1px solid var(--border)">
          <div style="flex:1">
            <div style="font-size:15px;font-weight:600">🏥 Doctor Visit</div>
            <div style="font-size:12px;color:var(--text-tertiary);margin-top:3px">Describe symptoms, get diagnosis</div>
          </div>
          <span style="font-size:16px;color:var(--text-muted)">☆</span>
          <span style="font-size:14px;color:var(--error);opacity:0.6;cursor:pointer">🗑️</span>
        </div>
        <!-- Item 4: Being deleted (swipe hint) -->
        <div style="display:flex;align-items:center;gap:10px;padding:14px;border-radius:var(--r-lg);background:var(--error);background:rgba(239,68,68,0.12);border:1px solid var(--error);opacity:0.7">
          <div style="flex:1">
            <div style="font-size:15px;font-weight:600;color:var(--error)">🎓 Academic Presentation</div>
            <div style="font-size:12px;color:var(--error);opacity:0.7;margin-top:3px">Xoá kịch bản này?</div>
          </div>
          <span style="font-size:12px;color:var(--error);font-weight:600">Xoá</span>
        </div>
      </div>

      <!-- Tap-to-use hint -->
      <div style="padding:16px 16px 0;font-size:11px;color:var(--text-muted);text-align:center">
        Tap vào kịch bản để sử dụng ngay
      </div>
    </div>
    <button class="cta-btn">＋ Tạo scenario mới</button>
    ${tabBar('listen')}
  `);

  // C8: TTS Voice Settings (giữ nguyên)
  const ttsSettings = phone('C8: TTS Voice Settings', 'Provider, Voice, Emotion', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">Cài đặt giọng nói</span><span class="action">✓</span></div>
    <div class="scroll-content">
      <div class="section-card">
        <div class="section-title">🔊 Nhà cung cấp</div>
        <div class="chip-row"><span class="chip active">OpenAI</span><span class="chip">Azure</span></div>
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
        <div class="chip-row"><span class="chip active">Neutral</span><span class="chip">Cheerful</span><span class="chip">Serious</span><span class="chip">Excited</span></div>
      </div>
      <div class="section-card">
        <div class="section-title">🎚️ Tuỳ chỉnh</div>
        <div class="toggle-row"><div class="toggle-label">Pitch</div><div style="display:flex;align-items:center;gap:8px"><span style="font-size:12px;color:var(--text-muted)">Low</span><div style="width:100px;height:4px;background:var(--bg-tertiary);border-radius:2px;position:relative"><div style="width:50%;height:100%;background:var(--accent);border-radius:2px"></div></div><span style="font-size:12px;color:var(--text-muted)">High</span></div></div>
        <div class="toggle-row"><div class="toggle-label">Rate</div><div style="display:flex;align-items:center;gap:8px"><span style="font-size:12px;color:var(--text-muted)">Slow</span><div style="width:100px;height:4px;background:var(--bg-tertiary);border-radius:2px;position:relative"><div style="width:60%;height:100%;background:var(--accent);border-radius:2px"></div></div><span style="font-size:12px;color:var(--text-muted)">Fast</span></div></div>
      </div>
    </div>
  `);

  // ─────────────────────────────────────────────
  // C9: Radio Mode — MỚI
  // BA: Nghe thụ động không cần chọn topic, backend random
  // QA: Track list hiện category badge, auto-next
  // UX: Duration cards visual, playlist with progress
  // ─────────────────────────────────────────────
  const radioScreen = phone('C9: Radio Mode', 'Auto playlist + duration', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">📻 Radio Mode</span><span class="action">⏹</span></div>
    <div class="scroll-content">
      <!-- Duration Selection -->
      <div style="padding:0 16px 12px">
        <div style="font-size:13px;font-weight:600;margin-bottom:8px;color:var(--text-secondary)">⏱️ Chọn thời lượng</div>
        <div style="display:flex;gap:8px">
          <div style="flex:1;padding:12px;border-radius:var(--r-lg);background:var(--bg-tertiary);text-align:center">
            <div style="font-size:20px;margin-bottom:4px">⚡</div>
            <div style="font-size:14px;font-weight:700">1'</div>
            <div style="font-size:10px;color:var(--text-muted)">Thử nhanh</div>
          </div>
          <div style="flex:1;padding:12px;border-radius:var(--r-lg);background:var(--bg-tertiary);text-align:center">
            <div style="font-size:20px;margin-bottom:4px">🎧</div>
            <div style="font-size:14px;font-weight:700">30'</div>
            <div style="font-size:10px;color:var(--text-muted)">Ngắn gọn</div>
          </div>
          <div style="flex:1;padding:12px;border-radius:var(--r-lg);background:var(--accent-soft);border:1px solid var(--accent);text-align:center">
            <div style="font-size:20px;margin-bottom:4px">📻</div>
            <div style="font-size:14px;font-weight:700;color:var(--accent)">60'</div>
            <div style="font-size:10px;color:var(--accent)">Tiêu chuẩn</div>
          </div>
          <div style="flex:1;padding:12px;border-radius:var(--r-lg);background:var(--bg-tertiary);text-align:center">
            <div style="font-size:20px;margin-bottom:4px">🎵</div>
            <div style="font-size:14px;font-weight:700">120'</div>
            <div style="font-size:10px;color:var(--text-muted)">Marathon</div>
          </div>
        </div>
      </div>
      <!-- Now Playing -->
      <div class="section-card" style="border:1px solid var(--accent)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <div class="waveform" style="gap:2px"><div class="wave-bar" style="height:12px"></div><div class="wave-bar" style="height:16px"></div><div class="wave-bar" style="height:12px"></div></div>
          <span style="font-size:12px;color:var(--accent);font-weight:600">ĐANG PHÁT</span>
        </div>
        <div style="font-size:15px;font-weight:700;margin-bottom:4px">☕ Coffee Shop Talk</div>
        <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:8px">🏠 Daily Life • 2 speakers • 5 phút</div>
        <div class="progress-bar" style="height:3px"><div class="progress-fill" style="width:60%"></div></div>
        <div style="display:flex;justify-content:space-between;margin-top:4px;font-size:10px;color:var(--text-muted)"><span>3:00</span><span>5:00</span></div>
      </div>
      <!-- Playlist -->
      <div style="padding:0 16px">
        <div style="font-size:13px;font-weight:600;margin-bottom:8px">📋 Playlist (12 tracks)</div>
        <div style="display:flex;flex-direction:column;gap:6px">
          <div style="display:flex;align-items:center;gap:8px;padding:10px;border-radius:var(--r-md);background:var(--accent-soft);border-left:3px solid var(--accent)">
            <span style="font-size:14px;color:var(--accent)">▶</span>
            <div style="flex:1"><div style="font-size:13px;font-weight:600;color:var(--accent)">Coffee Shop Talk</div></div>
            <span style="font-size:11px;color:var(--text-muted)">5:00</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;padding:10px;border-radius:var(--r-md);background:var(--bg-tertiary)">
            <span style="font-size:14px;color:var(--text-muted)">2</span>
            <div style="flex:1"><div style="font-size:13px;font-weight:600">Airport Check-in</div></div>
            <span style="font-size:11px;color:var(--text-muted)">6:30</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;padding:10px;border-radius:var(--r-md);background:var(--bg-tertiary)">
            <span style="font-size:14px;color:var(--text-muted)">3</span>
            <div style="flex:1"><div style="font-size:13px;font-weight:600">Weekend Plans</div></div>
            <span style="font-size:11px;color:var(--text-muted)">4:00</span>
          </div>
        </div>
      </div>
    </div>
    ${tabBar('listen')}
  `);

  // ─────────────────────────────────────────────
  // C10: Compact Player — UX UPGRADED
  // BA: Waveform + progress + close button
  // QA: Shows on every screen, above tab bar
  // ─────────────────────────────────────────────
  const compactPlayer = phone('C10: Compact Player', 'Waveform + Progress + Close', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">Luyện Nghe</span><span class="action">⋮</span></div>
    <div class="scroll-content">
      <div class="section-card"><div style="height:60px"></div></div>
      <div class="section-card"><div style="height:60px"></div></div>
      <div class="section-card"><div style="height:60px"></div></div>
    </div>
    <!-- Compact Player Bar — upgraded -->
    <div style="position:absolute;bottom:70px;left:12px;right:12px;border-radius:16px;overflow:hidden;background:var(--bg-card);border:1px solid var(--border)">
      <!-- Thin progress bar at top -->
      <div style="height:2px;background:var(--bg-tertiary)"><div style="width:35%;height:100%;background:var(--accent)"></div></div>
      <div style="display:flex;align-items:center;padding:10px 12px;gap:10px">
        <div class="waveform" style="gap:2px"><div class="wave-bar" style="height:12px"></div><div class="wave-bar" style="height:16px"></div><div class="wave-bar" style="height:10px"></div></div>
        <div style="flex:1"><div style="font-size:13px;font-weight:600">Coffee Shop Talk</div><div style="font-size:11px;color:var(--text-tertiary)">3:24 / 10:00</div></div>
        <div style="width:32px;height:32px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px">⏸</div>
        <span style="font-size:14px;color:var(--text-muted);cursor:pointer">✕</span>
      </div>
    </div>
    ${tabBar('listen')}
  `);

  // ─────────────────────────────────────────────
  // C11: Minimized Player — MỚI
  // BA: FAB pill, draggable, minimal footprint
  // UX: Floating action button with play indicator
  // ─────────────────────────────────────────────
  const minimizedPlayer = phone('C11: Minimized Player', 'FAB Pill — draggable', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">Luyện Nghe</span><span class="action">⋮</span></div>
    <div class="scroll-content">
      <div class="section-card"><div style="height:60px"></div></div>
      <div class="section-card"><div style="height:60px"></div></div>
    </div>
    <!-- Minimized FAB Pill -->
    <div style="position:absolute;bottom:90px;right:16px;display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:28px;background:var(--bg-card);border:1px solid var(--accent);box-shadow:0 4px 20px var(--accent-glow)">
      <div style="width:8px;height:8px;border-radius:50%;background:var(--accent);animation:pulse-record 1.5s ease-in-out infinite"></div>
      <span style="font-size:14px">🎧</span>
      <div style="width:28px;height:28px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px">⏸</div>
    </div>
    <!-- Hint -->
    <div style="position:absolute;bottom:70px;right:16px;font-size:10px;color:var(--text-muted);text-align:right">
      Tap → mở • Long press → full
    </div>
    ${tabBar('listen')}
  `);

  // C12: Pocket Mode (giữ nguyên)
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

  // ─────────────────────────────────────────────
  // C13: Dictionary Popup — MỚI
  // BA: Tap từ trong transcript → tra nghĩa
  // QA: IPA, meanings, examples, save word
  // UX: BottomSheet smooth, part-of-speech badges
  // ─────────────────────────────────────────────
  const dictionaryPopup = phone('C13: Dictionary Popup', 'BottomSheet — IPA, meanings', `
    ${statusBar()}
    <div class="app-bar"><span class="back">←</span><span class="title">Coffee Shop Talk</span><span class="action">🔖</span></div>
    <div style="flex:1;opacity:0.3;padding:16px">
      <div class="section-card" style="opacity:0.5"><div style="height:40px"></div></div>
    </div>
    <div class="bottom-sheet-overlay">
      <div class="bottom-sheet" style="max-height:55%">
        <div class="handle"></div>
        <!-- Word header -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <div>
            <div style="font-size:24px;font-weight:800">latte</div>
            <div style="font-size:13px;color:var(--text-tertiary);font-family:monospace;margin-top:2px">/ˈlɑːteɪ/</div>
          </div>
          <div style="display:flex;gap:8px">
            <div style="width:36px;height:36px;border-radius:50%;background:var(--bg-tertiary);display:flex;align-items:center;justify-content:center;font-size:16px">🔊</div>
            <div style="width:36px;height:36px;border-radius:50%;background:var(--accent-soft);border:1px solid var(--accent);display:flex;align-items:center;justify-content:center;font-size:16px">💾</div>
          </div>
        </div>
        <!-- Part of speech badge -->
        <div style="display:flex;gap:6px;margin-bottom:12px">
          <span style="padding:3px 10px;border-radius:var(--r-full);background:#3b82f620;color:#3b82f6;font-size:11px;font-weight:600">noun</span>
        </div>
        <!-- Meanings -->
        <div style="margin-bottom:12px">
          <div style="font-size:13px;font-weight:600;margin-bottom:6px">Định nghĩa</div>
          <div style="font-size:13px;color:var(--text-secondary);line-height:1.6;padding-left:12px;border-left:2px solid var(--accent)">
            A drink made with espresso and steamed milk.
          </div>
        </div>
        <!-- Example -->
        <div>
          <div style="font-size:13px;font-weight:600;margin-bottom:6px">Ví dụ</div>
          <div style="font-size:13px;color:var(--text-tertiary);font-style:italic;padding:8px 12px;background:var(--bg-tertiary);border-radius:var(--r-md)">
            "I ordered a large <span style="color:var(--accent);font-weight:600">latte</span> with oat milk."
          </div>
        </div>
      </div>
    </div>
  `);

  return moduleSection('listening', '🎧', 'Listening', 14,
    configScreen + topicPickerModal + advancedSheet + playerScreen + speedPopup + customCreateForm + customSavedList + ttsSettings + radioScreen + compactPlayer + minimizedPlayer + pocketMode + dictionaryPopup);
}
