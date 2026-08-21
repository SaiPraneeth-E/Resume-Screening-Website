import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const AmbientBackground: React.FC = () => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    // Generate some random particles for the background
    const newParticles = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 10,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Cyan Glowing Light Beam Top Left */}
      <motion.div
        animate={{
          x: [0, 40, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[120px] mix-blend-screen"
      />

      {/* Indigo Glowing Light Beam Top Right */}
      <motion.div
        animate={{
          x: [0, -50, 0],
          y: [0, 60, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-indigo-500/15 rounded-full blur-[140px] mix-blend-screen"
      />

      {/* Emerald Glowing Light Beam Center Bottom */}
      <motion.div
        animate={{
          x: [0, 30, 0],
          y: [0, -40, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-10 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[130px] mix-blend-screen"
      />

      {/* Floating Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-cyan-400/40"
          style={{
            left: `${p.x}vw`,
            top: `${p.y}vh`,
            width: `${p.size}px`,
            height: `${p.size}px`,
          }}
          animate={{
            y: ['0vh', '-20vh'],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'linear',
          }}
        />
      ))}

      {/* Subtle Radial Grid Mesh Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e2d4a_1px,transparent_1px)] [background-size:32px_32px] opacity-20" />
    </div>
  );
};
