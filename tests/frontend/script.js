
let scene, camera, renderer;
let particles = [];
let objects = [];

function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05050f);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('world-canvas'),
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    // Add point lights
    const pointLight1 = new THREE.PointLight(0x8a2be2, 1, 50);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x00ffff, 1, 50);
    pointLight2.position.set(-10, -10, -10);
    scene.add(pointLight2);
    
    // Create particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 500;
    const posArray = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        posArray[i] = (Math.random() - 0.5) * 100;
        posArray[i + 1] = (Math.random() - 0.5) * 100;
        posArray[i + 2] = (Math.random() - 0.5) * 100;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.1,
        color: 0x8a2be2,
        transparent: true,
        opacity: 0.8
    });
    
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
    
    // Create geometric objects
    const geometries = [
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.SphereGeometry(1.5, 16, 16),
        new THREE.ConeGeometry(1, 3, 16),
        new THREE.TorusGeometry(1.5, 0.5, 16, 100),
        new THREE.OctahedronGeometry(1.8)
    ];
    
    for (let i = 0; i < 15; i++) {
        const geometry = geometries[Math.floor(Math.random() * geometries.length)];
        const material = new THREE.MeshPhongMaterial({
            color: Math.random() > 0.5 ? 0x8a2be2 : 0x00ffff,
            wireframe: true,
            transparent: true,
            opacity: 0.7,
            shininess: 100,
            specular: 0xffffff
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        // Position randomly
        mesh.position.x = (Math.random() - 0.5) * 30;
        mesh.position.y = (Math.random() - 0.5) * 30;
        mesh.position.z = (Math.random() - 0.5) * 30;
        
        // Random rotation
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;
        
        // Random scale
        const scale = 0.5 + Math.random() * 1.5;
        mesh.scale.set(scale, scale, scale);
        
        scene.add(mesh);
        objects.push({
            mesh: mesh,
            speed: {
                x: (Math.random() - 0.5) * 0.01,
                y: (Math.random() - 0.5) * 0.01,
                z: (Math.random() - 0.5) * 0.01
            },
            rotation: {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            }
        });
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Start animation
    animate();
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Rotate camera
    const time = Date.now() * 0.0001;
    camera.position.x = Math.sin(time) * 20;
    camera.position.z = Math.cos(time) * 20;
    camera.lookAt(scene.position);
    
    // Animate objects
    objects.forEach(obj => {
        obj.mesh.rotation.x += obj.rotation.x;
        obj.mesh.rotation.y += obj.rotation.y;
        obj.mesh.rotation.z += obj.rotation.z;
        
        obj.mesh.position.x += obj.speed.x;
        obj.mesh.position.y += obj.speed.y;
        obj.mesh.position.z += obj.speed.z;
        
        // Boundary check
        if (Math.abs(obj.mesh.position.x) > 25) obj.speed.x *= -1;
        if (Math.abs(obj.mesh.position.y) > 25) obj.speed.y *= -1;
        if (Math.abs(obj.mesh.position.z) > 25) obj.speed.z *= -1;
    });
    
    renderer.render(scene, camera);
}

// Initialize on load
window.addEventListener('load', init);

// Generate button interaction
document.getElementById('generate-btn').addEventListener('click', function() {
    const prompt = document.getElementById('world-prompt').value;
    if (!prompt.trim()) {
        alert('Please describe your game world!');
        return;
    }
    
    if (prompt.length > 200) {
        alert('Description must be under 200 characters');
        return;
    }
    
    // Simulate generation process
    const btn = this;
    btn.innerHTML = '<span class="material-icons animate-spin mr-2">autorenew</span> Minting World...';
    btn.disabled = true;
    
    // Simulate blockchain transaction
    setTimeout(() => {
        btn.innerHTML = '<span class="material-icons mr-2">rocket_launch</span> Mint World ($50 NEXUS)';
        btn.disabled = false;
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-600 to-emerald-800 text-white px-6 py-4 rounded-lg shadow-lg flex items-center animate-fadeIn';
        successMsg.innerHTML = `
            <span class="material-icons mr-2 text-2xl">check_circle</span>
            <div>
                <div class="font-bold">World Minted Successfully!</div>
                <div>Your "${prompt.substring(0, 20)}..." is now an NFT on the blockchain.</div>
            </div>
        `;
        document.body.appendChild(successMsg);
        
        // Remove after 5 seconds
        setTimeout(() => {
            successMsg.remove();
        }, 5000);
    }, 3000);
});

// Typewriter effect
const phrases = [
    "3D Game Worlds",
    "Immersive Universes",
    "Blockchain Gaming",
    "AI-Generated Worlds",
    "NFT Game Assets"
];

let currentPhrase = 0;
let currentChar = 0;
let isDeleting = false;
let typingSpeed = 100;

function type() {
    const element = document.querySelector('.typewriter');
    const fullPhrase = phrases[currentPhrase];
    
    if (isDeleting) {
        element.textContent = fullPhrase.substring(0, currentChar - 1);
        currentChar--;
        typingSpeed = 50;
    } else {
        element.textContent = fullPhrase.substring(0, currentChar + 1);
        currentChar++;
        typingSpeed = 100;
    }
    
    if (!isDeleting && currentChar === fullPhrase.length) {
        typingSpeed = 1500;
        isDeleting = true;
    } else if (isDeleting && currentChar === 0) {
        isDeleting = false;
        currentPhrase = (currentPhrase + 1) % phrases.length;
        typingSpeed = 500;
    }
    
    setTimeout(type, typingSpeed);
}

// Start typewriter effect
setTimeout(type, 1000);

// GSAP animations
gsap.from('header', {duration: 1, y: -100, opacity: 0, ease: "power3.out"});
gsap.from('.hero-gradient', {duration: 1, opacity: 0, delay: 0.3, ease: "power3.out"});
gsap.from('.world-card', {duration: 1, opacity: 0, y: 50, stagger: 0.1, delay: 1, ease: "power3.out"});