import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface CybersecurityBackgroundProps {
  width?: number;
  height?: number;
  autoStart?: boolean;
  onPhaseChange?: (phase: number) => void;
}

const CybersecurityBackground: React.FC<CybersecurityBackgroundProps> = ({
  width = window.innerWidth,
  height = window.innerHeight,
  autoStart = true,
  onPhaseChange
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const animationIdRef = useRef<number>();
  
  const [currentPhase, setCurrentPhase] = useState(1);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Particle systems and objects
  const binaryParticlesRef = useRef<THREE.Points>();
  const virusRef = useRef<THREE.Group>();
  const radarRef = useRef<THREE.Group>();
  const agentsRef = useRef<THREE.Group[]>([]);
  
  // Animation state
  const clockRef = useRef(new THREE.Clock());
  const phaseStartTimeRef = useRef(0);

  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 50;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Initialize phases
    initializeBinaryParticles();
    if (autoStart) {
      startSequence();
    }

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      const deltaTime = clockRef.current.getDelta();
      const elapsedTime = clockRef.current.getElapsedTime();
      
      updatePhase(deltaTime, elapsedTime);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [width, height, autoStart]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev.slice(-5), `> ${message}`]);
  };

  const initializeBinaryParticles = () => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Create ambient binary particles (Phase 1)
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100;     // x
      positions[i + 1] = (Math.random() - 0.5) * 100; // y
      positions[i + 2] = (Math.random() - 0.5) * 20;  // z
      
      velocities[i] = (Math.random() - 0.5) * 0.5;
      velocities[i + 1] = (Math.random() - 0.5) * 0.5;
      velocities[i + 2] = (Math.random() - 0.5) * 0.2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

    const material = new THREE.PointsMaterial({
      color: 0x00ff88,
      size: 0.8,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    binaryParticlesRef.current = particles;
    scene.add(particles);
  };

  const createVirus = () => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Create virus as a cluster of flickering symbols
    const virusGroup = new THREE.Group();
    const symbols = ['@', '!', '%', '#', '&', '*'];
    
    for (let i = 0; i < 15; i++) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 64;
      canvas.height = 64;
      
      if (context) {
        context.fillStyle = '#ff3333';
        context.font = '24px monospace';
        context.textAlign = 'center';
        context.fillText(symbols[Math.floor(Math.random() * symbols.length)], 32, 40);
      }

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({ 
        map: texture, 
        transparent: true,
        opacity: 0.1 + Math.random() * 0.3
      });
      
      const sprite = new THREE.Sprite(material);
      sprite.position.set(
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 2
      );
      sprite.scale.set(2, 2, 1);
      
      virusGroup.add(sprite);
    }

    // Position virus randomly
    virusGroup.position.set(
      (Math.random() - 0.5) * 60,
      (Math.random() - 0.5) * 60,
      (Math.random() - 0.5) * 10
    );

    virusRef.current = virusGroup;
    scene.add(virusGroup);
  };

  const createRadar = () => {
    const scene = sceneRef.current;
    if (!scene) return;

    const radarGroup = new THREE.Group();
    
    // Create radar rings
    for (let i = 1; i <= 3; i++) {
      const geometry = new THREE.RingGeometry(i * 15, i * 15 + 0.5, 64);
      const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
      });
      
      const ring = new THREE.Mesh(geometry, material);
      ring.rotation.x = Math.PI / 2;
      radarGroup.add(ring);
    }

    // Radar sweep line
    const sweepGeometry = new THREE.PlaneGeometry(50, 0.2);
    const sweepMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.8
    });
    
    const sweep = new THREE.Mesh(sweepGeometry, sweepMaterial);
    sweep.rotation.x = Math.PI / 2;
    radarGroup.add(sweep);

    radarRef.current = radarGroup;
    scene.add(radarGroup);
  };

  const createAgents = () => {
    const scene = sceneRef.current;
    if (!scene || !virusRef.current) return;

    const agentGroups: THREE.Group[] = [];
    const spawnPoints = [
      { x: -40, y: 30 }, { x: 40, y: 30 }, { x: -40, y: -30 }, { x: 40, y: -30 },
      { x: 0, y: 40 }, { x: 0, y: -40 }, { x: -30, y: 0 }, { x: 30, y: 0 }
    ];

    spawnPoints.forEach((point, index) => {
      const agentGroup = new THREE.Group();
      
      // Create formation of binary code agents
      for (let i = 0; i < 8; i++) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 32;
        canvas.height = 32;
        
        if (context) {
          context.fillStyle = '#00aaff';
          context.font = '12px monospace';
          context.textAlign = 'center';
          context.fillText(Math.random() > 0.5 ? '1' : '0', 16, 20);
        }

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ 
          map: texture, 
          transparent: true 
        });
        
        const sprite = new THREE.Sprite(material);
        sprite.position.set(
          (i % 4 - 1.5) * 1.5,
          Math.floor(i / 4) * 1.5,
          0
        );
        sprite.scale.set(1, 1, 1);
        
        agentGroup.add(sprite);
      }

      agentGroup.position.set(point.x, point.y, 0);
      agentGroups.push(agentGroup);
      scene.add(agentGroup);
    });

    agentsRef.current = agentGroups;
  };

  const updatePhase = (deltaTime: number, elapsedTime: number) => {
    if (!sceneRef.current) return;

    const phaseTime = elapsedTime - phaseStartTimeRef.current;

    switch (currentPhase) {
      case 1: // Ambient particles
        updateBinaryParticles(deltaTime);
        if (phaseTime > 3) {
          nextPhase();
        }
        break;

      case 2: // Virus appears
        updateBinaryParticles(deltaTime);
        updateVirus(deltaTime, phaseTime);
        if (phaseTime > 2) {
          nextPhase();
        }
        break;

      case 3: // Radar scanning
        updateBinaryParticles(deltaTime);
        updateVirus(deltaTime, phaseTime);
        updateRadar(deltaTime, phaseTime);
        if (phaseTime > 4) {
          nextPhase();
        }
        break;

      case 4: // Confirmation & Lock
        updateBinaryParticles(deltaTime);
        updateVirus(deltaTime, phaseTime);
        updateRadar(deltaTime, phaseTime);
        if (phaseTime > 2) {
          nextPhase();
        }
        break;

      case 5: // Agent deployment
        updateBinaryParticles(deltaTime);
        updateVirus(deltaTime, phaseTime);
        updateRadar(deltaTime, phaseTime);
        updateAgents(deltaTime, phaseTime);
        if (phaseTime > 5) {
          nextPhase();
        }
        break;

      case 6: // Digital termination
        updateBinaryParticles(deltaTime);
        updateTermination(deltaTime, phaseTime);
        if (phaseTime > 3) {
          nextPhase();
        }
        break;

      case 7: // Stabilization
        updateBinaryParticles(deltaTime);
        if (phaseTime > 2) {
          // Reset to phase 1 for loop
          setCurrentPhase(1);
          phaseStartTimeRef.current = elapsedTime;
          resetScene();
        }
        break;
    }
  };

  const updateBinaryParticles = (deltaTime: number) => {
    if (!binaryParticlesRef.current) return;

    const positions = binaryParticlesRef.current.geometry.attributes.position.array as Float32Array;
    const velocities = binaryParticlesRef.current.geometry.attributes.velocity.array as Float32Array;

    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += velocities[i] * deltaTime * 20;
      positions[i + 1] += velocities[i + 1] * deltaTime * 20;
      positions[i + 2] += velocities[i + 2] * deltaTime * 20;

      // Wrap around
      if (Math.abs(positions[i]) > 50) velocities[i] *= -1;
      if (Math.abs(positions[i + 1]) > 50) velocities[i + 1] *= -1;
      if (Math.abs(positions[i + 2]) > 10) velocities[i + 2] *= -1;
    }

    binaryParticlesRef.current.geometry.attributes.position.needsUpdate = true;
  };

  const updateVirus = (deltaTime: number, phaseTime: number) => {
    if (!virusRef.current) return;

    // Stealth movement
    virusRef.current.position.x += Math.sin(phaseTime * 0.5) * 0.1;
    virusRef.current.position.y += Math.cos(phaseTime * 0.3) * 0.05;

    // Flickering opacity
    virusRef.current.children.forEach((child) => {
      if (child instanceof THREE.Sprite) {
        const material = child.material as THREE.SpriteMaterial;
        material.opacity = 0.1 + Math.sin(phaseTime * 10 + Math.random()) * 0.3;
      }
    });

    // React to radar detection (phase 3+)
    if (currentPhase >= 3) {
      virusRef.current.children.forEach((child) => {
        if (child instanceof THREE.Sprite) {
          const material = child.material as THREE.SpriteMaterial;
          material.opacity *= 0.5; // Try to hide
        }
      });
    }
  };

  const updateRadar = (deltaTime: number, phaseTime: number) => {
    if (!radarRef.current) return;

    // Rotate radar sweep
    radarRef.current.children[3]?.rotateZ(deltaTime * 2);

    // Pulse rings
    radarRef.current.children.forEach((child, index) => {
      if (index < 3 && child instanceof THREE.Mesh) {
        const material = child.material as THREE.MeshBasicMaterial;
        material.opacity = 0.2 + Math.sin(phaseTime * 3 + index) * 0.2;
      }
    });
  };

  const updateAgents = (deltaTime: number, phaseTime: number) => {
    if (!agentsRef.current || !virusRef.current) return;

    const virusPos = virusRef.current.position;

    agentsRef.current.forEach((agent, index) => {
      // Move agents toward virus
      const direction = new THREE.Vector3().subVectors(virusPos, agent.position).normalize();
      agent.position.add(direction.multiplyScalar(deltaTime * 10));

      // Add some formation behavior
      agent.children.forEach((child, childIndex) => {
        child.position.x += Math.sin(phaseTime * 2 + childIndex) * 0.01;
      });
    });
  };

  const updateTermination = (deltaTime: number, phaseTime: number) => {
    if (!virusRef.current) return;

    // Virus destruction animation
    virusRef.current.children.forEach((child, index) => {
      if (child instanceof THREE.Sprite) {
        child.position.y += deltaTime * 5;
        const material = child.material as THREE.SpriteMaterial;
        material.opacity = Math.max(0, 1 - phaseTime * 0.5);
      }
    });

    // Create explosion effect
    if (phaseTime < 1) {
      // Add explosion particles here
    }
  };

  const nextPhase = () => {
    const newPhase = currentPhase + 1;
    setCurrentPhase(newPhase);
    phaseStartTimeRef.current = clockRef.current.getElapsedTime();
    
    onPhaseChange?.(newPhase);

    // Phase-specific initializations
    switch (newPhase) {
      case 2:
        createVirus();
        addLog("System monitoring initiated...");
        break;
      case 3:
        createRadar();
        addLog("Anomaly detected - initiating scan...");
        break;
      case 4:
        addLog("✴ Suspicious node signature verified");
        addLog("Threat level escalated: class B [worm.sig]");
        break;
      case 5:
        createAgents();
        addLog("Deploying security agents...");
        break;
      case 6:
        addLog("Code fragment injected...");
        addLog("☠️ Virus terminated");
        break;
      case 7:
        addLog("[✓] MachiNode System Status: SECURE");
        break;
    }
  };

  const resetScene = () => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clean up previous phase objects
    if (virusRef.current) {
      scene.remove(virusRef.current);
      virusRef.current = undefined;
    }
    if (radarRef.current) {
      scene.remove(radarRef.current);
      radarRef.current = undefined;
    }
    agentsRef.current.forEach(agent => scene.remove(agent));
    agentsRef.current = [];

    setLogs([]);
  };

  const startSequence = () => {
    setCurrentPhase(1);
    phaseStartTimeRef.current = clockRef.current.getElapsedTime();
    resetScene();
  };

  return (
    <div className="cybersecurity-background" style={{ position: 'relative', width, height }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      
      {/* CLI Overlay */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        fontFamily: 'monospace',
        color: '#00ff88',
        fontSize: '12px',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '10px',
        borderRadius: '5px',
        minWidth: '300px',
        pointerEvents: 'none'
      }}>
        <div>Phase {currentPhase}/7</div>
        {logs.map((log, index) => (
          <div key={index} style={{ opacity: 1 - index * 0.2 }}>
            {log}
          </div>
        ))}
      </div>

      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '10px',
        borderRadius: '5px'
      }}>
        <button
          onClick={startSequence}
          style={{
            background: '#00ff88',
            color: '#000',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '3px',
            fontFamily: 'monospace',
            cursor: 'pointer'
          }}
        >
          Restart Sequence
        </button>
      </div>
    </div>
  );
};

export default CybersecurityBackground;