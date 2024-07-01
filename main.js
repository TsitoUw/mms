import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let scene, camera, renderer;
let mouse; // Declare mouse variable globally

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

const mazeString = `
o---o---o---o---o---o---o---o---o---o---o
|                                       |
o   o---o---o---o---o---o---o---o---o   o
|   |               |                   |
o   o   o---o---o   o   o---o---o   o   o
|   |       |       |               |   |
o   o   o   o   o---o   o   o---o   o   o
|   |   |               |               |
o   o   o---o---o   o   o---o---o---o   o
|   |               |                   |
o---o---o---o---o---o---o---o---o---o---o
`;

function convertMazeStringToArray(mazeString) {
  const lines = mazeString.trim().split('\n');
  const height = Math.floor((lines.length + 1) / 2);
  const width = Math.floor((lines[0].length + 1) / 4);

  const maze = Array.from({ length: height * 2 - 1 }, () => Array(width * 2 - 1).fill(0));

  for (let i = 0; i < lines.length; i++) {
      for (let j = 0; j < lines[i].length; j++) {
          const x = Math.floor(i / 2);
          const y = Math.floor(j / 4);

          if (lines[i][j] === 'o') {
              maze[x * 2][y * 2] = 1;
          } else if (lines[i][j] === '-') {
              maze[x * 2][y * 2 + 1] = 1;
          } else if (lines[i][j] === '|') {
              maze[x * 2 + 1][y * 2] = 1;
          }
      }
  }

  return maze;
}


const maze = convertMazeStringToArray(mazeString);

function createMaze() {
  const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
  const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });

  for (let i = 0; i < maze.length; i++) {
    for (let j = 0; j < maze[i].length; j++) {
      if (maze[i][j] === 1) {
        const wall = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          wallMaterial
        );
        wall.position.set(i, 0.5, j);
        scene.add(wall);
      } else {
        const floor = new THREE.Mesh(
          new THREE.BoxGeometry(1, 0.1, 1),
          floorMaterial
        );
        floor.position.set(i, 0, j);
        scene.add(floor);
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
  camera.position.set(0, 20, 20);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Add OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement);

  // Add basic light
  const ambientLight = new THREE.AmbientLight(0x909090);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(10, 10, 10).normalize();
  scene.add(directionalLight);

  // Create the maze and mouse
  createMaze();
  mouse = createMouse();

  // Start the solving process

  const start = [1, 1];
  const end = [3, 4];
  const path = dfsMazeSolver(maze, start, end);
  if (path) {
    animateMouse(path);
  }

  controls.update();

  // Render the scene
  renderer.render(scene, camera);
}

init();
animate();
