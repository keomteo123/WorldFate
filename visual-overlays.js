(() => {
  const overlay = document.getElementById('mapOverlay');
  const ctx = overlay.getContext('2d');
  const canvas = document.getElementById('canvas');

  function resize() {
    overlay.width = window.innerWidth;
    overlay.height = window.innerHeight;
  }

  function drawAtmosphere(t) {
    const w = overlay.width;
    const h = overlay.height;
    ctx.clearRect(0, 0, w, h);

    const vignette = ctx.createRadialGradient(
      w * 0.5, h * 0.42, Math.min(w, h) * 0.1,
      w * 0.5, h * 0.5, Math.max(w, h) * 0.9
    );
    vignette.addColorStop(0, 'rgba(32, 66, 80, 0.06)');
    vignette.addColorStop(0.35, 'rgba(16, 24, 30, 0.12)');
    vignette.addColorStop(1, 'rgba(4, 6, 10, 0.55)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 18; i++) {
      const x = ((i * 97.3 + t * 18) % (w + 180)) - 90;
      const y = (i * 71.7 + Math.sin(t * 0.7 + i) * 26) % (h + 80);
      ctx.beginPath();
      ctx.fillStyle = `rgba(116, 168, 196, ${0.03 + i * 0.002})`;
      ctx.arc(x, y, 60 + (i % 6) * 20, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = 'rgba(205, 183, 111, 0.12)';
    ctx.lineWidth = 1;
    for (let y = 20; y < h; y += 42) {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 9) {
        const dx = x + Math.sin((y + t * 12) * 0.03) * 10;
        if (x === 0) ctx.moveTo(dx, y);
        else ctx.lineTo(dx, y + Math.sin((x + t * 14) * 0.05) * 3);
      }
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(148, 186, 200, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const startX = (i / 8) * w;
      ctx.beginPath();
      ctx.moveTo(startX, 0);
      ctx.lineTo(startX + 120, h);
      ctx.stroke();
    }

    const glow = ctx.createLinearGradient(0, 0, w, h);
    glow.addColorStop(0, 'rgba(122, 163, 197, 0.02)');
    glow.addColorStop(0.5, 'rgba(217, 174, 94, 0.03)');
    glow.addColorStop(1, 'rgba(44, 99, 125, 0.04)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
  }

  function animate(time) {
    drawAtmosphere(time * 0.001);
    requestAnimationFrame(animate);
  }

  resize();
  requestAnimationFrame(animate);
  window.addEventListener('resize', resize);

  const pulse = document.createElement('div');
  pulse.className = 'map-pulse';
  document.getElementById('game').appendChild(pulse);

  const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  window.addEventListener('pointermove', (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
  });

  function updatePulse() {
    const ring = document.querySelector('.map-pulse');
    if (!ring) return;
    ring.style.left = `${pointer.x}px`;
    ring.style.top = `${pointer.y}px`;
  }

  setInterval(updatePulse, 50);
})();
