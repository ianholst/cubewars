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
// controls.enableZoom = false;

// Make game objects

class Box {
	constructor(width,depth,height, x,y,z, color, mass) {
		// DISPLAY
		this.geometry = new THREE.BoxGeometry(width,depth,height);
		this.material = new THREE.MeshBasicMaterial({ color: color });
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh.position.set(x,y,z);
		this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
		// PHYSICS
		this.shape = new CANNON.Box(new CANNON.Vec3(width/2, depth/2, height/2));
		this.contactMaterial = new CANNON.Material({ friction: 0 });
		this.body = new CANNON.Body({ mass: mass, shape: this.shape, material: this.contactMaterial });
		this.body.position.set(x,y,z);

	}
}

class Player extends Box {
	constructor(size, x,y,z, color) {
		super(size,size,size, x,y,z, color, 1);
		this.speed = 3.0;
		this.angSpeed = 2.0;
		this.movement = 0;
		this.angMovement = 0;
	}
	update() {
		this.mesh.position.copy(this.body.position);
		this.mesh.quaternion.copy(this.body.quaternion);
		if (this.angMovement != 0) {
			this.move(this.movement);
		}
	}
	move(dir) {
		this.movement = dir;
		var facing = this.body.quaternion.vmult(new CANNON.Vec3(0,1,0));
		this.body.velocity.copy(facing.scale(this.speed*dir));
	}
	rotate(dir) {
		this.angMovement = dir;
		this.body.angularVelocity.z = this.angSpeed*dir
	}
}

class Platform extends Box {
	constructor(size, color) {
		super(size,size,0.01, 0,0,0, color, 0);
	}
}

var player1 = new Player(1, -3,0,3, 0xFF0000);
var player2 = new Player(1, 3,0,3, 0x00FFA0);

var platform = new Platform(10, 0x345687);

// PHYSICS
var world = new CANNON.World();
world.gravity.set(0,0,-9.82);
// world.broadphase = new CANNON.NaiveBroadphase();

// Add items to scene
function addToScene(objects) {
	for (var object of objects){
		scene.add(object.mesh);
		world.add(object.body);
	}
}
addToScene([player1, player2, platform]);


// Keyboard interaction
function onKeyDown(event) {
	switch (event.key) {
		case "ArrowUp":
			player1.move(1);
			break;
		case "ArrowDown":
			player1.move(-1);
			break;
		case "ArrowLeft":
			player1.rotate(1);
			break;
		case "ArrowRight":
			player1.rotate(-1);
			break;
		case "w":
			player2.move(1);
			break;
		case "s":
			player2.move(-1);
			break;
		case "a":
			player2.rotate(1);
			break;
		case "d":
			player2.rotate(-1);
			break;
		default:
			return;
	}
}

function onKeyUp(event) {
	switch (event.key) {
		case "ArrowUp":
			player1.move(0);
			break;
		case "ArrowDown":
			player1.move(0);
			break;
		case "ArrowLeft":
			player1.rotate(0);
			break;
		case "ArrowRight":
			player1.rotate(0);
			break;
		case "w":
			player2.move(0);
			break;
		case "s":
			player2.move(0);
			break;
		case "a":
			player2.rotate(0);
			break;
		case "d":
			player2.rotate(0);
			break;
		default:
			return;
	}
}

// Resize
function onResize(event) {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	//controls.handleResize();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

document.addEventListener("keydown", onKeyDown, false);
document.addEventListener("keyup", onKeyUp, false);
window.addEventListener("resize", onResize, false);


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
	player1.update();
	player2.update();
}

update();
