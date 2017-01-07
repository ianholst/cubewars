// Make a scene
var scene = new THREE.Scene();

// Make renderer
var renderer = new THREE.WebGLRenderer({ antialias: true });
// Add renderer to HTML
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Make a camera
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0,-10,10);
camera.up = new THREE.Vector3(0,0,1);
camera.lookAt(new THREE.Vector3(0,0,0));

// Make lights
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.gammaInput = true;
renderer.gammaOutput = true;
renderer.gammaFactor = 1.5;

var ambient = new THREE.AmbientLight(0xFFFFFF, 0.3);
scene.add(ambient);

var light = new THREE.SpotLight(0xFFFFFF, 1);
light.position.set(-6,-6,10);
light.target.position.set(0,0,0);
light.shadow.camera.near = camera.near*10;
light.shadow.camera.far = camera.far/10;
light.shadow.camera.fov = camera.fov;
light.castShadow = true;
light.shadow.mapSize.width = 2*1024;
light.shadow.mapSize.height = 2*1024;
scene.add(light);

// hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
// hemiLight.color.setHSL(0.6, 1, 0.6);
// hemiLight.groundColor.setHSL(0.095, 1, 0.75);
// hemiLight.position.set(0, 500, 0);
// scene.add(hemiLight);

// Make mouse controls
var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableKeys = false;
// controls.enableZoom = false;

// PHYSICS
var world = new CANNON.World();
world.gravity.set(0,0,-30);

// Make game objects
class Box {
	constructor(width,depth,height, x,y,z, color, mass) {
		// DISPLAY
		this.geometry = new THREE.BoxGeometry(width,depth,height);
		this.material = new THREE.MeshPhongMaterial({ color: color });
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh.position.set(x,y,z);
		this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
		// PHYSICS
		this.shape = new CANNON.Box(new CANNON.Vec3(width/2, depth/2, height/2));
		this.contactMaterial = new CANNON.Material({ friction: 0 });
		this.body = new CANNON.Body({ mass: mass, shape: this.shape, material: this.contactMaterial });
		this.body.position.set(x,y,z);
		// ADD TO SCENE/WORLD
		scene.add(this.mesh);
		world.add(this.body);
	}
}

class Player extends Box {
	constructor(size, x,y,z, color, playerNum) {
		super(size,size,size, x,y,z, color, 1);
		this.thrust = 15;
		this.torque = 2;
		this.movement = 0;
		this.angMovement = 0;
		this.body.linearDamping = 0.8;
		this.body.angularDamping = 0.8;
		this.playerNum = playerNum;
		this.lost = false;
	}
	update(dt) {
		this.mesh.position.copy(this.body.position);
		this.mesh.quaternion.copy(this.body.quaternion);
		if (this.movement || this.angMovement) {
			this.move(this.movement);
			this.rotate(this.angMovement);
		}
		if(!this.lost && this.body.position.z < 0){
			document.getElementById('message').textContent = 'Player ' + this.playerNum + ' lost!';
			this.lost = true;
		}
	}
	move(dir) {
		this.movement = dir;
		var facing = this.body.quaternion.vmult(new CANNON.Vec3(0,1,0));
		this.body.force.copy(facing.scale(this.thrust*dir));

	}
	rotate(dir) {
		this.angMovement = dir;
		this.body.torque.z = this.torque*dir
	}
	jump(){
		var facing = this.body.quaternion.vmult(new CANNON.Vec3(0,0,20));
		this.body.force.copy(facing.scale(this.thrust));
	}
}

class Platform {
	constructor(size, N, P, color) {
		this.platformMeshArray = [];
		for (var y = 0; y < N; y++) {
			var row = [];
			for (var x = 0; x < N; x++) {
				if (Math.random() > P || x==0 || y==0 || x==N-1 || y==N-1) {
					var xPos = 0 - size/2 + x*size/N + size/N/2;
					var yPos = 0 - size/2 + y*size/N + size/N/2;
					var box = new Box(size/N,size/N,0.1, xPos,yPos,0, color, 0);
					row.push(box);
				} else {
					row.push(0);
				}
			}
			this.platformMeshArray.push(row);
		}
	}
}

var platform = new Platform(10, 8, 0.1, 0x335599);
var player1 = new Player(1, 3,0,3, 0xFF2222, 1);
var player2 = new Player(1, -3,0,3, 0x00FFA0, 2);

// Rotate players to face each other?
player1.body.quaternion.setFromEuler(0,0,Math.PI/2);
player2.body.quaternion.setFromEuler(0,0,-Math.PI/2);

function resetGame(){
	for(var player of [player1, player2]){
		player.body.velocity.set(0,0,0);
		player.movement = 0;
		player.angMovement = 0;
		player.lost = false;
		player.body.velocity.set(0,0,0);
		player.body.angularVelocity.set(0,0,0);
	}
	player1.body.position.set(3,0,3);
	player2.body.position.set(-3,0,3);
	player1.body.quaternion.setFromEuler(0,0,Math.PI/2);
	player2.body.quaternion.setFromEuler(0,0,-Math.PI/2);
	document.getElementById('message').textContent = '';
}

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
        case "W":
			player2.move(1);
			break;
		case "S":
			player2.move(-1);
			break;
		case "A":
			player2.rotate(1);
			break;
		case "D":
			player2.rotate(-1);
			break;
		case "q":
			player2.jump();
			break;
		case "Shift":
			player1.jump();
			break;
		case "Escape":
			resetGame();
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
        case "W":
			player2.move(0);
			break;
		case "S":
			player2.move(0);
			break;
		case "A":
			player2.rotate(0);
			break;
		case "D":
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
	renderer.setSize(window.innerWidth, window.innerHeight);
}

// Event listeners
document.addEventListener("keydown", onKeyDown, false);
document.addEventListener("keyup", onKeyUp, false);
window.addEventListener("resize", onResize, false);


// EVENT LOOP
var dt = 1 / 60; // seconds
var lastTimestamp = 0;
update(lastTimestamp);

function update(timestamp) {
	requestAnimationFrame(update);
	renderer.render(scene, camera);
	var timestep = (timestamp - lastTimestamp)/1000;
	world.step(dt, timestep, 10);
	lastTimestamp = timestamp;
	// update displayed positions
	player1.update(dt);
	player2.update(dt);
}
