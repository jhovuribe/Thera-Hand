// src/HandModel.jsx
import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { SkeletonHelper } from "three";

export function HandModel({ isClosed }) {
  const group = useRef();
  const { scene } = useGLTF("/rigged_hand/scene.gltf");
  const { scene: threeScene } = useThree();

  const targetRotation = useRef(0);
  const currentRotation = useRef(0);

  useEffect(() => {
    targetRotation.current = isClosed ? 1 : 0;
  }, [isClosed]);

  useEffect(() => {
    if (group.current) {
      const helper = new SkeletonHelper(group.current);
      helper.visible = true;
      threeScene.add(helper);
    }
  }, [threeScene]);

  const fingerBones = {
    thumb: ["thumb_baseR_03", "thumb_01R_08", "thumb_02R_09", "thumb_03R_010"],
    index: ["index_baseR_012", "index_01R_017", "index_02R_018", "index_03R_019"],
    middle: ["middle_baseR_020", "middle_01R_025", "middle_02R_026", "middle_03R_027"],
    ring: ["ring_baseR_028", "ring_01R_033", "ring_02R_034", "ring_03R_035"],
    pinky: ["pinky_baseR_036", "pinky_01R_041", "pinky_02R_042", "pinky_03R_043"],
  };

  // Open (fully extended) vs Closed (relaxed) pose rotations
  const boneRotationTargets = {
    // Thumb
    thumb_baseR_03: { startX: 0.760, startY: 0.222, startZ: 0.653, endX: 0.760, endY: 0.222, endZ: 0.653 },
    thumb_01R_08: { startX: 0, startY: 0, startZ: 0, endX: 0.274, endY: -1.147, endZ: 0.707 },
    thumb_02R_09: { startX: 0, startY: 0, startZ: 0, endX: 0.257, endY: -0.099, endZ: 1.151 },
    thumb_03R_010: { startX: 0, startY: 0, startZ: 0, endX: 0.033, endY: 0.124, endZ: 1.039 },

    // Index
    index_baseR_012: { startX: 0.604, startY: 0.073, startZ: 0.157, endX: 0.604, endY: 0.073, endZ: 0.157 },
    index_01R_017: { startX: 0, startY: 0, startZ: 0, endX: -0.621, endY: 0.104, endZ: 0.766 },
    index_02R_018: { startX: 0, startY: 0, startZ: 0, endX: 0.016, endY: -0.296, endZ: 1.664 },
    index_03R_019: { startX: 0, startY: 0, startZ: 0, endX: 0.019, endY: -0.078, endZ: 1.443 },

    // Middle
    middle_baseR_020: { startX: 0.135, startY: -0.116, startZ: 0.093, endX: 0.135, endY: -0.116, endZ: 0.093 },
    middle_01R_025: { startX: 0, startY: 0, startZ: 0, endX: -0.128, endY: 0.039, endZ: 0.917 },
    middle_02R_026: { startX: 0, startY: 0, startZ: 0, endX: 0.103, endY: 0.027, endZ: 1.725 },
    middle_03R_027: { startX: 0, startY: 0, startZ: 0, endX: 0.041, endY: 0.060, endZ: 1.359 },

    // Ring
    ring_baseR_028: { startX: -0.455, startY: -0.036, startZ: 0.162, endX: -0.455, endY: -0.036, endZ: 0.162 },
    ring_01R_033: { startX: 0, startY: 0, startZ: 0, endX: 0.397, endY: -0.130, endZ: 0.851 },
    ring_02R_034: { startX: 0, startY: 0, startZ: 0, endX: 0.051, endY: 0.040, endZ: 1.437 },
    ring_03R_035: { startX: 0, startY: 0, startZ: 0, endX: 0.033, endY: 0.095, endZ: 1.319 },

    // Pinky
    pinky_baseR_036: { startX: -0.968, startY: -0.102, startZ: 0.246, endX: -0.968, endY: -0.102, endZ: 0.246 },
    pinky_01R_041: { startX: 0, startY: 0, startZ: 0, endX: 0.813, endY: -0.153, endZ: 0.657 },
    pinky_02R_042: { startX: 0, startY: 0, startZ: 0, endX: 0.292, endY: -0.067, endZ: 0.911 },
    pinky_03R_043: { startX: 0, startY: 0, startZ: 0, endX: 0.031, endY: 0.176, endZ: 0.980 },
  };

  const fingerDelay = {
    thumb: 0.0,
    index: 0.0,
    middle: 0.1,
    ring: 0.2,
    pinky: 0.3,
  };

  const easeInOutCubic = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  useFrame(() => {
    if (!group.current) return;

    const rootJoint = group.current.getObjectByName("_rootJoint");
    if (!rootJoint) return;

    const speed = 0.1;
    currentRotation.current += (targetRotation.current - currentRotation.current) * speed;

    Object.entries(fingerBones).forEach(([fingerName, boneNames]) => {
      const delay = fingerDelay[fingerName];
      const delayedProgress = Math.min(Math.max((currentRotation.current - delay) / (1 - delay), 0), 1);
      const easedProgress = easeInOutCubic(delayedProgress);

      boneNames.forEach((name) => {
        const bone = rootJoint.getObjectByName(name);
        if (bone) {
          const target = boneRotationTargets[name] || { startX: 0, startY: 0, startZ: 0, endX: 0, endY: 0, endZ: 0 };

          bone.rotation.x = target.startX + (target.endX - target.startX) * easedProgress;
          bone.rotation.y = target.startY + (target.endY - target.startY) * easedProgress;
          bone.rotation.z = target.startZ + (target.endZ - target.startZ) * easedProgress;
          // 🔵 IMPORTANT: No changes to position — so spacing remains correct!
        }
      });
    });
  });

  return <primitive ref={group} object={scene} scale={1.5} />;
}
