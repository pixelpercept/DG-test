const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("startBtn");
const exportBtn = document.getElementById("exportBtn");
const resetBtn = document.getElementById("resetBtn");

const intro = document.getElementById("intro");
const controls = document.getElementById("controls");

let points = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);

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

  requestAnimationFrame(drawNoise);
}

function drawPoints() {
  ctx.fillStyle = "red";
  points.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x * canvas.width, p.y * canvas.height, 5, 0, Math.PI * 2);
    ctx.fill();
  });
}

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();

  const x = (e.clientX - rect.left) / canvas.width;
  const y = (e.clientY - rect.top) / canvas.height;

  points.push({ x, y });
});

startBtn.addEventListener("click", () => {
  intro.style.display = "none";
  canvas.style.display = "block";
  controls.style.display = "block";

  resizeCanvas();
  drawNoise();
});

exportBtn.addEventListener("click", () => {
  const data = {
    timestamp: Date.now(),
    screen: {
      width: canvas.width,
      height: canvas.height
    },
    points: points
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "scotoma-map.json";
  a.click();
});

resetBtn.addEventListener("click", () => {
  points = [];
});