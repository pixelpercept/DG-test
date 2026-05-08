document.addEventListener("DOMContentLoaded", () => {

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const startBtn = document.getElementById("startBtn");
  const exportBtn = document.getElementById("exportBtn");
  const resetBtn = document.getElementById("resetBtn");
  const exitBtn = document.getElementById("exitBtn");

  const intro = document.getElementById("intro");
  const controls = document.getElementById("controls");
  const info = document.getElementById("info");
  const donate = document.getElementById("donate");

  const eyeSelect = document.getElementById("eyeSelect");
  const distanceInput = document.getElementById("distanceInput");

  let points = [];
  let mouse = { x: 0, y: 0 };
  let running = false;

  // ===== CANVAS SIZE =====
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", resizeCanvas);

  // ===== NOISE LOOP =====
  function drawNoise() {
    if (!running) return;

    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const buffer = imageData.data;

    for (let i = 0; i < buffer.length; i += 4) {
      const val = Math.random() * 255;
      buffer[i] = val;
      buffer[i + 1] = val;
      buffer[i + 2] = val;
      buffer[i + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);

    drawHeatmap();
    drawFixationCross();
    drawCursor();

    requestAnimationFrame(drawNoise);
  }

  // ===== HEATMAP =====
  function drawHeatmap() {
    ctx.globalCompositeOperation = "lighter";

    points.forEach(p => {
      const x = p.x * canvas.width;
      const y = p.y * canvas.height;

      const radius = 20;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

      gradient.addColorStop(0, "rgba(255,0,0,0.7)");
      gradient.addColorStop(0.3, "rgba(255,0,0,0.4)");
      gradient.addColorStop(1, "rgba(255,0,0,0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalCompositeOperation = "source-over";
  }

  // ===== FIXATION CROSS =====
  function drawFixationCross() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(cx - 10, cy);
    ctx.lineTo(cx + 10, cy);
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx, cy + 10);
    ctx.stroke();
  }

  // ===== CURSOR =====
  function drawCursor() {
    ctx.strokeStyle = "lime";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 8, 0, Math.PI * 2);
    ctx.stroke();
  }

  // ===== MOUSE =====
  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();

    const x = (e.clientX - rect.left) / canvas.width;
    const y = (e.clientY - rect.top) / canvas.height;

    points.push({ x, y });
  });

  // ===== START TEST =====
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      intro.style.display = "none";
      canvas.style.display = "block";
      controls.style.display = "block";
      info.style.display = "block";

      // nasconde donate
      if (donate) donate.classList.remove("show");

      resizeCanvas();
      running = true;
      drawNoise();
    });
  }

  // ===== EXPORT =====
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {

      // JSON
      const data = {
        timestamp: new Date().toISOString(),
        test: {
          eye: eyeSelect ? eyeSelect.value : "unknown",
          distance_cm: distanceInput ? distanceInput.value : null
        },
        points: points
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json"
      });

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "scotoma-map.json";
      a.click();

      // PNG
      exportPNG();

      // 👇 MOSTRA POPUP DONATE
      if (donate) donate.classList.add("show");
    });
  }

  // ===== EXPORT PNG =====
  function exportPNG() {
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");

    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    tempCtx.fillStyle = "black";
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    points.forEach(p => {
      const x = p.x * tempCanvas.width;
      const y = p.y * tempCanvas.height;

      const radius = 20;
      const gradient = tempCtx.createRadialGradient(x, y, 0, x, y, radius);

      gradient.addColorStop(0, "rgba(255,0,0,0.7)");
      gradient.addColorStop(1, "rgba(255,0,0,0)");

      tempCtx.fillStyle = gradient;
      tempCtx.beginPath();
      tempCtx.arc(x, y, radius, 0, Math.PI * 2);
      tempCtx.fill();
    });

    const link = document.createElement("a");
    link.download = "scotoma-map.png";
    link.href = tempCanvas.toDataURL("image/png");
    link.click();
  }

  // ===== RESET =====
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      points = [];
    });
  }

  // ===== EXIT =====
  if (exitBtn) {
    exitBtn.addEventListener("click", () => {
      running = false;

      canvas.style.display = "none";
      controls.style.display = "none";
      info.style.display = "none";

      intro.style.display = "block";

      // nasconde donate
      if (donate) donate.classList.remove("show");
    });
  }

});
