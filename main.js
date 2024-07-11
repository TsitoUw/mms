import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let scene, camera, renderer;
let mouse; // Declare mouse variable globally

const otherMaze = `
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                               |
+ +-+-+-+-+-+-+-+-+-+-+-+-+-+-+ +
| |                             |
+ + +-+-+-+-+-+-+-+-+-+-+-+-+ + +
| |       |   |       |     | | |
+ + +-+-+ + + + +-+-+ + +-+ + + +
| | |     | |   |   | |   | | | |
+ + + + +-+ +-+-+ + + +-+ + + + +
| | | | |   | |   | | |   | | | |
+ + + +-+ +-+ + +-+ + + +-+ + + +
| | | |   | |     | | |   | | | |
+ + + + +-+ + +-+ + + +-+ + + + +
| | | | | |       |   |   | | | |
+ + + + + + +-+-+-+-+-+-+ + + + +
| | |   |     |   |       | | | |
+ + +-+-+ +-+ + + + +-+ + + + + +
| | |         |   |     | | | | |
+ + + +-+-+-+-+-+ +-+ + +-+ + + +
| | |   |         |   | |   | | |
+ + +-+ + +-+ +-+-+ + +-+ +-+ + +
| | |   |   | |     | |   | | | |
+ + + +-+ + +-+-+ + +-+ +-+ + + +
| | |   | | | |   | |   |   | | |
+ + +-+ + +-+ + +-+-+ +-+ + + + +
| |   |   |   |   |   |   | | | |
+ +-+ + +-+ + +-+ + +-+ +-+ + + +
|   | |     |     |     |   | | |
+ + + +-+-+-+-+-+-+-+-+-+-+ + + +
| | |                         | |
+ + +-+-+-+-+-+-+-+-+-+-+-+-+-+ +
| |                             |
.-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
`;

function mazeToArray(input) {
  return input
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => line.split("").map((char) => (char === " " ? 0 : 1)));
}

// const maze = mazeToArray(convertFromTheOtherFormat(otherMaze));
const maze = mazeToArray(otherMaze);

function createMaze() {
  const wallGeometry = new THREE.BoxGeometry(1, 1, 1);
  const wallMaterial = new THREE.MeshPhongMaterial({ color: 0x8888ff });
  const floorGeometry = new THREE.PlaneGeometry(maze[0].length, maze.length);
  const floorMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });

  // Create floor
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(maze[0].length / 2 - 0.5, -0.5, maze.length / 2 - 0.5);
  scene.add(floor);

  // Create walls
  for (let i = 0; i < maze.length; i++) {
    for (let j = 0; j < maze[i].length; j++) {
      if (maze[i][j] === 1) {
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(j, 0, i);
        scene.add(wall);
      }
    }
  }
}

function createMouse() {
  const mouseMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
  const mouse = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 0.5),
    mouseMaterial
  );
  mouse.position.set(1, 0.25, 1);
  scene.add(mouse);
  return mouse;
}

function dfsMazeSolver(maze, start, end) {
  const stack = [start];
  const visited = new Set();
  const path = [];

  while (stack.length > 0) {
    const [x, y] = stack.pop();

    if (x === end[0] && y === end[1]) {
      path.push([x, y]);
      return path.reverse(); // return the path in correct order
    }

    if (visited.has(`${x},${y}`)) continue;
    visited.add(`${x},${y}`);
    path.push([x, y]);

    for (const [dx, dy] of [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ]) {
      const nx = x + dx,
        ny = y + dy;
      if (maze[nx] && maze[nx][ny] === 0) {
        stack.push([nx, ny]);
      }
    }
  }

  return false;
}

function animateMouse(path) {
  let index = 0;

  function move() {
    if (index >= path.length) return;

    const [x, y] = path[index];
    mouse.position.set(x, 0.25, y);
    index++;
    setTimeout(move, 500); // move every 500ms
  }

  move();
}

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 40, 20);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Add OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement);

  // Add basic light
  const ambientLight = new THREE.AmbientLight(0x909090);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(10, 10, 10).normalize();
  scene.add(directionalLight);

  // Create the maze and mouse
  createMaze();
  mouse = createMouse();

  // Start the solving process

  // const start = [1, 1];
  // const end = [3, 4];
  // const path = dfsMazeSolver(maze, start, end);
  // if (path) {
  //   animateMouse(path);
  // }

  const path = [
    { x: 1, y: 1 },
    { x: 1, y: 2 },
    { x: 1, y: 3 },
    { x: 2, y: 3 },
    { x: 3, y: 3 },
  ];

  const pathVectors = path.map(
    (point) => new THREE.Vector3(point.x, point.y, 1)
  );

  controls.update();

  let index = 0;

  function moveMouse() {
    if (index < pathVectors.length - 1) {
      const currentPos = pathVectors[index];
      const nextPos = pathVectors[index + 1];

      new TWEEN.Tween(currentPos)
        .to(nextPos, 500) // Adjust the duration as needed
        .onUpdate(() => {
          mouse.position.set(currentPos.x, currentPos.y, currentPos.z);
        })
        .onComplete(() => {
          index++;
          moveMouse();
        })
        .start();
    }
  }

  // Render the scene
  renderer.render(scene, camera);
  moveMouse();
}

init();

function animate(time) {
  requestAnimationFrame(animate);
  TWEEN.update(time);
  renderer.render(scene, camera);
}
animate();
