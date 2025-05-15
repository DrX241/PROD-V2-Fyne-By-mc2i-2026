import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface DataSceneProps {
  className?: string;
}

const DataScene: React.FC<DataSceneProps> = ({ className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const frameIdRef = useRef<number>(0);
  const mouseX = useRef<number>(0);
  const mouseY = useRef<number>(0);

  // Effet pour initialiser et animer la scène 3D
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Initialisation de la scène
    const init = () => {
      // Créer la scène Three.js
      sceneRef.current = new THREE.Scene();

      // Créer la caméra
      cameraRef.current = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      cameraRef.current.position.z = 30;

      // Créer le renderer
      rendererRef.current = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true 
      });
      rendererRef.current.setSize(width, height);
      rendererRef.current.setPixelRatio(window.devicePixelRatio);
      container.appendChild(rendererRef.current.domElement);

      // Créer les particules pour représenter les données
      createDataParticles();

      // Ajouter event listeners pour l'interactivité
      window.addEventListener('resize', handleResize);
      window.addEventListener('mousemove', handleMouseMove);
    };

    // Créer les particules de données
    const createDataParticles = () => {
      const particleCount = 2000;
      const particleGeometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);

      // Couleurs pour les particules
      const color1 = new THREE.Color(0x7b2ff7); // Violet
      const color2 = new THREE.Color(0x00c6ff); // Bleu clair
      const color3 = new THREE.Color(0xff36d0); // Rose

      // Remplir les tableaux de positions aléatoires
      for (let i = 0; i < particleCount; i++) {
        // Position
        const x = (Math.random() - 0.5) * 100;
        const y = (Math.random() - 0.5) * 100;
        const z = (Math.random() - 0.5) * 100;
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        // Couleur
        const colorRand = Math.random();
        let color;
        
        if (colorRand < 0.33) {
          color = color1;
        } else if (colorRand < 0.66) {
          color = color2;
        } else {
          color = color3;
        }
        
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        // Taille
        sizes[i] = Math.random() * 2;
      }

      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      // Créer le shader pour les particules
      const particleMaterial = new THREE.ShaderMaterial({
        vertexShader: `
          attribute float size;
          attribute vec3 color;
          varying vec3 vColor;
          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          void main() {
            if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.5) discard;
            gl_FragColor = vec4(vColor, 1.0);
          }
        `,
        transparent: true,
        vertexColors: true,
        blending: THREE.AdditiveBlending
      });

      // Créer le système de particules
      particlesRef.current = new THREE.Points(particleGeometry, particleMaterial);
      sceneRef.current!.add(particlesRef.current);

      // Ajouter des lignes de connexion entre certaines particules
      createDataConnections(positions, 100, color2);
    };

    // Créer des lignes connectant les particules pour simuler un réseau de données
    const createDataConnections = (positions: Float32Array, connectionCount: number, color: THREE.Color) => {
      const lineGeometry = new THREE.BufferGeometry();
      const linePositions = new Float32Array(connectionCount * 6); // 2 points par ligne, 3 coordonnées par point
      let lineIndex = 0;

      for (let i = 0; i < connectionCount; i++) {
        // Choisir deux indices de particules aléatoires
        const index1 = Math.floor(Math.random() * (positions.length / 3));
        const index2 = Math.floor(Math.random() * (positions.length / 3));
        
        // Coordonnées du premier point
        linePositions[lineIndex++] = positions[index1 * 3];
        linePositions[lineIndex++] = positions[index1 * 3 + 1];
        linePositions[lineIndex++] = positions[index1 * 3 + 2];
        
        // Coordonnées du deuxième point
        linePositions[lineIndex++] = positions[index2 * 3];
        linePositions[lineIndex++] = positions[index2 * 3 + 1];
        linePositions[lineIndex++] = positions[index2 * 3 + 2];
      }

      lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
      
      const lineMaterial = new THREE.LineBasicMaterial({ 
        color: color,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
      });
      
      const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      sceneRef.current!.add(lines);
    };

    // Animer la scène
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      
      if (!particlesRef.current || !cameraRef.current || !rendererRef.current) return;

      // Rotation lente des particules
      particlesRef.current.rotation.x += 0.0005;
      particlesRef.current.rotation.y += 0.0005;

      // Effet de mouvement basé sur la position de la souris
      if (mouseX.current !== 0 && mouseY.current !== 0) {
        particlesRef.current.rotation.x += (mouseY.current * 0.00005 - particlesRef.current.rotation.x) * 0.01;
        particlesRef.current.rotation.y += (mouseX.current * 0.00005 - particlesRef.current.rotation.y) * 0.01;
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    // Gestion du redimensionnement
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };

    // Gestion du mouvement de la souris
    const handleMouseMove = (event: MouseEvent) => {
      mouseX.current = event.clientX - window.innerWidth / 2;
      mouseY.current = event.clientY - window.innerHeight / 2;
    };

    // Initialiser la scène
    init();
    
    // Démarrer l'animation
    animate();

    // Nettoyage des ressources lors du démontage du composant
    return () => {
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      cancelAnimationFrame(frameIdRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`absolute inset-0 z-0 ${className || ''}`}
      style={{ overflow: 'hidden' }}
    />
  );
};

export default DataScene;