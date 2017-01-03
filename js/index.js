// Make a scene
var scene = new THREE.Scene();

// Make renderer
var renderer = new THREE.WebGLRenderer();
// Add renderer to HTML
renderer.setSize(window.innerWidth, window.innerHeight );
document.body.appendChild(renderer.domElement );

// Make a camera
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0,-5,5);
camera.up = new THREE.Vector3(0,0,1);
camera.lookAt(new THREE.Vector3(0,0,0));

// Make mouse controls
var controls = new THREE.OrbitControls(camera, renderer.domElement);


// Make playing field

class Player {
	constructor(size, x,y,z, color) {
		this.size = size;
		this.geometry = new THREE.BoxGeometry(size, size, size);
		this.material = new THREE.MeshBasicMaterial({ color: color });
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh.position.set(x,y,z);
	}
}

var player1 = new Player(1, -3,0,3, 0xFF0000);
var player2 = new Player(1, 3,0,3, 0x00FF00);

class Platform {
	constructor(size, color) {
		this.geometry = new THREE.PlaneGeometry(size, size);
		this.material = new THREE.MeshBasicMaterial({ color: color });
		this.mesh = new THREE.Mesh(this.geometry, this.material);
	}
}

var platform = new Platform(10, 0x345687);

scene_adder([platform, player2, player1]);

function scene_adder(objects) {
	for (var object of objects){
		scene.add(object.mesh);
	}
}

function render() {
	requestAnimationFrame(render);
	renderer.render(scene, camera);
}

render();
