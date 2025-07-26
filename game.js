const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const keys = {};
let lantern = false;
let hasKey = false;
let diaryRead = false;
let hiding = false;
let lanternTimer = 0;
let jumpscareTimer = 0;
let gameMsg = "";

let player = { x: 50, y: 300, w: 20, h: 20, speed: 2 };
let granny = { x: 700, y: 100, speed: 1.2 };

// Items and interactables
const keyItem = { x: 700, y: 500, w: 20, h: 20 };
const lanternItem = { x: 100, y: 100, w: 20, h: 20 };
const diaryItem = { x: 400, y: 200, w: 20, h: 20 };
const bed = { x: 350, y: 400, w: 100, h: 20 };
const escapeDoor = { x: 770, y: 280, w: 20, h: 80 };

// Controls
document.addEventListener("keydown", (e) => (keys[e.key.toLowerCase()] = true));
document.addEventListener("keyup", (e) => (keys[e.key.toLowerCase()] = false));

function drawRect(obj, color) {
  ctx.fillStyle = color;
  ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
}

function collide(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function update() {
  // Movement
  if (!hiding) {
    if (keys["w"]) player.y -= player.speed;
    if (keys["s"]) player.y += player.speed;
    if (keys["a"]) player.x -= player.speed;
    if (keys["d"]) player.x += player.speed;
  }

  // Lantern timer
  if (lantern) {
    lanternTimer--;
    if (lanternTimer <= 0) {
      lantern = false;
      gameMsg = "🕯 Lantern burned out!";
    }
  }

  // Granny AI
  if (!hiding) {
    let dx = player.x - granny.x;
    let dy = player.y - granny.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      granny.x += (dx / dist) * granny.speed;
      granny.y += (dy / dist) * granny.speed;
    }
  }

  // Item pickups
  if (collide(player, keyItem)) {
    hasKey = true;
    keyItem.x = -1000;
    gameMsg = "You picked up the key!";
  }

  if (collide(player, lanternItem)) {
    lantern = true;
    lanternTimer = 900; // 15 seconds at 60fps
    lanternItem.x = -1000;
    gameMsg = "Lantern acquired!";
  }

  if (collide(player, diaryItem) && !diaryRead) {
    diaryRead = true;
    gameMsg = `"Kamla’s Note: She watches from the dark..."`;
  }

  // Hide under bed
  if (keys["h"] && collide(player, bed)) {
    hiding = !hiding;
    gameMsg = hiding ? "You are hiding..." : "You stepped out.";
  }

  // Escape
  if (hasKey && collide(player, escapeDoor)) {
    alert("🏃 You escaped Kamla’s house!");
    window.location.reload();
  }

  // Granny catches you
  if (!hiding && collide(player, granny)) {
    alert("💀 Kamla caught you!");
    window.location.reload();
  }

  // Random jumpscare
  if (!lantern && Math.random() < 0.004) {
    jumpscareTimer = 20;
    gameMsg = "👁 Kamla is near...";
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Darkness effect
  if (!lantern) {
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Player and NPCs
  drawRect(player, "white");
  drawRect(granny, "red");

  // Items
  drawRect(keyItem, "gold");
  drawRect(lanternItem, "orange");
  drawRect(diaryItem, "purple");

  // Bed and Door
  drawRect(bed, "gray");
  drawRect(escapeDoor, "green");

  // Message
  ctx.fillStyle = "white";
  ctx.font = "16px monospace";
  ctx.fillText(gameMsg, 10, 20);

  // Jumpscare flash
  if (jumpscareTimer > 0) {
    ctx.fillStyle = "rgba(255,0,0,0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    jumpscareTimer--;
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
