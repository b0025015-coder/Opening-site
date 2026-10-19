/**
 * THE GRAND SANCTUARY - Extravagant Interactive Experience
 * Pure JavaScript, Zero Dependencies, Web Audio API & HTML5 Canvas
 */

document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     1. シネマティック・オープニング
     ========================================================================== */
  requestAnimationFrame(() => {
    setTimeout(() => {
      document.body.classList.add('loaded');
      startCounterAnimation();
    }, 200);
  });

  /* ==========================================================================
     2. 黄金スターダスト背景パーティクル (Canvas)
     ========================================================================== */
  const bgCanvas = document.getElementById('bgCanvas');
  const bgCtx = bgCanvas ? bgCanvas.getContext('2d') : null;

  let width = 0;
  let height = 0;
  let particles = [];
  const PARTICLE_COUNT = 75;
  const mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };

  function resizeCanvas() {
    if (!bgCanvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    bgCanvas.width = width * dpr;
    bgCanvas.height = height * dpr;
    if (bgCtx) bgCtx.scale(dpr, dpr);
  }

  class GoldParticle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.radius = Math.random() * 2.2 + 0.6;
      this.baseAlpha = Math.random() * 0.6 + 0.2;
      this.alpha = this.baseAlpha;
      this.speedY = -(Math.random() * 0.45 + 0.15);
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.twinkleSpeed = Math.random() * 0.03 + 0.01;
      this.twinkleAngle = Math.random() * Math.PI * 2;
      // 24Kゴールド〜シャンパンゴールドのカラーパレット
      this.colorType = Math.random() > 0.4 ? 'gold' : (Math.random() > 0.5 ? 'champagne' : 'amber');
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;

      // 瞬きアニメーション
      this.twinkleAngle += this.twinkleSpeed;
      this.alpha = this.baseAlpha + Math.sin(this.twinkleAngle) * 0.25;
      if (this.alpha < 0.05) this.alpha = 0.05;

      // マウス近傍での穏やかな反発
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 120 && dist > 0) {
        const force = (120 - dist) / 120;
        this.x += (dx / dist) * force * 1.5;
        this.y += (dy / dist) * force * 1.5;
      }

      if (this.y < -10 || this.x < -10 || this.x > width + 10) {
        this.reset();
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));

      let fillColor = '#d4af37';
      if (this.colorType === 'champagne') fillColor = '#ffe79a';
      if (this.colorType === 'amber') fillColor = '#f3a83b';

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.shadowBlur = this.radius * 4;
      ctx.shadowColor = '#ffd700';
      ctx.fill();
      ctx.restore();
    }
  }

  function initParticles() {
    resizeCanvas();
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new GoldParticle());
    }
  }

  function animateBg() {
    if (bgCtx) {
      bgCtx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw(bgCtx);
      }
    }
    requestAnimationFrame(animateBg);
  }

  initParticles();
  requestAnimationFrame(animateBg);
  window.addEventListener('resize', resizeCanvas);

  /* ==========================================================================
     3. 3Dカード・パララックスチルト & 動的光沢グレア
     ========================================================================== */
  const card = document.getElementById('luxuryCard');
  const glare = document.getElementById('cardGlare');

  let currentTiltX = 0;
  let currentTiltY = 0;
  let targetTiltX = 0;
  let targetTiltY = 0;

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    if (!card) return;
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const normX = (e.clientX - centerX) / (window.innerWidth / 2);
    const normY = (e.clientY - centerY) / (window.innerHeight / 2);

    targetTiltY = Math.max(-14, Math.min(14, normX * 12));
    targetTiltX = Math.max(-14, Math.min(14, -normY * 12));

    if (glare) {
      const glareX = ((e.clientX - rect.left) / rect.width) * 100;
      const glareY = ((e.clientY - rect.top) / rect.height) * 100;
      glare.style.opacity = '1';
      glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.22) 0%, rgba(240, 192, 90, 0.08) 35%, transparent 65%)`;
    }

    // マウスカーソル追従スパークル
    if (Math.random() > 0.6) {
      createCursorSparkle(e.clientX, e.clientY);
    }
  });

  window.addEventListener('mouseleave', () => {
    targetTiltX = 0;
    targetTiltY = 0;
    if (glare) glare.style.opacity = '0';
  });

  function smoothTilt() {
    if (card) {
      currentTiltX += (targetTiltX - currentTiltX) * 0.08;
      currentTiltY += (targetTiltY - currentTiltY) * 0.08;
      card.style.transform = `rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg)`;
    }
    requestAnimationFrame(smoothTilt);
  }
  requestAnimationFrame(smoothTilt);

  /* カーソルスパークルエフェクト */
  function createCursorSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.style.position = 'fixed';
    sparkle.style.left = `${x + (Math.random() - 0.5) * 16}px`;
    sparkle.style.top = `${y + (Math.random() - 0.5) * 16}px`;
    sparkle.style.width = '4px';
    sparkle.style.height = '4px';
    sparkle.style.borderRadius = '50%';
    sparkle.style.backgroundColor = '#ffe58f';
    sparkle.style.boxShadow = '0 0 8px #ffd700';
    sparkle.style.pointerEvents = 'none';
    sparkle.style.zIndex = '9999';
    sparkle.style.transition = 'all 0.6s ease-out';
    document.body.appendChild(sparkle);

    requestAnimationFrame(() => {
      sparkle.style.transform = `translateY(${Math.random() * 20 - 10}px) scale(0)`;
      sparkle.style.opacity = '0';
    });

    setTimeout(() => {
      sparkle.remove();
    }, 600);
  }

  /* ==========================================================================
     4. Web Audio API による極上シンセサウンド合成
     ========================================================================== */
  let audioCtx = null;
  let isSoundActive = false;
  let droneGain = null;
  let droneOscillators = [];

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  /**
   * 重厚で神々しいオーケストラ風アンビエント和音 (Eb Majestic 9th)
   */
  function startMajesticDrone() {
    if (!audioCtx) return;
    stopMajesticDrone();

    droneGain = audioCtx.createGain();
    droneGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    droneGain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 3.0);

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, audioCtx.currentTime);

    // EbMaj9 和音周波数: Eb2, Bb2, G3, D4, F4
    const chordFrequencies = [77.78, 116.54, 196.00, 293.66, 349.23];

    droneOscillators = chordFrequencies.map((freq) => {
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      // 微細なデチューンで豊かな広がりを作る
      osc.detune.setValueAtTime((Math.random() - 0.5) * 8, audioCtx.currentTime);

      oscGain.gain.value = 1 / chordFrequencies.length;

      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start();
      return osc;
    });

    filter.connect(droneGain);
    droneGain.connect(audioCtx.destination);
  }

  function stopMajesticDrone() {
    if (droneGain && audioCtx) {
      droneGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.0);
      setTimeout(() => {
        droneOscillators.forEach((osc) => {
          try { osc.stop(); osc.disconnect(); } catch (e) {}
        });
        droneOscillators = [];
      }, 1000);
    }
  }

  /**
   * クリスタル・チャイム／シャンパン・ベル効果音
   */
  function playCrystalChime(frequency = 1200) {
    if (!audioCtx) return;
    const chimeGain = audioCtx.createGain();
    const osc = audioCtx.createOscillator();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    chimeGain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);

    osc.connect(chimeGain);
    chimeGain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 1.2);
  }

  // サウンドトグルボタン制御
  const soundBtn = document.getElementById('soundBtn');
  const soundLabel = document.getElementById('soundLabel');

  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      initAudioContext();
      isSoundActive = !isSoundActive;

      if (isSoundActive) {
        soundBtn.classList.add('is-active');
        if (soundLabel) soundLabel.textContent = 'SOUND: ON';
        startMajesticDrone();
        playCrystalChime(1560);
      } else {
        soundBtn.classList.remove('is-active');
        if (soundLabel) soundLabel.textContent = 'SOUND: OFF';
        stopMajesticDrone();
      }
    });
  }

  /* ==========================================================================
     5. 祝杯ゴールド紙吹雪バースト (Confetti Canvas)
     ========================================================================== */
  const confettiCanvas = document.getElementById('confettiCanvas');
  const confettiCtx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
  let confettis = [];

  function resizeConfetti() {
    if (!confettiCanvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    confettiCanvas.width = window.innerWidth * dpr;
    confettiCanvas.height = window.innerHeight * dpr;
    if (confettiCtx) confettiCtx.scale(dpr, dpr);
  }
  resizeConfetti();
  window.addEventListener('resize', resizeConfetti);

  class ConfettiPiece {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 12 + 4;
      this.vx = Math.cos(angle) * velocity;
      this.vy = Math.sin(angle) * velocity - 6; // 上向きに吹き飛ぶ
      this.size = Math.random() * 9 + 5;
      this.color = ['#ffd700', '#ffe89c', '#d4af37', '#ffffff', '#e5a034'][Math.floor(Math.random() * 5)];
      this.gravity = 0.28;
      this.drag = 0.96;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 12;
      this.flip = Math.random() * 360;
      this.flipSpeed = Math.random() * 8 + 3;
      this.alpha = 1;
      this.decay = Math.random() * 0.008 + 0.005;
      this.shape = Math.random() > 0.4 ? 'rect' : 'circle';
    }

    update() {
      this.vx *= this.drag;
      this.vy = this.vy * this.drag + this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotationSpeed;
      this.flip += this.flipSpeed;
      this.alpha -= this.decay;
    }

    draw(ctx) {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.scale(1, Math.cos((this.flip * Math.PI) / 180));

      ctx.fillStyle = this.color;
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#ffd700';

      if (this.shape === 'rect') {
        ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function fireConfettiBurst(originX, originY) {
    for (let i = 0; i < 110; i++) {
      confettis.push(new ConfettiPiece(originX, originY));
    }
  }

  function animateConfetti() {
    if (confettiCtx) {
      confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let i = confettis.length - 1; i >= 0; i--) {
        confettis[i].update();
        confettis[i].draw(confettiCtx);
        if (confettis[i].alpha <= 0 || confettis[i].y > window.innerHeight + 50) {
          confettis.splice(i, 1);
        }
      }
    }
    requestAnimationFrame(animateConfetti);
  }
  requestAnimationFrame(animateConfetti);

  const btnChampagne = document.getElementById('btnChampagne');
  if (btnChampagne) {
    btnChampagne.addEventListener('click', (e) => {
      initAudioContext();
      playCrystalChime(1760);
      setTimeout(() => playCrystalChime(2200), 120);

      const rect = btnChampagne.getBoundingClientRect();
      const burstX = rect.left + rect.width / 2;
      const burstY = rect.top + rect.height / 2;
      fireConfettiBurst(burstX, burstY);
    });
  }

  /* ==========================================================================
     6. ラグジュアリー数値のカウントアップ演出
     ========================================================================== */
  function startCounterAnimation() {
    const counterEl = document.getElementById('counterLux');
    if (!counterEl) return;

    const targetVal = 99999;
    const duration = 2200;
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // イージング関数 (Quintic Out)
      const ease = 1 - Math.pow(1 - progress, 5);
      const currentVal = Math.floor(ease * targetVal);

      counterEl.textContent = currentVal.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    }

    requestAnimationFrame(updateCounter);
  }

  /* ==========================================================================
     7. 聖域の扉（フラッシュトランジション）
     ========================================================================== */
  const btnSanctuary = document.getElementById('btnSanctuary');
  const sanctuaryFlash = document.getElementById('sanctuaryFlash');
  const btnCloseFlash = document.getElementById('btnCloseFlash');

  if (btnSanctuary && sanctuaryFlash) {
    btnSanctuary.addEventListener('click', () => {
      initAudioContext();
      playCrystalChime(880);
      setTimeout(() => playCrystalChime(1320), 180);
      sanctuaryFlash.classList.add('is-active');
    });
  }

  if (btnCloseFlash && sanctuaryFlash) {
    btnCloseFlash.addEventListener('click', () => {
      sanctuaryFlash.classList.remove('is-active');
      if (audioCtx) playCrystalChime(1046);
    });
  }
});
