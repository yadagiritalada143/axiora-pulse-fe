import { useEffect, useRef } from 'react';

interface StringItem {
  angle: number;
  baseAngle: number;
  length: number;
  baseLength: number;
  width: number;
  dotR: number;
  hasDot: boolean;
  colorT: number;
  wob: number;
  wobSpeed: number;
  dispAngle: number;
  dispAngleVel: number;
  dispLen: number;
  dispLenVel: number;
  bend: number;
  bendVel: number;
  _angleState?: { value: number; vel: number };
  _lenState?: { value: number; vel: number };
  _bendState?: { value: number; vel: number };
}

export function BurstSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    const hint = hintRef.current;
    if (!canvas || !section) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let DPR = 1;

    function resize() {
      if (!section || !canvas || !ctx) return;
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      const rect = section.getBoundingClientRect();
      W = rect.width || window.innerWidth;
      H = rect.height || 220;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function origin() {
      return { x: W * 0.5, y: H * 1.02 };
    }

    function rand(a: number, b: number) {
      return a + Math.random() * (b - a);
    }

    function springStep(
      state: { value: number; vel: number },
      target: number,
      dt: number,
      stiffness: number,
      damping: number,
    ) {
      const accel = (target - state.value) * stiffness - state.vel * damping;
      state.vel += accel * dt;
      state.value += state.vel * dt;
    }

    const PAL = {
      near: '#c25200',
      mid: '#f08a3a',
      far: '#ffc482',
      hot: '#ffd9a0',
    };

    let strings: StringItem[] = [];
    let sceneTiltState = 0;

    function buildStrings() {
      strings = [];
      const count = Math.round(rand(220, 260));
      const spread = Math.PI * 0.62;
      for (let i = 0; i < count; i++) {
        const t = (i + rand(-0.4, 0.4)) / count;
        const angle = -Math.PI / 2 + (t - 0.5) * spread * 2;
        const length =
          rand(H * 0.28, H * 0.78) * (0.85 + 0.3 * Math.abs(Math.sin((t - 0.5) * Math.PI)));
        strings.push({
          angle,
          baseAngle: angle,
          length,
          baseLength: length,
          width: rand(1.1, 2.6),
          dotR: rand(1.6, 4.2),
          hasDot: Math.random() > 0.12,
          colorT: rand(0, 1),
          wob: rand(0, Math.PI * 2),
          wobSpeed: rand(0.15, 0.4),
          dispAngle: 0,
          dispAngleVel: 0,
          dispLen: 0,
          dispLenVel: 0,
          bend: 0,
          bendVel: 0,
        });
      }
    }

    resize();
    buildStrings();

    const handleResize = () => {
      resize();
      buildStrings();
    };
    window.addEventListener('resize', handleResize);

    const mouse = { x: -9999, y: -9999, active: false, vx: 0, vy: 0 };
    const rawTarget = { x: -9999, y: -9999, active: false };

    function handlePointer(clientX: number, clientY: number) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      rawTarget.x = clientX - rect.left;
      rawTarget.y = clientY - rect.top;
      rawTarget.active = true;
      mouse.active = true;
      if (hint) hint.style.opacity = '0';
    }

    const onMouseMove = (e: MouseEvent) => {
      handlePointer(e.clientX, e.clientY);
    };

    const onMouseLeave = () => {
      mouse.active = false;
      rawTarget.active = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      handlePointer(t.clientX, t.clientY);
    };

    const onTouchEnd = () => {
      mouse.active = false;
      rawTarget.active = false;
    };

    section.addEventListener('mousemove', onMouseMove);
    section.addEventListener('mouseleave', onMouseLeave);
    section.addEventListener('touchmove', onTouchMove, { passive: true });
    section.addEventListener('touchend', onTouchEnd);

    const hintTimeout = setTimeout(() => {
      if (hint && !mouse.active) hint.style.opacity = '0.45';
    }, 100);

    let t0 = performance.now();
    let isVisible = true;
    let animationId: number;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 },
    );
    observer.observe(section);

    function frame(now: number) {
      if (!isVisible || !ctx) {
        t0 = now;
        animationId = requestAnimationFrame(frame);
        return;
      }

      let dt = (now - t0) / 1000;
      if (!isFinite(dt) || dt < 0) dt = 0;
      dt = Math.min(dt, 0.033);
      t0 = now;
      const time = now / 1000;

      const smooth = (tau: number) => 1 - Math.exp(-dt / tau);

      const mouseEase = smooth(0.1);
      if (rawTarget.active) {
        const prevX = mouse.x;
        const prevY = mouse.y;
        mouse.x += (rawTarget.x - mouse.x) * mouseEase;
        mouse.y += (rawTarget.y - mouse.y) * mouseEase;
        mouse.vx = (mouse.x - prevX) / Math.max(dt, 0.001);
        mouse.vy = (mouse.y - prevY) / Math.max(dt, 0.001);
      }

      ctx.clearRect(0, 0, W, H);
      const pal = PAL;
      const org = origin();

      let sceneTilt = 0;
      if (mouse.active) {
        const nx = (mouse.x - org.x) / W;
        sceneTilt = nx * 0.05;
      }
      sceneTiltState += (sceneTilt - sceneTiltState) * smooth(0.6);

      for (const s of strings) {
        const idle = Math.sin(time * s.wobSpeed + s.wob) * 0.01;

        const angle = s.baseAngle + idle + s.dispAngle + sceneTiltState;
        const length = s.baseLength + s.dispLen;

        const tipX = org.x + Math.cos(angle) * length;
        const tipY = org.y + Math.sin(angle) * length;

        let targetAngleDisp = 0;
        let targetLenDisp = 0;
        let targetBend = 0;

        if (mouse.active) {
          const dx = tipX - org.x;
          const dy = tipY - org.y;
          const len2 = dx * dx + dy * dy;
          const mx = mouse.x - org.x;
          const my = mouse.y - org.y;
          let proj = len2 > 0 ? (mx * dx + my * dy) / len2 : 0;
          proj = Math.max(0, Math.min(1, proj));
          const closeX = org.x + dx * proj;
          const closeY = org.y + dy * proj;
          const ddx = mouse.x - closeX;
          const ddy = mouse.y - closeY;
          const dist = Math.sqrt(ddx * ddx + ddy * ddy);

          const influenceRadius = 160;
          if (dist < influenceRadius) {
            const p = 1 - dist / influenceRadius;
            const falloff = p * p * (3 - 2 * p);

            const pointAngle = Math.atan2(my, mx);
            let angDiff = angle - pointAngle;
            while (angDiff > Math.PI) angDiff -= Math.PI * 2;
            while (angDiff < -Math.PI) angDiff += Math.PI * 2;
            const angNorm = Math.max(-1, Math.min(1, angDiff / 0.5));

            targetAngleDisp = angNorm * falloff * 0.26;

            const speed = Math.min(Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy), 800);
            targetLenDisp = falloff * (34 + speed * 0.045);
            targetBend = -angNorm * falloff * 40;
          }
        }

        springStep(
          s._angleState ?? (s._angleState = { value: s.dispAngle, vel: s.dispAngleVel }),
          targetAngleDisp,
          dt,
          34,
          13,
        );
        springStep(
          s._lenState ?? (s._lenState = { value: s.dispLen, vel: s.dispLenVel }),
          targetLenDisp,
          dt,
          26,
          11,
        );
        springStep(
          s._bendState ?? (s._bendState = { value: s.bend, vel: s.bendVel }),
          targetBend,
          dt,
          30,
          12,
        );
        s.dispAngle = s._angleState.value;
        s.dispLen = s._lenState.value;
        s.bend = s._bendState.value;

        const renderAngle = s.baseAngle + idle + s.dispAngle + sceneTiltState;
        const renderLength = s.baseLength + s.dispLen;
        const fx = org.x + Math.cos(renderAngle) * renderLength;
        const fy = org.y + Math.sin(renderAngle) * renderLength;

        const proximity = Math.max(
          Math.min(1, Math.abs(s.dispAngle) / 0.26),
          Math.min(1, Math.abs(s.dispLen) / 34),
        );

        const stretch = Math.max(0, s.dispLen) / Math.max(1, s.baseLength);
        const widthScale = 1 / Math.sqrt(1 + stretch * 3.5);

        const perpX = -Math.sin(renderAngle);
        const perpY = Math.cos(renderAngle);
        const midX = (org.x + fx) / 2 + perpX * s.bend;
        const midY = (org.y + fy) / 2 + perpY * s.bend;

        const grad = ctx.createLinearGradient(org.x, org.y, fx, fy);
        grad.addColorStop(0, pal.near);
        grad.addColorStop(0.55, pal.mid);
        grad.addColorStop(1, pal.far);

        ctx.save();
        ctx.lineCap = 'round';
        ctx.strokeStyle = grad;
        ctx.lineWidth = Math.max(0.6, s.width * widthScale);
        ctx.globalAlpha = 0.62 + proximity * 0.18;
        ctx.beginPath();
        ctx.moveTo(org.x, org.y);
        ctx.quadraticCurveTo(midX, midY, fx, fy);
        ctx.stroke();
        ctx.restore();

        if (s.hasDot) {
          ctx.save();
          ctx.globalAlpha = 0.85;
          ctx.fillStyle = pal.mid;
          ctx.beginPath();
          ctx.arc(fx, fy, Math.max(0.8, s.dotR * widthScale), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      animationId = requestAnimationFrame(frame);
    }

    animationId = requestAnimationFrame(frame);

    return () => {
      clearTimeout(hintTimeout);
      cancelAnimationFrame(animationId);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      section.removeEventListener('mousemove', onMouseMove);
      section.removeEventListener('mouseleave', onMouseLeave);
      section.removeEventListener('touchmove', onTouchMove);
      section.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return (
    <section ref={sectionRef} className="burst-interactive-section" id="burst-section">
      <canvas ref={canvasRef} id="burst-canvas" className="burst-canvas" />
      <div ref={hintRef} className="burst-hint" id="burst-hint">
        move your cursor through the strings
      </div>

      <div
        className="footer-bottom"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: 'none',
          zIndex: 10,
        }}
      >
        <span className="footer-copy">&copy; 2026. ALL RIGHT RESERVED</span>
      </div>
    </section>
  );
}
