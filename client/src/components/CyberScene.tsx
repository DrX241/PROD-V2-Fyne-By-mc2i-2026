import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

interface CyberSceneProps {
  className?: string;
}

const CyberScene: React.FC<CyberSceneProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    
    // Ajouter des lumières
    const ambientLight = new THREE.AmbientLight(0x101010);
    scene.add(ambientLight);
    
    // Lumière principale (bleu cyberpunk)
    const mainLight = new THREE.PointLight(0x00ffff, 1, 100);
    mainLight.position.set(0, 10, 10);
    scene.add(mainLight);
    
    // Lumière secondaire (violet)
    const secondaryLight = new THREE.PointLight(0xff00ff, 1, 50);
    secondaryLight.position.set(10, 0, 10);
    scene.add(secondaryLight);
    
    // Créer la grille cyberpunk
    const gridSize = 20;
    const gridDivisions = 20;
    const gridGeometry = new THREE.PlaneGeometry(gridSize, gridSize, gridDivisions, gridDivisions);
    const gridMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      wireframe: true,
      emissive: 0x00ffff,
      emissiveIntensity: 0.3
    });
    
    const grid = new THREE.Mesh(gridGeometry, gridMaterial);
    grid.rotation.x = -Math.PI / 2;
    grid.position.y = -5;
    scene.add(grid);
    
    // Ajouter des particules pour l'effet cyber
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 30;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.03,
      color: 0x0088ff,
      transparent: true,
      opacity: 0.8
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    // Positionnement de la caméra
    camera.position.set(0, 1, 10);
    
    // Animation avec GSAP
    gsap.to(grid.rotation, {
      z: Math.PI * 2,
      duration: 25,
      repeat: -1,
      ease: "none"
    });
    
    // Animation pour les particules
    gsap.to(particlesMesh.rotation, {
      y: Math.PI * 2,
      duration: 30,
      repeat: -1,
      ease: "none"
    });

    // Gestion des mouvements de la souris
    const handleMouseMove = (event: MouseEvent) => {
      mousePosition.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1
      };
    };

    // Gestion du redimensionnement de la fenêtre
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // Fonction d'animation
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Effet de parallaxe avec la souris
      camera.position.x += (mousePosition.current.x * 3 - camera.position.x) * 0.05;
      camera.position.y += (mousePosition.current.y * 2 - camera.position.y) * 0.05;
      
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    };
    
    animate();

    // Nettoyage
    return () => {
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <div ref={containerRef} className={`fixed top-0 left-0 w-full h-full -z-10 ${className}`} />;
};

export default CyberScene;