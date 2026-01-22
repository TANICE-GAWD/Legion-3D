import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Float, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';

// Generic male avatar from Ready Player Me (Stable 2024 - Verified)
const AVATAR_URL = "https://models.readyplayer.me/64e3055495439dfcf3f0b665.glb";

const AvatarModel = ({ isSpeaking }) => {
  const { scene } = useGLTF(AVATAR_URL);
  const headMeshRef = useRef();
  
  // Clone scene to avoid shared state issues
  const clone = React.useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    // Find the mesh with morph targets for the mouth
    clone.traverse((child) => {
      if (child.isMesh && child.morphTargetDictionary) {
        if (child.name.includes('Head') || child.name.includes('Teeth') || child.name.includes('Wolf3D_Avatar')) {
            headMeshRef.current = child;
        }
      }
    });
  }, [clone]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Slight natural head movement (idle)
    const headRotationX = Math.sin(t * 1) * 0.02;
    const headRotationY = Math.sin(t * 0.5) * 0.05;
    
    // Ideally we would rotate the specific bone, but rotating the whole model slightly mimics it for now
    clone.rotation.y = headRotationY;
    clone.rotation.x = headRotationX;

    // Talking Animation (Simple Sine Wave)
    if (headMeshRef.current && headMeshRef.current.morphTargetDictionary && headMeshRef.current.morphTargetInfluences) {
        // Try to find the correct morph target for mouth opening
        const mouthOpenIndex = headMeshRef.current.morphTargetDictionary['mouthOpen'] || 
                               headMeshRef.current.morphTargetDictionary['viseme_aa'] ||
                               headMeshRef.current.morphTargetDictionary['jawOpen'];
        
        if (mouthOpenIndex !== undefined) {
             const targetOpen = isSpeaking ? (Math.sin(t * 20) * 0.6 + 0.2) : 0;
             headMeshRef.current.morphTargetInfluences[mouthOpenIndex] = THREE.MathUtils.lerp(
                headMeshRef.current.morphTargetInfluences[mouthOpenIndex],
                targetOpen,
                0.2
             );
        }
    }
  });

  // CRITICAL FRAMING:
  // Model Height: ~1.8m (Eyes at ~1.65m)
  // Scale: 3.5 (Zoom level)
  // Eye Height Scaled: 1.65 * 3.5 = 5.775m
  // To center Eyes at Y=0, we must move Y down by -5.7m
  // We add a small offset to lower it slightly so eyes are at top 1/3rd (Y=+0.5)
  // Adjusted Position: -5.0
  return <primitive object={clone} scale={3.5} position={[0, -5.2, 0]} />;
};

export const Avatar3D = ({ isSpeaking }) => {
  return (
    <div className="w-full h-full absolute inset-0 bg-gradient-to-b from-transparent to-black/10">
      <Canvas camera={{ position: [0, 0.2, 1], fov: 40 }}>
        {/* Cinematic Lighting Setup */}
        <ambientLight intensity={0.8} />
        <spotLight position={[2, 5, 5]} angle={0.4} penumbra={0.5} intensity={1.5} color="#ffffff" />
        <pointLight position={[-5, 2, -5]} intensity={1} color="#d4d4ff" />
        <pointLight position={[5, -2, -5]} intensity={0.5} color="#ffd4d4" />
        
        <Suspense fallback={
            <Html center>
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-slate-600 font-bold text-sm">Loading Avatar...</span>
                </div>
            </Html>
        }>
            <group position={[0, -0.2, 0]}>
                <AvatarModel isSpeaking={isSpeaking} />
            </group>
        </Suspense>
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};

// Preload to ensure smooth texture loading
useGLTF.preload(AVATAR_URL);
