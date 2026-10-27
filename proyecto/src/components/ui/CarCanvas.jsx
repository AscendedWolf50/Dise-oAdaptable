import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default function CarCanvas() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Escena, Cámara y Renderizador
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    
    camera.position.set(0, 0.7, 4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    const domElement = renderer.domElement;
    domElement.style.cursor = 'grab';
    container.appendChild(domElement);

    // 2. Iluminación
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.8);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // 3. Cargar Modelo 3D
    let carModel = null;
    const loader = new GLTFLoader();

    const baseUrl = import.meta.env.BASE_URL.endsWith('/')
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;
    const modelUrl = `${baseUrl}models/carro.glb`;

    loader.load(
      modelUrl,
      (gltf) => {
        carModel = gltf.scene;

        // Centrar el modelo en su origen
        const box = new THREE.Box3().setFromObject(carModel);
        const center = box.getCenter(new THREE.Vector3());
        carModel.position.sub(center);

        // Desplazar el carro hacia arriba
        carModel.position.y += 0.35;

        // Escala general del carro
        carModel.scale.set(1.2, 1.2, 1.2);

        scene.add(carModel);
      },
      undefined,
      (error) => {
        console.error('Error al cargar el modelo 3D:', error, 'en ruta:', modelUrl);
      }
    );

    // 4. Control de interacción con Puntero (Mouse / Touch)
    let isDragging = false;
    let previousPointerX = 0;

    const handlePointerDown = (e) => {
      isDragging = true;
      previousPointerX = e.clientX;
      domElement.style.cursor = 'grabbing';
    };

    const handlePointerMove = (e) => {
      if (!isDragging || !carModel) return;
      const deltaX = e.clientX - previousPointerX;
      previousPointerX = e.clientX;
      
      // Rotar únicamente en el eje Y (izquierda/derecha)
      carModel.rotation.y += deltaX * 0.008;
    };

    const handlePointerUp = () => {
      if (isDragging) {
        isDragging = false;
        domElement.style.cursor = 'grab';
      }
    };

    domElement.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // 5. Animación de Rotación
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Si el usuario no lo está arrastrando, rota automáticamente
      if (carModel && !isDragging) {
        carModel.rotation.y += 0.008;
      }

      renderer.render(scene, camera);
    };
    animate();

    // 6. Redimensionamiento
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      domElement.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="h-full w-full" />;
}