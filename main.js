import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

let scene, camera, renderer;

init();
animate();
let mesh = null;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

function init() {
    // Create the scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdddddd);  // Light grey background

    // Set up the camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;  // Move the camera back to view the cube

    //lighting
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // White light with full intensity (1)
    directionalLight.position.set(5, 10, 7.5); // Move it around the scene
    scene.add(directionalLight);



    // Set up the renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    
    const loader = new FBXLoader();
   

    // Load FBX model
    loader.load('computer.fbx', (loadedModel) => {
    // Ensure that the loaded model is a mesh
    if (loadedModel instanceof THREE.Mesh) {
        mesh = loadedModel; // Assign to the 'mesh' variable
    } else {
        // If the loaded model is not directly a mesh, traverse its children
        loadedModel.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                mesh = child; // Assign to the 'mesh' variable
            }
        });
    }

    // Check if mesh was successfully assigned
    if (mesh) {
        mesh.scale.set(0.2, 0.2, 0.2); // Adjust scale if necessary
        scene.add(mesh); // Add the mesh to the scene
    } else {
        console.error('No mesh found in the loaded FBX model.');
    }
}, undefined, (error) => {
    console.error('Error loading FBX file:', error);
});
    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

}

// Helper function to convert degrees to radians
function toRadians(angle) {
    return angle * (Math.PI / 180);
}

document.addEventListener('wheel', (event) => {

    const zoomSpeed = 0.005; // Adjust zoom speed if necessary
    camera.position.z += event.deltaY * zoomSpeed;

    camera.position.z = Math.max(2, Math.min(25, camera.position.z)); // Adjust min and max values as needed
});


document.addEventListener('mousedown', (event) => {
    isDragging = true;
    console.log('patisa');
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    console.log('ksepatisa');
});

document.addEventListener('mousemove', (event) => {
    if (isDragging && mesh) {
        const deltaMove = {
            x: event.clientX - previousMousePosition.x,
            y: event.clientY - previousMousePosition.y
        };

        const rotationSpeed = 0.005;
        const deltaRotationQuaternion = new THREE.Quaternion()
            .setFromEuler(new THREE.Euler(
                deltaMove.y * rotationSpeed,
                deltaMove.x * rotationSpeed,
                0,
                'XYZ'
            ));

        mesh.quaternion.multiplyQuaternions(deltaRotationQuaternion, mesh.quaternion);
        previousMousePosition = { x: event.clientX, y: event.clientY };
    }
});




//~~~~

function onWindowResize() {
    // Update the camera aspect ratio and renderer size on window resize
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


function animate() {

    requestAnimationFrame(animate);

    renderer.render(scene, camera);

  }
  
  animate();