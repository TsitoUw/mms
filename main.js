import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
const textureLoader = new THREE.TextureLoader();

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
    new THREE.BoxGeometry(0.5, 0.5, 0.5),
    mouseMaterial
  );
  mouse.castShadow = true;
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
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
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
  camera.position.set(0, 30, 40);
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
