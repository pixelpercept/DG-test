const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("startBtn");
const exportBtn = document.getElementById("exportBtn");
const resetBtn = document.getElementById("resetBtn");

const intro = document.getElementById("intro");
const controls = document.getElementById("controls");

let points = [];
let mouse = { x: 0, y: 0 };

// Resize canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);

// Noise generator
function drawNoise() {
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

  drawPoints();
  drawFixationCross();
  drawCursor();

  requestAnimationFrame(drawNoise);
}

// Draw fixation cross (center)
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

// Draw user points
function drawPoints() {
  ctx.fillStyle = "red";
  points.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x * canvas.width, p.y * canvas.height, 5, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Custom cursor
function drawCursor() {
  ctx.strokeStyle = "lime";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 8, 0, Math.PI * 2);
  ctx.stroke();
}

// Mouse move tracking
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

// Click to add point
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();

  const x = (e.clientX - rect.left) / canvas.width;
  const y = (e.clientY - rect.top) / canvas.height;

  points.push({ x, y });
});

// Start test
startBtn.addEventListener("click", () => {
  intro.style.display = "none";
  canvas.style.display = "block";
  controls.style.display = "block";

  resizeCanvas();
  drawNoise();
});

// Export data
exportBtn.addEventListener("click", () => {
const data = {
  app: "scotoma-mapper",
  version: "1.0",
  timestamp: new Date().toISOString(),

  test: {
    eye: "unknown", // futuro: dx/sx selezionabile
    distance_cm: null, // opzionale (input utente)
    screen: {
      width: canvas.width,
      height: canvas.height
    }
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
});

// Reset points
resetBtn.addEventListener("click", () => {
  points = [];
});
