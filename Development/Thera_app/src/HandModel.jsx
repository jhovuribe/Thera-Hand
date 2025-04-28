// src/HandModel.jsx
import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export function HandModel({ isClosed }) {
  const group = useRef();
  const { scene } = useGLTF("/rigged_hand/scene.gltf");

  // New: useRef to store current rotation
  const targetRotation = useRef(0);
  const currentRotation = useRef(0);

  useEffect(() => {
    // When isClosed changes, update the target rotation
    targetRotation.current = isClosed ? 0.5 : 1;
  }, [isClosed]);

  useFrame(() => {
    if (!group.current) return;

    const rootJoint = group.current.getObjectByName("_rootJoint");
    if (!rootJoint) return;

    const fingerBones = {
      thumb: [
        "thumb_baseR_03", "thumb_01R_08", "thumb_02R_09", "thumb_03R_010" 
      ],
      index: [ 
       "index_baseR_012", "index_01R_017", "index_02R_018", "index_03R_019"
      ],
      middle: [
        "middle_baseR_020", "middle_01R_025", "middle_02R_026", "middle_03R_027",
      ],
      ring: [
        "ring_baseR_028", "ring_01R_033", "ring_02.R_034", "ring_03.R_035",
      ],
      pinky: [
        "pinky_baseR_036", "pinky_01R_041", "pinky_02R_042", "pinky_03R_043",
      ],
    };
    const boneRotationRanges = {
      "thumb_baseR_03": { start: -0.2, end: 1.2 },
      "thumb_01R_08": { start: -2, end: 2 },
      "thumb_02R_09": { start: 0, end: 1 },
      "thumb_03R_010": { start: 2, end: 0 },
    
      "index_baseR_012": { start: 0, end: 1 },
      "index_01R_017": { start: -1, end: -0.5 },
      "index_02R_018": { start: -1, end: 0 },
      "index_03R_019": { start: -0.5, end: 0 },
    
      "middle_baseR_020": { start: 0, end: 0 },
      "middle_01R_025": { start: 0, end: 0 },
      "middle_02R_026": { start: 0, end: 0 },
      "middle_03R_027": { start: 0, end: 0 },
    
      "ring_baseR_028": { start: 0, end: 0 },
      "ring_01R_033": { start: 0, end: 0 },
      "ring_02R_034": { start: 0, end: 0 },
      "ring_03R_035": { start: 0, end: 0 },
    
      "pinky_baseR_036": { start: 0, end: 0 },
      "pinky_01R_041": { start: 0, end: 0 },
      "pinky_02R_042": { start: 0, end: 0 },
      "pinky_03R_043": { start: 0, end: 0 },
    };
    
    
    // Gradually move currentRotation toward targetRotation
    const speed = 0.1;
    currentRotation.current += (targetRotation.current - currentRotation.current) * speed;
  
    Object.values(fingerBones).forEach((boneNames) => {
      boneNames.forEach((name) => {
        const bone = rootJoint.getObjectByName(name);
        if (bone) {
          const range = boneRotationRanges[name] || { start: 0, end: 0 };
  
          // Interpolate between start and end
          const interpolatedRotation = range.start + (range.end - range.start) * currentRotation.current;
  
          bone.rotation.x = interpolatedRotation;
        }
      });
    });
  });

  return <primitive ref={group} object={scene} scale={1.5} />;
}
