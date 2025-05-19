import React, { useEffect, useRef } from 'react';

interface CyberThreatMapProps {
  highContrastMode?: boolean;
}

const CyberThreatMap: React.FC<CyberThreatMapProps> = ({ highContrastMode = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Configuration de la taille du canvas
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Configuration des couleurs
    const colors = highContrastMode 
      ? { 
          dotColor: '#ffffff', 
          lineColor: '#ffffff',
          attackColor: '#ff0000',
          glowColor: 'rgba(255, 255, 255, 0.3)'
        } 
      : { 
          dotColor: '#0fb3d1', 
          lineColor: 'rgba(15, 179, 209, 0.5)',
          attackColor: '#ff3860',
          glowColor: 'rgba(15, 179, 209, 0.2)'
        };
    
    // Classe pour représenter les nœuds
    class Node {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      connections: Node[];
      isAttacked: boolean;
      attackAnimationProgress: number;
      
      constructor(x: number, y: number, size: number) {
        this.x = x;
        this.y = y;
        this.size = size;
        // Vitesse aléatoire entre -0.2 et 0.2
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.connections = [];
        this.isAttacked = false;
        this.attackAnimationProgress = 0;
      }
      
      update(width: number, height: number) {
        // Mise à jour de la position
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Rebond sur les bords
        if (this.x < 0 || this.x > width) this.speedX *= -1;
        if (this.y < 0 || this.y > height) this.speedY *= -1;
        
        // Animation d'attaque
        if (this.isAttacked) {
          this.attackAnimationProgress += 0.02;
          if (this.attackAnimationProgress >= 1) {
            this.isAttacked = false;
            this.attackAnimationProgress = 0;
            
            // Propagation de l'attaque vers les nœuds connectés
            if (Math.random() < 0.3) { // 30% de chance de propager
              const connectedNodes = this.connections.filter(n => !n.isAttacked);
              if (connectedNodes.length > 0) {
                const targetNode = connectedNodes[Math.floor(Math.random() * connectedNodes.length)];
                targetNode.isAttacked = true;
              }
            }
          }
        }
      }
      
      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        
        // Couleur basée sur l'état d'attaque
        if (this.isAttacked) {
          const gradient = ctx.createRadialGradient(
            this.x, this.y, 0, 
            this.x, this.y, this.size * (2 + this.attackAnimationProgress * 3)
          );
          gradient.addColorStop(0, colors.attackColor);
          gradient.addColorStop(1, 'rgba(255, 56, 96, 0)');
          
          ctx.fillStyle = gradient;
          ctx.arc(this.x, this.y, this.size * (2 + this.attackAnimationProgress * 3), 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Dessin du nœud
        ctx.beginPath();
        ctx.fillStyle = this.isAttacked ? colors.attackColor : colors.dotColor;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow effect
        ctx.beginPath();
        const glow = ctx.createRadialGradient(
          this.x, this.y, this.size, 
          this.x, this.y, this.size * 3
        );
        glow.addColorStop(0, this.isAttacked ? 'rgba(255, 56, 96, 0.3)' : colors.glowColor);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = glow;
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      
      drawConnections(ctx: CanvasRenderingContext2D) {
        this.connections.forEach(node => {
          ctx.beginPath();
          
          // Déterminer si cette connexion est attaquée
          const isConnectionAttacked = this.isAttacked && node.isAttacked;
          
          if (isConnectionAttacked) {
            ctx.strokeStyle = colors.attackColor;
            ctx.lineWidth = 2;
            
            // Animation de l'attaque sur la ligne
            const gradient = ctx.createLinearGradient(this.x, this.y, node.x, node.y);
            gradient.addColorStop(0, colors.attackColor);
            gradient.addColorStop(this.attackAnimationProgress, colors.attackColor);
            gradient.addColorStop(this.attackAnimationProgress + 0.1, colors.lineColor);
            gradient.addColorStop(1, colors.lineColor);
            
            ctx.strokeStyle = gradient;
          } else {
            ctx.strokeStyle = colors.lineColor;
            ctx.lineWidth = 1;
          }
          
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(node.x, node.y);
          ctx.stroke();
        });
      }
    }
    
    // Création des nœuds
    const nodeCount = Math.floor(canvas.width * canvas.height / 15000); // Densité adaptée à la taille
    const nodes: Node[] = [];
    
    for (let i = 0; i < nodeCount; i++) {
      const size = Math.random() * 1.5 + 1; // Taille entre 1 et 2.5
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      nodes.push(new Node(x, y, size));
    }
    
    // Création des connexions entre les nœuds proches
    const connectionDistance = 150;
    nodes.forEach(node => {
      nodes.forEach(otherNode => {
        if (node !== otherNode) {
          const dx = node.x - otherNode.x;
          const dy = node.y - otherNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < connectionDistance) {
            node.connections.push(otherNode);
          }
        }
      });
    });
    
    // Simuler des attaques aléatoires
    const startRandomAttacks = () => {
      setInterval(() => {
        if (nodes.length > 0) {
          const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
          if (!randomNode.isAttacked) {
            randomNode.isAttacked = true;
          }
        }
      }, 1500); // Nouvelle attaque toutes les 1.5 secondes
    };
    
    startRandomAttacks();
    
    // Animation principale
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Dessiner d'abord toutes les connexions
      nodes.forEach(node => {
        node.drawConnections(ctx);
      });
      
      // Puis dessiner tous les nœuds
      nodes.forEach(node => {
        node.update(canvas.width, canvas.height);
        node.draw(ctx);
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [highContrastMode]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.7 }}
    />
  );
};

export default CyberThreatMap;