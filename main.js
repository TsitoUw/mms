import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

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
  const wallGeometry = new THREE.BoxGeometry(1, 1, 1);
  const wallMaterial = new THREE.MeshPhongMaterial({ color: 0x8888ff });
  const floorGeometry = new THREE.PlaneGeometry(
    mazeBinary[0].length,
    mazeBinary.length
  );
  const floorMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
  const startGeometry = new THREE.PlaneGeometry(1, 1);
  const startMaterial = new THREE.MeshPhongMaterial({ color: 0xff4444 });
  const endGeometry = new THREE.PlaneGeometry(1, 1);
  const endMaterial = new THREE.MeshPhongMaterial({ color: 0x44ff44 });

  const xlength = mazeBinary[0].length;
  const zlength = mazeBinary.length;

  // Create floor
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(xlength / 2 - 0.5, -0.5, zlength / 2 - 0.5);

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
        walls.push(wall);
      }
    }
  }

  return { floor, startMesh, endMesh, walls };
}

function createMouse(initPos = [0, 0]) {
  const mouseMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
  const mouse = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 0.5),
    mouseMaterial
  );
  mouse.position.set(initPos[0], -0.25, initPos[1]);
  return mouse;
}

const transform = (x) => 2 * x + 1;
function generatePath(arrPath = [[0, 0]]) {
  return arrPath.map((arr) => ({ x: transform(arr[0]), z: transform(arr[1]) }));
}

function pathToVectors(arrPath = [{ x: 0, z: 0 }]) {
  return arrPath.map((point) => new THREE.Vector3(point.x, 0, point.z));
}

function createRenderer() {
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  return renderer;
}

function moveMouse(mouse, pathVectors) {
  let index = 0;
  if (index < pathVectors.length - 1) {
    const currentPos = pathVectors[index];
    const nextPos = pathVectors[index + 1];

    new TWEEN.Tween(currentPos)
      .to(nextPos, 1000) // Adjust the duration as needed
      .onUpdate(() => {
        mouse.position.set(currentPos.x, -0.25, currentPos.z);
      })
      .onComplete(() => {
        index++;
        moveMouse(mouse, pathVectors);
      })
      .start();
  }
}

function createLightning(scene) {
  const ambientLight = new THREE.AmbientLight(0x909090);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
  directionalLight.position.set(10, 10, 10).normalize();
  scene.add(directionalLight);
}

function createCamera(renderer) {
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 40, 20);
  camera.lookAt(0, 0, 0);
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
  const { floor, startMesh, endMesh, walls } = createMaze(maze, [1, 1], [1, 2]);
  scene.add(floor);
  scene.add(startMesh);
  scene.add(endMesh);
  walls.forEach((wall) => scene.add(wall));

  // create and add mouse
  const mouse = createMouse([1, 1]);
  scene.add(mouse);

  // const path = generatePath(resolvedPath)
  // example: comment this later
  const path = [
    { x: 1, z: 1 },
    { x: 1, z: 2 },
  ];
  const pathVectors = pathToVectors(path);
  moveMouse(mouse, pathVectors);

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
