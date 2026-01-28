'use client';

import DynamicBackground from "./DynamicBackground";
import FloatingOrbs from "./FloatingOrbs";
import ConnectionNetwork from "./ConnectionNetwork";

export default function BackgroundLayer() {
  return (
    <>
      <DynamicBackground />
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -20 }}>
        <div className="absolute inset-0 bg-gradient-to-br from-lavenderViolet/5 via-transparent to-salmonPeach/5"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-softGold/3 via-transparent to-lavenderViolet/3"></div>
      </div>
      <FloatingOrbs />
      <ConnectionNetwork />
    </>
  );
}
