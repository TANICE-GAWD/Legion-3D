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

    if (!headMeshRef.current) {
      console.warn('AvatarView: Could not find head mesh with morph targets.');
    } else {
      console.log('AvatarView: Using mesh for lip sync:', headMeshRef.current.name);
      console.log('Available morph targets:', Object.keys(headMeshRef.current.morphTargetDictionary));
    }
  }, [clone]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Stronger natural head/body movement so motion is clearly visible
    const headRotationX = Math.sin(t * 1) * 0.08;
    const headRotationY = Math.sin(t * 0.5) * 0.12;
    
    clone.rotation.y = headRotationY;
    clone.rotation.x = headRotationX;

    // Talking Animation (Simple Sine Wave on mouth / jaw blendshape)
    if (headMeshRef.current && headMeshRef.current.morphTargetDictionary && headMeshRef.current.morphTargetInfluences) {
        const dict = headMeshRef.current.morphTargetDictionary;

        // First try common Ready Player Me / viseme names
        let mouthOpenIndex =
          dict['mouthOpen'] ??
          dict['viseme_aa'] ??
          dict['jawOpen'];

        // If not found, fall back to any morph target that looks like a mouth/jaw/viseme target
        if (mouthOpenIndex === undefined) {
          const mouthKey = Object.keys(dict).find((key) => {
            const k = key.toLowerCase();
            return k.includes('jaw') || k.includes('mouth') || k.includes('viseme') || k.includes('aa');
          });
          if (mouthKey) {
            mouthOpenIndex = dict[mouthKey];
          }
        }
        
        if (mouthOpenIndex !== undefined) {
             const targetOpen = isSpeaking ? (Math.sin(t * 20) * 0.6 + 0.3) : 0;
             headMeshRef.current.morphTargetInfluences[mouthOpenIndex] = THREE.MathUtils.lerp(
                headMeshRef.current.morphTargetInfluences[mouthOpenIndex],
                targetOpen,
                0.3
             );
        }
    }
  });

  // Move the avatar up so the camera sees more of the torso and face
  return <primitive object={clone} scale={1} position={[0, 0.6, 0]} />;
};

export const AvatarView = ({ isSpeaking }) => {
  return (
    <div className="w-full h-full absolute inset-0 bg-gradient-to-b from-blue-50 to-purple-100">
      <Canvas
        camera={{ position: [0, 1.6, 2.2], fov: 30 }}
        onCreated={({ gl, camera }) => {
          // Disable shader error checking logs to avoid noisy X4122/X4008 warnings
          if (gl && gl.debug) {
            gl.debug.checkShaderErrors = false;
          }
          // Look slightly down towards the head area
          camera.lookAt(0, 1.2, 0);
        }}
      >
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-3, 3, 2]} intensity={0.5} />
        
        <Suspense fallback={
            <Html center>
                <div className="text-slate-600 font-bold">Loading...</div>
            </Html>
        }>
            <AvatarModel isSpeaking={isSpeaking} />
        </Suspense>
        
        <Environment preset="apartment" />
      </Canvas>
    </div>
  );
};

// Preload to ensure smooth texture loading
useGLTF.preload(AVATAR_URL);
