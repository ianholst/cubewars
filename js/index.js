// Make a scene
var scene = new THREE.Scene();

// Make renderer
var renderer = new THREE.WebGLRenderer({ antialias: true });
// Add renderer to HTML
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement );

// Make a camera
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0,-10,10);
camera.up = new THREE.Vector3(0,0,1);
camera.lookAt(new THREE.Vector3(0,0,0));

// Make mouse controls
var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableKeys = false;
controls.enableZoom = false;


// Make playing field

class Player {
	constructor(size, x,y,z, color) {
		this.size = size;
		this.geometry = new THREE.BoxGeometry(size, size, size);
		this.material = new THREE.MeshBasicMaterial({ color: color });
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh.position.set(x,y,z);

		this.shape = new CANNON.Box(new CANNON.Vec3(size/2, size/2, size/2));
		this.body = new CANNON.Body({ mass: 1, shape: this.shape });
		this.body.position.set(x,y,z);
	}
	updatePosition() {
		this.mesh.position.x = this.body.position.x
		this.mesh.position.y = this.body.position.y
		this.mesh.position.z = this.body.position.z
	}
}

var player1 = new Player(1, -3,0,3, 0xFF0000);
var player2 = new Player(1, 3,0,3, 0x00FFA0);

class Platform {
	constructor(size, color) {
		// too thicc
		this.geometry = new THREE.BoxGeometry(size, size, 0.01);
		this.material = new THREE.MeshBasicMaterial({ color: color });
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh.position.set(0,0,0);

		this.shape = new CANNON.Plane();
		this.body = new CANNON.Body({ mass: 0, shape: this.shape });
		this.body.position.set(0,0,0);
	}
}

var platform = new Platform(10, 0x345687);


// PHYSICS
var world = new CANNON.World();
world.gravity.set(0,0,-9.82);


// Add items to scene
scene_adder([platform, player2, player1]);

function scene_adder(objects) {
	for (var object of objects){
		scene.add(object.mesh);
		world.add(object.body);
	}
}


// Keyboard interaction
function onKeyDown(event) {
    console.log(event.key);
}

function onKeyUp(event) {
    console.log(event.key);
}

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);


// EVENT LOOP
var fixedTimeStep = 1.0 / 60.0; // seconds
var maxSubSteps = 3;
var lastTime = Date.now();

function update(time) {
	requestAnimationFrame(update);
	var dt = (time - lastTime) / 1000.0;
	renderer.render(scene, camera);
	world.step(fixedTimeStep, dt, maxSubSteps);
	lastTime = time;
	// update displayed positions
	player1.updatePosition();
	player2.updatePosition();
}


update();
