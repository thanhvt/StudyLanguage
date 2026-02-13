// ============================================
// Module: Special Modes (5 screens)
// ============================================

function renderSpecial() {
  // H1: Car Mode
  const carMode = phone('H1: Car Mode', 'OLED black, voice prompt, now playing', `
    <div style="height:100%;background:#000;color:#fff;display:flex;flex-direction:column;padding:60px 24px 40px">
      <div style="text-align:center;margin-bottom:auto">
        <div style="font-size:14px;opacity:0.4;letter-spacing:2px;text-transform:uppercase">CAR MODE</div>
        <div style="font-size:12px;opacity:0.3;margin-top:4px">🚗 Driving Safe</div>
      </div>
      <div style="text-align:center;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center">
        <div style="font-size:56px;margin-bottom:16px">🎧</div>
        <div style="font-size:18px;font-weight:700;margin-bottom:4px">Coffee Shop Talk</div>
        <div style="font-size:14px;opacity:0.5">3:24 / 10:00</div>
        <div style="width:80%;height:3px;background:rgba(255,255,255,0.1);border-radius:2px;margin:16px 0">
          <div style="width:34%;height:100%;background:#06B6D4;border-radius:2px"></div>
        </div>
        <!-- Big Controls -->
        <div style="display:flex;gap:40px;margin-top:16px">
          <div style="width:60px;height:60px;border-radius:50%;border:2px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px">⏪</div>
          <div style="width:80px;height:80px;border-radius:50%;background:#06B6D4;display:flex;align-items:center;justify-content:center;font-size:32px">⏸</div>
          <div style="width:60px;height:60px;border-radius:50%;border:2px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px">⏩</div>
        </div>
      </div>
      <div style="text-align:center;margin-top:auto">
        <div style="display:flex;gap:16px;justify-content:center;opacity:0.4">
          <div style="padding:8px 16px;border:1px solid rgba(255,255,255,0.2);border-radius:30px;font-size:14px">🎤 Voice</div>
          <div style="padding:8px 16px;border:1px solid rgba(255,255,255,0.2);border-radius:30px;font-size:14px">🔖 Pin</div>
          <div style="padding:8px 16px;border:1px solid rgba(255,255,255,0.2);border-radius:30px;font-size:14px">✕ Exit</div>
        </div>
      </div>
    </div>
  `);

  // H2: Bedtime Mode
  const bedtimeMode = phone('H2: Bedtime Mode', 'Amber text, progress, timer', `
    <div style="height:100%;background:#0a0600;color:#D97706;display:flex;flex-direction:column;padding:60px 24px 40px">
      <div style="text-align:center;margin-bottom:24px">
        <div style="font-size:14px;opacity:0.6;letter-spacing:2px">🌙 BEDTIME MODE</div>
        <div style="font-size:12px;opacity:0.3;margin-top:4px;color:#92400E">Sleep timer: 25 min</div>
      </div>
      <div style="text-align:center;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center">
        <div style="font-size:48px;margin-bottom:16px">🎧</div>
        <div style="font-size:16px;font-weight:600;margin-bottom:4px;color:#FBBF24">Gentle Night Stories</div>
        <div style="font-size:14px;opacity:0.5;color:#92400E">5:12 / 15:00</div>
        <div style="width:80%;height:3px;background:rgba(217,119,6,0.1);border-radius:2px;margin:16px 0">
          <div style="width:34%;height:100%;background:#D97706;border-radius:2px"></div>
        </div>
        <div style="display:flex;gap:32px;margin-top:16px">
          <div style="width:56px;height:56px;border-radius:50%;border:1px solid rgba(217,119,6,0.2);display:flex;align-items:center;justify-content:center;font-size:20px">⏪</div>
          <div style="width:72px;height:72px;border-radius:50%;background:rgba(217,119,6,0.2);border:1px solid #D97706;display:flex;align-items:center;justify-content:center;font-size:28px">⏸</div>
          <div style="width:56px;height:56px;border-radius:50%;border:1px solid rgba(217,119,6,0.2);display:flex;align-items:center;justify-content:center;font-size:20px">⏩</div>
        </div>
      </div>
      <div style="text-align:center;opacity:0.4">
        <div style="font-size:13px;color:#92400E">Volume gradually decreasing</div>
        <div style="padding:8px 20px;border:1px solid rgba(217,119,6,0.2);border-radius:30px;font-size:13px;display:inline-block;margin-top:8px">🌙 Timer: 25 min</div>
      </div>
    </div>
  `);

  // H4: Workout Mode
  const workoutMode = phone('H4: Workout Mode', 'XL buttons, progress, voice hints', `
    <div style="height:100%;background:#000;color:#fff;display:flex;flex-direction:column;padding:60px 16px 40px">
      <div style="text-align:center;margin-bottom:16px">
        <div style="font-size:14px;opacity:0.5;letter-spacing:2px">💪 WORKOUT MODE</div>
        <div style="font-size:12px;opacity:0.3;margin-top:4px">Auto-play • Voice hints ON</div>
      </div>
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center">
        <div style="font-size:48px;margin-bottom:12px">🗣️</div>
        <div style="font-size:20px;font-weight:700;margin-bottom:4px">Repeat After Me</div>
        <div style="font-size:14px;opacity:0.5;margin-bottom:24px">Set 3/5 • 8:30 left</div>
        <div style="font-size:22px;font-weight:600;text-align:center;line-height:1.5;margin-bottom:24px;padding:0 16px">"I've been working out consistently for three months."</div>
        <!-- Big record button -->
        <div style="width:100px;height:100px;border-radius:50%;background:#EF4444;display:flex;align-items:center;justify-content:center;font-size:40px;box-shadow:0 0 30px rgba(239,68,68,0.3);margin-bottom:16px">🎤</div>
        <div style="font-size:14px;opacity:0.4">Hold to speak</div>
      </div>
      <!-- XL Nav -->
      <div style="display:flex;gap:8px">
        <div style="flex:1;padding:14px;text-align:center;border:1px solid rgba(255,255,255,0.2);border-radius:16px;font-size:14px">⏮️ Prev</div>
        <div style="flex:1;padding:14px;text-align:center;border:1px solid rgba(255,255,255,0.2);border-radius:16px;font-size:14px">⏭️ Next</div>
        <div style="flex:1;padding:14px;text-align:center;border:1px solid rgba(255,255,255,0.2);border-radius:16px;font-size:14px">✕ Exit</div>
      </div>
    </div>
  `);

  // H6: Quick Settings Panel
  const quickSettings = phone('H6: Quick Settings', 'All mode toggles', `
    ${statusBar()}
    <div style="flex:1;opacity:0.15"></div>
    <div class="bottom-sheet-overlay">
      <div class="bottom-sheet">
        <div class="handle"></div>
        <div style="font-family:var(--font-display);font-size:16px;font-weight:700;margin-bottom:16px">🚀 Quick Modes</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div style="padding:16px;border-radius:var(--r-lg);background:var(--bg-tertiary);border:1px solid var(--border);text-align:center">
            <div style="font-size:28px;margin-bottom:4px">🚗</div><div style="font-size:13px;font-weight:600">Car Mode</div>
            <div style="font-size:11px;color:var(--text-tertiary);margin-top:2px">XL controls</div>
          </div>
          <div style="padding:16px;border-radius:var(--r-lg);background:var(--bg-tertiary);border:1px solid var(--border);text-align:center">
            <div style="font-size:28px;margin-bottom:4px">🌙</div><div style="font-size:13px;font-weight:600">Bedtime</div>
            <div style="font-size:11px;color:var(--text-tertiary);margin-top:2px">Amber display</div>
          </div>
          <div style="padding:16px;border-radius:var(--r-lg);background:var(--accent-soft);border:1px solid var(--accent);text-align:center">
            <div style="font-size:28px;margin-bottom:4px">💪</div><div style="font-size:13px;font-weight:600;color:var(--accent)">Workout</div>
            <div style="font-size:11px;color:var(--text-tertiary);margin-top:2px">Active</div>
          </div>
          <div style="padding:16px;border-radius:var(--r-lg);background:var(--bg-tertiary);border:1px solid var(--border);text-align:center">
            <div style="font-size:28px;margin-bottom:4px">📱</div><div style="font-size:13px;font-weight:600">Pocket</div>
            <div style="font-size:11px;color:var(--text-tertiary);margin-top:2px">Screen off</div>
          </div>
        </div>
      </div>
    </div>
  `);

  // H8: Mode Activation Prompt
  const modePrompt = phone('H8: Mode Activation', 'Enable Car Mode? dialog', `
    ${statusBar()}
    <div style="flex:1;opacity:0.15"></div>
    <div style="position:absolute;inset:0;background:var(--overlay);display:flex;align-items:center;justify-content:center;padding:32px">
      <div style="background:var(--bg-card);border-radius:var(--r-xl);padding:24px;width:100%;border:1px solid var(--border);box-shadow:var(--shadow-lg)">
        <div style="text-align:center;margin-bottom:8px">
          <div style="font-size:40px;margin-bottom:8px">🚗</div>
          <div style="font-family:var(--font-display);font-size:18px;font-weight:700">Bật Car Mode?</div>
        </div>
        <div style="font-size:14px;color:var(--text-secondary);text-align:center;line-height:1.5;margin-bottom:16px">Phát hiện bạn đang lái xe.<br>Chuyển sang giao diện lớn?</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <button class="cta-btn" style="margin:0;width:100%;padding:14px">🚗 Bật Car Mode</button>
          <button class="cta-btn secondary" style="margin:0;width:100%;padding:14px">Không, cảm ơn</button>
          <div style="text-align:center;font-size:12px;color:var(--text-muted);margin-top:4px">☐ Không hỏi lại</div>
        </div>
      </div>
    </div>
  `);

  return moduleSection('special', '🚗', 'Special Modes', 5,
    carMode + bedtimeMode + workoutMode + quickSettings + modePrompt);
}
