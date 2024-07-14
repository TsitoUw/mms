import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
const textureLoader = new THREE.TextureLoader();
const SPEED = 500;

const resultArr = [
  [0, 0],
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [0, 5],
  [0, 6],
  [0, 7],
  [0, 8],
  [0, 9],
  [0, 10],
  [0, 11],
  [0, 12],
  [0, 13],
  [0, 14],
  [0, 15],
  [1, 15],
  [2, 15],
  [3, 15],
  [4, 15],
  [5, 15],
  [6, 15],
  [7, 15],
  [8, 15],
  [9, 15],
  [10, 15],
  [11, 15],
  [12, 15],
  [13, 15],
  [14, 15],
  [15, 15],
  [15, 14],
  [15, 13],
  [15, 12],
  [15, 11],
  [15, 10],
  [15, 9],
  [15, 8],
  [15, 7],
  [15, 6],
  [15, 5],
  [15, 4],
  [15, 3],
  [15, 2],
  [15, 1],
  [14, 1],
  [13, 1],
  [13, 0],
  [14, 0],
  [15, 0],
];

const mazeString = `
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

function mazeToBinaryArray(input) {
  return input
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => line.split("").map((char) => (char === " " ? 0 : 1)));
}

function createMaze(mazeBinary = [], start = [0, 0], end = [0, 0]) {
  const wallTexture = textureLoader.load("./wall.png");
  const floorTexture = textureLoader.load("./Dirt_01.png");
  const endTexture = textureLoader.load("./checkered.png");

  const wallGeometry = new THREE.BoxGeometry(1, 2, 1);
  const wallMaterial = new THREE.MeshPhongMaterial({
    map: wallTexture,
  });

  const floorGeometry = new THREE.PlaneGeometry(
    mazeBinary[0].length,
    mazeBinary.length
  );
  const floorMaterial = new THREE.MeshPhongMaterial({
    map: floorTexture,
  });
  const startGeometry = new THREE.PlaneGeometry(1, 1);
  const startMaterial = new THREE.MeshPhongMaterial({ color: 0x4444aa });
  const endGeometry = new THREE.PlaneGeometry(1, 1);
  const endMaterial = new THREE.MeshPhongMaterial({ map: endTexture });

  const xlength = mazeBinary[0].length;
  const zlength = mazeBinary.length;

  // Create floor
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(xlength / 2 - 0.5, -0.5, zlength / 2 - 0.5);
  floor.receiveShadow = true;

  const startMesh = new THREE.Mesh(startGeometry, startMaterial);
  startMesh.rotation.x = -Math.PI / 2;
  startMesh.position.set(start[0], -0.499, start[1]);

  const endMesh = new THREE.Mesh(endGeometry, endMaterial);
  endMesh.rotation.x = -Math.PI / 2;
  endMesh.position.set(end[0], -0.499, end[1]);

  const walls = [];

  for (let i = 0; i < mazeBinary.length; i++) {
    for (let j = 0; j < mazeBinary[i].length; j++) {
      if (mazeBinary[i][j] === 1) {
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(j, 0, i);
        wall.castShadow = true;
        wall.receiveShadow = true;
        walls.push(wall);
      }
    }
  }

  return { floor, startMesh, endMesh, walls };
}

function createMouse(initPos = [0, 0]) {
  const mouseMaterial = new THREE.MeshPhongMaterial({ color: 0x4444ee });
  const mouse = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 12, 12),
    mouseMaterial
  );
  mouse.castShadow = true;
  mouse.position.set(initPos[0], -0.25, initPos[1]);
  return mouse;
}

const transform = (x) => 2 * x + 1;
function generatePath(arrPath = [[0, 0]]) {
  return arrPath.map((arr) => ({ x: transform(arr[1]), z: transform(arr[0]) }));
}

function pathToVectors(arrPath = [{ x: 0, z: 0 }]) {
  return arrPath.map((point) => new THREE.Vector3(point.x, -0.25, point.z));
}

function createRenderer() {
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
  document.body.appendChild(renderer.domElement);
  return renderer;
}

let pathIndex = 0;
function moveMouse(mouse, pathVector) {
  if (pathIndex < pathVector.length - 1) {
    const currentPos = pathVector[pathIndex];
    const nextPos = pathVector[pathIndex + 1];

    new TWEEN.Tween(currentPos)
      .to(nextPos, SPEED) // Adjust the duration as needed
      .onUpdate(() => {
        mouse.position.set(currentPos.x, -0.25, currentPos.z);
      })
      .onComplete(() => {
        pathIndex++;
        moveMouse(mouse, pathVector);
      })
      .start();
  }
}

function createLightning(scene) {
  const ambientLight = new THREE.AmbientLight(0x666699);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight();
  directionalLight.intensity = 4;
  directionalLight.position.set(100, 100, 100);
  scene.add(directionalLight);
  directionalLight.castShadow = true;
  directionalLight.shadow.camera.top = 200;
  directionalLight.shadow.camera.bottom = -200;
  directionalLight.shadow.camera.left = -200;
  directionalLight.shadow.camera.right = 200;
  directionalLight.shadow.camera.near = 1;
  directionalLight.shadow.camera.far = 1000;
}

function createCamera(renderer) {
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(0, 30, 0);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.update();
  return camera;
}

function init() {
  const renderer = createRenderer();
  const scene = new THREE.Scene();
  const camera = createCamera(renderer);
  createLightning(scene);

  // create, add maze into scene
  //    👇  can be replaced directly by the binary array
  const maze = mazeToBinaryArray(mazeString);
  // start and end aren't transofmed yet




  // create and add mouse
  const mouse = createMouse([1, 1]);
  scene.add(mouse);

  const path = generatePath(resultArr);
  const { floor, startMesh, endMesh, walls } = createMaze(
    maze,
    [path[0].x, path[0].z],
    [path[path.length-1].x, path[path.length-1].z]
  );
  scene.add(floor);
  scene.add(startMesh);
  scene.add(endMesh);
  walls.forEach((wall) => scene.add(wall));
  console.log({ path });
  // example: comment this later
  const pat2h = [
    { x: 1, z: 31 },
    { x: 1, z: 1 },
    { x: 31, z: 1 },
    { x: 31, z: 3 },
    { x: 29, z: 3 },
    { x: 29, z: 29 },
    { x: 27, z: 29 },
    { x: 27, z: 23 },
    { x: 25, z: 23 },
    { x: 25, z: 25 },
    { x: 23, z: 25 },
    { x: 23, z: 27 },
    { x: 19, z: 27 },
    { x: 19, z: 25 },
    { x: 21, z: 25 },
    { x: 21, z: 23 },
    { x: 23, z: 23 },
    { x: 23, z: 21 },
    { x: 25, z: 21 },
    { x: 25, z: 19 },
    { x: 27, z: 19 },
    { x: 27, z: 5 },
    { x: 23, z: 5 },
    { x: 23, z: 7 },
    { x: 25, z: 7 },
    { x: 25, z: 9 },
    { x: 23, z: 9 },
    { x: 23, z: 11 },
    { x: 25, z: 11 },
    { x: 25, z: 15 },
    { x: 23, z: 15 },
    { x: 23, z: 17 },
    { x: 21, z: 17 },
    { x: 21, z: 19 },
    { x: 19, z: 19 },
    { x: 19, z: 21 },
    { x: 17, z: 21 },
    { x: 17, z: 23 },
    { x: 15, z: 23 },
    { x: 15, z: 25 },
    { x: 17, z: 25 },
    { x: 17, z: 27 },
    { x: 13, z: 27 },
    { x: 13, z: 25 },
    { x: 11, z: 25 },
    { x: 11, z: 27 },
    { x: 7, z: 27 },
    { x: 7, z: 25 },
    { x: 9, z: 25 },
    { x: 9, z: 19 },
    { x: 17, z: 19 },
    { x: 17, z: 15 },
    { x: 15, z: 15 },
  ];
  const pathVector = pathToVectors(path);
  moveMouse(mouse, pathVector);

  // render / animate
  renderer.render(scene, camera);
  function animate(time) {
    requestAnimationFrame(animate);
    TWEEN.update(time);
    renderer.render(scene, camera);
  }

  animate();
}

init();
