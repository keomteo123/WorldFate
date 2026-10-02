(() => {
  const overlay = document.getElementById('mapOverlay');
  const ctx = overlay.getContext('2d');

  function resize() {
    overlay.width = window.innerWidth;
    overlay.height = window.innerHeight;
  }

  // 고지도 분위기: 따뜻한 비네트 + 천천히 흘러가는 구름 그림자
  function drawAtmosphere(t) {
    const w = overlay.width;
    const h = overlay.height;
    ctx.clearRect(0, 0, w, h);

    const vignette = ctx.createRadialGradient(
      w * 0.5, h * 0.5, Math.min(w, h) * 0.3,
      w * 0.5, h * 0.5, Math.max(w, h) * 0.85
    );
    vignette.addColorStop(0, 'rgba(60, 38, 14, 0)');
    vignette.addColorStop(0.6, 'rgba(40, 24, 8, 0.12)');
    vignette.addColorStop(1, 'rgba(14, 8, 2, 0.6)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 7; i++) {
      const speed = 6 + i * 1.7;
      const x = ((i * 241.7 + t * speed) % (w + 500)) - 250;
      const y = ((i * 137.3) % h) + Math.sin(t * 0.08 + i) * 30;
      const r = 150 + (i % 3) * 70;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(30, 20, 10, 0.07)');
      g.addColorStop(1, 'rgba(30, 20, 10, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
  }

  function animate(time) {
    drawAtmosphere(time * 0.001);
    requestAnimationFrame(animate);
  }

  resize();
  requestAnimationFrame(animate);
  window.addEventListener('resize', resize);
})();
