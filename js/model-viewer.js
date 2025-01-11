import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, model, controls;

function init() {
    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x121212);

    // 获取容器尺寸
    const container = document.getElementById('model-container');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // 创建相机
    camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
    camera.position.set(0, 1, 5);

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    renderer.setSize(containerWidth, containerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 添加轨道控制
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 3;
    controls.maxDistance = 8;
    controls.maxPolarAngle = Math.PI / 2;

    // 添加灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // 加载模型
    const loader = new GLTFLoader();
    loader.load(
        '/Personal_Website4myself/models/eva01.glb', // 添加仓库名称到路径中
        function (gltf) {
            model = gltf.scene;
            
            // 将缩放从 1.5 改为 3.0（两倍大小）
            model.scale.set(3.0, 3.0, 3.0);
            
            // 将 y 轴位置从 -1 改为 0（向上移动）
            model.position.set(0, 0, 0);
            
            // 确保模型材质正确显示
            model.traverse((node) => {
                if (node.isMesh) {
                    node.material.metalness = 0.5;
                    node.material.roughness = 0.5;
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
            
            scene.add(model);
            
            // 初始旋转
            model.rotation.y = Math.PI / 4;

            // 调整相机位置以适应更大的模型
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
            camera.position.z = cameraZ * 1.5;
            camera.updateProjectionMatrix();
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('An error happened:', error);
        }
    );

    // 添加窗口大小调整监听
    window.addEventListener('resize', onWindowResize, false);

    animate();
}

function onWindowResize() {
    const container = document.getElementById('model-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    if (model) {
        model.rotation.y += 0.002;
    }
    
    renderer.render(scene, camera);
}

init(); 