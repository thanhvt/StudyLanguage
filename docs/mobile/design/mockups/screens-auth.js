// ============================================
// Module: Auth & Onboarding (3 screens)
// ============================================

function renderAuth() {
  // A1: Splash Screen
  const splashScreen = phone('A1: Splash Screen', 'Loading & Transition', `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;background:var(--bg-primary)">
      <div style="font-size:72px;margin-bottom:24px;animation:pulse-record 2s ease-in-out infinite">📚</div>
      <div style="font-family:var(--font-display);font-size:32px;font-weight:800;color:var(--text-primary);letter-spacing:-0.5px">StudyLanguage</div>
      <div style="font-size:14px;color:var(--text-tertiary);margin-top:8px">Master English, Your Way</div>
      <div style="margin-top:48px;width:120px">
        <div class="progress-bar"><div class="progress-fill" style="width:65%"></div></div>
      </div>
      <div style="font-size:11px;color:var(--text-muted);margin-top:12px">Đang khởi tạo...</div>
      <div style="position:absolute;bottom:48px;font-size:12px;color:var(--text-muted)">v1.0.0</div>
    </div>
  `);

  // A2: Onboarding
  const onboardingScreen = phone('A2: Onboarding', 'Slide 1/3 - Listening', `
    ${statusBar()}
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;padding:40px 24px 24px">
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center">
        <div style="width:200px;height:200px;border-radius:50%;background:var(--accent-soft);display:flex;align-items:center;justify-content:center;font-size:80px;margin-bottom:32px;border:2px solid var(--accent);box-shadow:0 0 40px var(--accent-glow)">🎧</div>
        <div style="font-family:var(--font-display);font-size:28px;font-weight:800;text-align:center;margin-bottom:12px">Luyện Nghe<br>Mọi Lúc Mọi Nơi</div>
        <div style="font-size:15px;color:var(--text-secondary);text-align:center;line-height:1.6;max-width:300px">Nghe podcast AI được tạo riêng cho bạn, với nhiều chủ đề hấp dẫn và tốc độ tùy chỉnh.</div>
      </div>
      <!-- Dots -->
      <div style="display:flex;gap:8px;margin:24px 0">
        <div style="width:24px;height:6px;border-radius:3px;background:var(--accent)"></div>
        <div style="width:6px;height:6px;border-radius:3px;background:var(--text-muted)"></div>
        <div style="width:6px;height:6px;border-radius:3px;background:var(--text-muted)"></div>
      </div>
      <button class="cta-btn" style="width:100%">Tiếp theo →</button>
      <div style="font-size:13px;color:var(--text-tertiary);margin-top:12px;cursor:pointer">Bỏ qua</div>
    </div>
  `);

  // A3: Auth/Login Screen
  const loginScreen = phone('A3: Auth / Login', 'Default + OAuth', `
    ${statusBar()}
    <div style="flex:1;display:flex;flex-direction:column;padding:24px">
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center">
        <div style="font-size:56px;margin-bottom:16px">📚</div>
        <div style="font-family:var(--font-display);font-size:28px;font-weight:800;margin-bottom:4px">StudyLanguage</div>
        <div style="font-size:14px;color:var(--text-secondary);margin-bottom:40px">Đăng nhập để bắt đầu</div>
        
        <!-- Google OAuth Button -->
        <button style="display:flex;align-items:center;gap:12px;width:100%;padding:16px 20px;border-radius:var(--r-lg);background:var(--bg-card);border:1px solid var(--border-strong);font-size:16px;font-weight:600;color:var(--text-primary);cursor:pointer;font-family:var(--font-sans);justify-content:center">
          <span style="font-size:20px">🔵</span>
          Đăng nhập bằng Google
        </button>
        
        <!-- Apple Sign In -->
        <button style="display:flex;align-items:center;gap:12px;width:100%;padding:16px 20px;border-radius:var(--r-lg);background:var(--text-primary);color:var(--bg-primary);border:none;font-size:16px;font-weight:600;cursor:pointer;font-family:var(--font-sans);margin-top:12px;justify-content:center">
           Đăng nhập bằng Apple
        </button>
      </div>
      
      <!-- Footer -->
      <div style="text-align:center;padding:16px 0">
        <div style="font-size:12px;color:var(--text-muted);line-height:1.6">
          Bằng việc đăng nhập, bạn đồng ý với<br>
          <span style="color:var(--accent);text-decoration:underline">Điều khoản sử dụng</span> và 
          <span style="color:var(--accent);text-decoration:underline">Chính sách bảo mật</span>
        </div>
      </div>
    </div>
  `);

  return moduleSection('auth', '🔐', 'Auth & Onboarding', 3, splashScreen + onboardingScreen + loginScreen);
}
