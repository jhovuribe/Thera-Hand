// src/HandModel.jsx
import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { SkeletonHelper } from "three";

export function HandModel({ isClosed }) {
  const group = useRef();
  const { scene } = useGLTF("/rigged_hand/scene.gltf");
  const { scene: threeScene, clock } = useThree();

  const targetRotation = useRef(0);
  const currentRotation = useRef(0);

  useEffect(() => {
    targetRotation.current = isClosed ? 1 : 0;
  }, [isClosed]);

  // ✅ Add SkeletonHelper to see bones
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

  const boneRotationTargets = {
    // Thumb
    "thumb_baseR_03": { startX: 0.760, endX: 0.360, startY: 0.222, endY: 0.522, startZ: 0.653, endZ: 0.853 },
    "thumb_01R_08": { startX: 0.274, endX: -0.2, startY: -1.147, endY: -0.847, startZ: 0.707, endZ: 0.907 },
    "thumb_02R_09": { startX: 0.257, endX: -0.2, startY: -0.099, endY: 0.101, startZ: 1.151, endZ: 1.351 },
    "thumb_03R_010": { startX: 0.033, endX: -0.2, startY: 0.124, endY: 0.324, startZ: 1.039, endZ: 1.239 },

    // Index
    "index_baseR_012": { startX: 0.604, endX: 0.104, startY: 0.073, endY: 0.173, startZ: 0.157, endZ: 0.357 },
    "index_01R_017": { startX: -0.621, endX: -1.221, startY: 0.104, endY: 0.204, startZ: 0.766, endZ: 0.966 },
    "index_02R_018": { startX: 0.016, endX: -0.484, startY: -0.296, endY: -0.196, startZ: 1.664, endZ: 1.864 },
    "index_03R_019": { startX: 0.019, endX: -0.381, startY: -0.078, endY: 0.022, startZ: 1.443, endZ: 1.643 },

    // Middle
    "middle_baseR_020": { startX: 0.135, endX: -0.265, startY: -0.116, endY: 0.084, startZ: 0.093, endZ: 0.293 },
    "middle_01R_025": { startX: -0.128, endX: -0.728, startY: 0.039, endY: 0.139, startZ: 0.917, endZ: 1.117 },
    "middle_02R_026": { startX: 0.103, endX: -0.497, startY: 0.027, endY: 0.127, startZ: 1.725, endZ: 1.925 },
    "middle_03R_027": { startX: 0.041, endX: -0.359, startY: 0.060, endY: 0.160, startZ: 1.359, endZ: 1.559 },

    // Ring
    "ring_baseR_028": { startX: -0.455, endX: -0.855, startY: -0.036, endY: 0.164, startZ: 0.162, endZ: 0.362 },
    "ring_01R_033": { startX: 0.397, endX: -0.203, startY: -0.130, endY: 0.070, startZ: 0.851, endZ: 1.051 },
    "ring_02R_034": { startX: 0.051, endX: -0.349, startY: 0.040, endY: 0.140, startZ: 1.437, endZ: 1.637 },
    "ring_03R_035": { startX: 0.033, endX: -0.367, startY: 0.095, endY: 0.195, startZ: 1.319, endZ: 1.519 },

    // Pinky (gentle motion)
    "pinky_baseR_036": { startX: -0.968, endX: -1.068, startY: -0.102, endY: 0.098, startZ: 0.246, endZ: 0.446 },
    "pinky_01R_041": { startX: 0.813, endX: 0.613, startY: -0.153, endY: 0.047, startZ: 0.657, endZ: 0.857 },
    "pinky_02R_042": { startX: 0.292, endX: 0.092, startY: -0.067, endY: 0.133, startZ: 0.911, endZ: 1.111 },
    "pinky_03R_043": { startX: 0.031, endX: -0.069, startY: 0.176, endY: 0.376, startZ: 0.980, endZ: 1.180 },
  };

  const fingerDelay = {
    thumb: 0.0,
    index: 0.0,
    middle: 0.1,
    ring: 0.2,
    pinky: 0.3,
  };

  // ✅ Easing function: ease in-out cubic
  const easeInOutCubic = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  useFrame(() => {
    if (!group.current) return;

    const rootJoint = group.current.getObjectByName("_rootJoint");
    if (!rootJoint) return;

    // Smooth currentRotation toward targetRotation
    const speed = 0.1;
    currentRotation.current += (targetRotation.current - currentRotation.current) * speed;

    Object.entries(fingerBones).forEach(([fingerName, boneNames]) => {
      const delay = fingerDelay[fingerName];
      const delayedProgress = Math.min(Math.max((currentRotation.current - delay) / (1 - delay), 0), 1);

      const easedProgress = easeInOutCubic(delayedProgress);

      boneNames.forEach((name) => {
        const bone = rootJoint.getObjectByName(name);
        if (bone) {
          const target = boneRotationTargets[name] || { startX: 0, endX: 0, startY: 0, endY: 0, startZ: 0, endZ: 0 };

          bone.rotation.x = target.startX + (target.endX - target.startX) * easedProgress;
          bone.rotation.y = target.startY + (target.endY - target.startY) * easedProgress;
          bone.rotation.z = target.startZ + (target.endZ - target.startZ) * easedProgress;
        }
      });
    });
  });

  return <primitive ref={group} object={scene} scale={1.5} />;
}
