// src/HandModel.jsx
import React from "react";
import { useGLTF } from "@react-three/drei";

export function HandModel() {
  const { scene } = useGLTF("/rigged_hand/scene.gltf");  // path is PUBLIC folder!

  return <primitive object={scene} scale={1.5} />;
}

