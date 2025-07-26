// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Camera and Renderer
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
const light = new THREE.PointLight(0xffffff, 1, 50);
light.position.set(0, 3, 0);
scene.add(light);

const ambient = new THREE.AmbientLight(0x404040);
scene.add(ambient);

// Controls (WASD + Mouse)
const controls = new THREE.PointerLockControls(camera, document.body);
document.addEventListener("click", () => controls.lock());
scene.add(controls.getObject());

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const keys = {};

document.addEventListener("keydown", (e) => keys[e.code] = true);
document.addEventListener("keyup", (e) => keys[e.code] = false);

// Floor
const floorGeometry = new THREE.PlaneGeometry(100, 100);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Walls (a simple room)
function createWall(x, z, w, h, d) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshStandardMaterial({ color: 0x444444 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, h / 2, z);
  scene.add(mesh);
}

createWall(0, -10, 20, 4, 1);
createWall(0, 10, 20, 4, 1);
createWall(-10, 0, 1, 4, 20);
createWall(10, 0, 1, 4, 20);

// Kamla (enemy cube)
const kamla = new THREE.Mesh(
  new THREE.BoxGeometry(1, 2, 1),
  new THREE.MeshStandardMaterial({ color: 0xaa0000 })
);
kamla.position.set(5, 1, 5);
scene.add(kamla);

// Key
const key = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.2, 0.2),
  new THREE.MeshStandardMaterial({ color: 0xffff00 })
);
key.position.set(-5, 0.2, -5);
scene.add(key);

let hasKey = false;

// Door (escape)
const door = new THREE.Mesh(
  new THREE.BoxGeometry(1, 3, 0.2),
  new THREE.MeshStandardMaterial({ color: 0x00ff00 })
);
door.position.set(-10, 1.5, 0);
scene.add(door);

// Game Loop
function animate() {
  requestAnimationFrame(animate);

  // Player movement
  direction.z = Number(keys["KeyW"]) - Number(keys["KeyS"]);
  direction.x = Number(keys["KeyD"]) - Number(keys["KeyA"]);
  direction.normalize();

  velocity.x = direction.x * 0.1;
  velocity.z = direction.z * 0.1;

  controls.moveRight(velocity.x);
  controls.moveForward(velocity.z);

  // Kamla follows player
  const playerPos = controls.getObject().position;
  const dx = playerPos.x - kamla.position.x;
  const dz = playerPos.z - kamla.position.z;
  const dist = Math.sqrt(dx * dx + dz * dz);

  if (dist > 0.5) {
    kamla.position.x += (dx / dist) * 0.02;
    kamla.position.z += (dz / dist) * 0.02;
  } else {
    alert("💀 Kamla caught you!");
    window.location.reload();
  }

  // Key pickup
  if (!hasKey && key.position.distanceTo(playerPos) < 1) {
    hasKey = true;
    scene.remove(key);
    document.getElementById("info").innerText = "You picked up a key!";
  }

  // Door escape
  if (hasKey && door.position.distanceTo(playerPos) < 1.5) {
    alert("🏃 You escaped Kamla's house!");
    window.location.reload();
  }

  renderer.render(scene, camera);
}
animate();
