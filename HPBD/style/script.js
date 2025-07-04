const canvas = document.getElementById("matrixCanvas");
const ctx = canvas.getContext("2d");

let W, H;
function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

const characters = "HAPPYBIRTHDAYCHUCMUNGSINHNHATTUOIMOIZUIZE";
const fontSize = 20;
const columns = Math.floor(W / fontSize);
const drops = Array(columns).fill(1);

const texts = [
  "3",
  "2",
  "1",
  "🎂",
  "15.10.2025", //Day of birth
  "HAPPY BIRTHDAY", 
  "Gia Bảo" //Your Name
];

 setTimeout(() => {
   const img = document.getElementById("birthdayImage");
   img.style.display = "block";

   const info = document.createElement("div");
   info.innerHTML = `
     <div style="
       position: fixed;
       bottom: 30px;
       left: 50%;
       transform: translateX(-50%);
       text-align: center;
       color: white;
       font-size: 50px;
       font-family: 'monospace';
       z-index: 15;
     ">
       <div><strong>Gia Bảo</strong></div>
       <div>🎂 03/07</div>
       <div style="font-size: 40px; color: #FF69B4; margin-top: 10px;">🎉 Happy Birthday 🎉</div>
     </div>
   `;
   document.body.appendChild(info);
   const wish = document.createElement("div");
   wish.innerHTML = `
  <div style="
    position: fixed;
    top: 20%;
    left: 70%;
    transform: translateY(-50%);
    width: 260px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid #FFD700;
    border-radius: 12px;
    color: #00FFFF;
    font-size: 18px;
    font-family: 'Courier New', monospace;
    text-align: center;
    line-height: 1.5;
    z-index: 15;
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
  ">
    <div style="font-weight: bold; font-size: 20px; margin-bottom: 10px;">💌 Lời chúc</div>
    <div>
      Chúc Gia Bảo:<br>
      🌟 Luôn mạnh khỏe<br>
      😊 Tràn ngập tiếng cười<br>
      💖 Hạnh phúc mỗi ngày!
    </div>
  </div>
`;
    document.body.appendChild(wish);
    const poem = document.createElement("div");
    poem.innerHTML = `
  <div style="
    position: fixed;
    top: 30%;
    left: 15%;
    transform: translateY(-50%);
    width: 280px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.08);
    border: 2px solid #FF69B4;
    border-radius: 12px;
    color: #fff;
    font-size: 16px;
    font-family: 'Courier New', monospace;
    text-align: left;
    line-height: 1.6;
    z-index: 15;
    box-shadow: 0 0 15px rgba(255, 105, 180, 0.3);
  ">
    <div style="font-weight: bold; font-size: 18px; margin-bottom: 10px; text-align: center;">
      🌸 Chúc Tuổi Mới 🌸
    </div>
    <div>
      Thêm một tuổi – thêm nụ cười,<br>
      Gói tròn hạnh phúc giữa đời rong chơi.<br>
      Gió đưa nhẹ những ước mơ xa,<br>
      Mỗi ngày tỉnh giấc – nắng chan hòa.<br><br>
      Tuổi mới đến – đừng ngại ngần,<br>
      Trái tim rực rỡ, vẫn trong ngần.<br>
      Điều hay chưa đến – rồi sẽ đến,<br>
      Chúc bạn tuổi mới… thật an nhiên!
    </div>
  </div>
`;
    document.body.appendChild(poem);
 }, texts.length * 3000); // Mỗi dòng 3 giây → delay sau toàn bộ

 
const BASE_DISPLAY_TIME = 1000;
const EXPLOSION_TIME = 100;
const CHAR_APPEAR_INTERVAL = 100;

let currentDisplayTime = BASE_DISPLAY_TIME;

const offCanvas = document.createElement('canvas');
const offCtx = offCanvas.getContext('2d');

let targetPoints = [];
let dots = [];

let currentTextIndex = 0;
let currentCharIndex = 0;
let lastChangeTime = Date.now();
let lastCharTime = Date.now();

let state = "forming";
let explosionStartTime = 0;

let hue = 0; 

function getTextPixels(text) {
  offCanvas.width = W;
  offCanvas.height = H;
  offCtx.clearRect(0, 0, W, H);

  let fontSizeOverlay = 500;
  offCtx.font = `bold ${fontSizeOverlay}px Arial`;
  while (offCtx.measureText(text).width > W * 0.9) {
    fontSizeOverlay -= 2;
    offCtx.font = `bold ${fontSizeOverlay}px Arial`;
  }
  offCtx.fillStyle = 'white';
  offCtx.textAlign = 'center';
  offCtx.textBaseline = 'middle';
  offCtx.fillText(text, W / 2, H / 2);

  const imageData = offCtx.getImageData(0, 0, W, H);
  const pixels = [];
  const gap = 6;
  for (let y = 0; y < H; y += gap) {
    for (let x = 0; x < W; x += gap) {
      const idx = (y * W + x) * 4;
      const r = imageData.data[idx];
      const g = imageData.data[idx + 1];
      const b = imageData.data[idx + 2];
      const a = imageData.data[idx + 3];
      if (r + g + b > 200 && a > 128) {
        pixels.push({x, y});
      }
    }
  }
  return pixels;
}

class Dot {
  constructor(targetX, targetY) {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.targetX = targetX;
    this.targetY = targetY;
    this.vx = 0;
    this.vy = 0;
    this.size = 3;
  }
  update() {
    if (state === "forming") {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const easing = 0.1;
      this.vx = (this.vx + dx * easing) * 0.75;
      this.vy = (this.vy + dy * easing) * 0.75;
      this.x += this.vx;
      this.y += this.vy;
    } else if (state === "exploding") {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 1.05;
      this.vy *= 1.05;
    }
  }
  draw(ctx) {
    ctx.fillStyle = `hsl(${(hue + this.x / W * 100) % 360}, 100%, 65%)`;
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}
function initDots(text) {
  let partialText = text.substring(0, currentCharIndex);
  if (partialText.length === 0) partialText = " ";
  targetPoints = getTextPixels(partialText);
  if (dots.length === 0) {
    dots = targetPoints.map(p => new Dot(p.x, p.y));
  } else {
    for (let i = 0; i < dots.length; i++) {
      if (i < targetPoints.length) {
        dots[i].targetX = targetPoints[i].x;
        dots[i].targetY = targetPoints[i].y;
      } else {
        dots[i].targetX = Math.random() * W;
        dots[i].targetY = H + 100 + Math.random() * 200;
      }
    }
    if (targetPoints.length > dots.length) {
      const diff = targetPoints.length - dots.length;
      for (let j = 0; j < diff; j++) {
        const p = targetPoints[dots.length + j];
        dots.push(new Dot(p.x, p.y));
      }
    }
  }
  state = "forming";
}

function explodeDots() {
  for (const dot of dots) {
    dot.vx = (Math.random() - 0.5) * 10;
    dot.vy = (Math.random() - 0.5) * 10;
  }
}

function drawMatrixRain() {
  hue = (hue + 1) % 360;

  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.fillRect(0, 0, W, H);

  ctx.font = fontSize + "px monospace";

  for (let i = 0; i < drops.length; i++) {
    const textChar = characters[Math.floor(Math.random() * characters.length)];
    ctx.fillStyle = `hsl(${(hue + i * 10) % 360}, 100%, 65%)`;
    ctx.fillText(textChar, i * fontSize, drops[i] * fontSize);

    if (drops[i] * fontSize > H || Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i]++;
  }

  for (const dot of dots) {
    dot.update();
    dot.draw(ctx);
  }

  const now = Date.now();

  if (state === "forming") {
    if (currentCharIndex < texts[currentTextIndex].length) {
      if (now - lastCharTime > CHAR_APPEAR_INTERVAL) {
        currentCharIndex++;
        initDots(texts[currentTextIndex]);
        lastCharTime = now;
      }
    } else {
      if (now - lastChangeTime > currentDisplayTime) {
        state = "exploding";
        explosionStartTime = now;
        explodeDots();
      }
    }
  } else if (state === "exploding") {
    if (now - explosionStartTime > EXPLOSION_TIME) {
      currentTextIndex++;
      if (currentTextIndex >= texts.length) return;

      currentCharIndex = 0;
      const nextText = texts[currentTextIndex];
      currentDisplayTime = BASE_DISPLAY_TIME + (nextText.length > 5 ? 3000 : 0);
      initDots(nextText);
      lastChangeTime = now;
      lastCharTime = now;
      state = "forming";
    }
  }
}
function toggleMusic() {
  const audio = document.getElementById("bgm");
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
}
currentDisplayTime = BASE_DISPLAY_TIME + (texts[0].length > 4 ? 2000 : 0);
initDots(texts[currentTextIndex]);
lastChangeTime = Date.now();
lastCharTime = Date.now();

setInterval(drawMatrixRain, 50);
