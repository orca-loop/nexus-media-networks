// SHARED FILE (Part 1 owns). Do not edit from other parts.
export const scrollState = {
  progress: 0,            // global 0..1
  velocity: 0,            // smoothed scroll speed, roughly 0..1
  pointer: { x: 0, y: 0 },// normalized -1..1, y up
  scenes: { hero:0, street:0, dooh:0, transit:0, society:0, tower:0, map:0, process:0, contact:0 }, // local 0..1 per scene
  quality: 'high',        // 'high' | 'low' (low = mobile/weak device: fewer particles, simpler geometry)
  isMobile: false,
};
