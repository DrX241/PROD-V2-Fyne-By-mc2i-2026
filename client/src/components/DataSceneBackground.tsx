import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function DataSceneBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Initialisation de la scène
    const scene = new THREE.Scene();
    
    // Initialisation de la caméra
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    
    // Initialisation du renderer avec paramètres optimisés
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: false, // Désactivé pour améliorer les performances
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    // Limiter le pixel ratio pour les appareils haute densité
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    
    // Ajout du canvas au container
    containerRef.current.appendChild(renderer.domElement);
    
    // Création des particules (nombre réduit pour optimisation)
    const particleCount = 600; // Réduction du nombre de particules
    const particles = new THREE.BufferGeometry();
    
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const color = new THREE.Color();
    // Couleurs précalculées pour optimiser la boucle
    const presetColors = [
      '#4287f5', // Bleu
      '#42c5f5', // Cyan
      '#8042f5', // Violet
      '#f542e3', // Rose
      '#42f5d1'  // Turquoise
    ];
    
    for (let i = 0; i < particleCount; i++) {
      // Position
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      
      // Couleur - simplifié avec la sélection dans le tableau précalculé
      const colorIndex = Math.floor(Math.random() * presetColors.length);
      color.set(presetColors[colorIndex]);
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      // Taille
      sizes[i] = Math.random() * 4; // Taille légèrement réduite
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Matériel pour les particules
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    
    // Création du système de particules
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    
    // Animation optimisée avec limitation du framerate
    let lastFrameTime = 0;
    const targetFrameRate = 30; // Limiter à 30 FPS pour économiser des ressources
    const frameInterval = 1000 / targetFrameRate;
    
    const animate = (timestamp = 0) => {
      requestAnimationFrame(animate);
      
      // Limitation du framerate
      const elapsed = timestamp - lastFrameTime;
      if (elapsed < frameInterval) return;
      
      lastFrameTime = timestamp - (elapsed % frameInterval);
      
      particleSystem.rotation.x += 0.0003;
      particleSystem.rotation.y += 0.0005;
      
      renderer.render(scene, camera);
    };
    
    // Gestion du redimensionnement
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    animate();
    
    // Nettoyage
    return () => {
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 bg-gradient-to-b from-[#050c15] to-[#0a1525]"
    />
  );
}