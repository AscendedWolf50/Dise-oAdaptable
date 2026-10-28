import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default function CarCanvas({ colorIndex = 0 }) {
  const mountRef = useRef(null);
  const carModelRef = useRef(null);

  const baseUrl = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;

  // Función para cargar la textura .png y aplicarla con filtro nítido (Point Filter / Nearest)
  const aplicarTexturaAlModelo = (index) => {
    if (!carModelRef.current) return;

    const texturePath = `${baseUrl}models/textures/car_${index}.png`;
    const textureLoader = new THREE.TextureLoader();

    textureLoader.load(
      texturePath,
      (newTexture) => {
        newTexture.flipY = false;
        newTexture.colorSpace = THREE.SRGBColorSpace;

        // Mantener nitidez estilo Pixel Art / Voxel sin difuminar bordes
        newTexture.magFilter = THREE.NearestFilter;
        newTexture.minFilter = THREE.NearestFilter;
        newTexture.generateMipmaps = false;
        newTexture.needsUpdate = true;

        carModelRef.current.traverse((child) => {
          if (child.isMesh && child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => {
                mat.map = newTexture;
                mat.needsUpdate = true;
              });
            } else {
              child.material.map = newTexture;
              child.material.needsUpdate = true;
            }
          }
        });
      },
      undefined,
      (err) => console.error("Error al cargar textura de color:", err)
    );
  };

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
    domElement.style.touchAction = 'none';
    container.appendChild(domElement);

    // 2. Iluminación
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.8);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // 3. Cargar Modelo 3D
    const loader = new GLTFLoader();
    const modelUrl = `${baseUrl}models/carro.glb`;

    loader.load(
      modelUrl,
      (gltf) => {
        const carModel = gltf.scene;
        carModelRef.current = carModel;

        // Centrar y escalar el modelo
        const box = new THREE.Box3().setFromObject(carModel);
        const center = box.getCenter(new THREE.Vector3());
        carModel.position.sub(center);
        carModel.position.y += 0.35;
        carModel.scale.set(1.2, 1.2, 1.2);

        scene.add(carModel);

        // Aplicar la textura inicial
        aplicarTexturaAlModelo(colorIndex);
      },
      undefined,
      (error) => console.error('Error al cargar el modelo 3D:', error, 'en ruta:', modelUrl)
    );

    // 4. Control de interacción con Puntero (Mouse / Touch)
    let isDragging = false;
    let previousPointerX = 0;

    const handlePointerDown = (e) => {
      isDragging = true;
      previousPointerX = e.clientX;
      domElement.style.cursor = 'grabbing';
      if (e.pointerId !== undefined && domElement.setPointerCapture) {
        try {
          domElement.setPointerCapture(e.pointerId);
        } catch (err) {}
      }
    };

    const handlePointerMove = (e) => {
      if (!isDragging || !carModelRef.current) return;
      const deltaX = e.clientX - previousPointerX;
      previousPointerX = e.clientX;
      
      carModelRef.current.rotation.y += deltaX * 0.008;
    };

    const handlePointerUp = (e) => {
      if (isDragging) {
        isDragging = false;
        domElement.style.cursor = 'grab';
        if (e && e.pointerId !== undefined && domElement.releasePointerCapture) {
          try {
            domElement.releasePointerCapture(e.pointerId);
          } catch (err) {}
        }
      }
    };

    domElement.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // 5. Animación de Rotación Automática
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (carModelRef.current && !isDragging) {
        carModelRef.current.rotation.y += 0.008;
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

  // Actualizar la textura si cambia el color seleccionado en la paleta
  useEffect(() => {
    aplicarTexturaAlModelo(colorIndex);
  }, [colorIndex]);

  return <div ref={mountRef} className="h-full w-full" />;
}