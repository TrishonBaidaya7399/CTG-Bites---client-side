"use client";
import { motion } from "framer-motion";

/** Decorative floating spice orbs in the auth background */
export function AuthScene() {
  const orbs = [
    { size: 320, x: "-15%", y: "-20%", color: "#E8622A", opacity: 0.12, duration: 8 },
    { size: 200, x: "80%",  y: "70%",  color: "#F07B45", opacity: 0.10, duration: 10 },
    { size: 140, x: "70%",  y: "-10%", color: "#4A7C59", opacity: 0.08, duration: 7  },
    { size: 100, x: "5%",   y: "80%",  color: "#E8622A", opacity: 0.07, duration: 9  },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(#F5F0E8 1px,transparent 1px),linear-gradient(90deg,#F5F0E8 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glowing orbs */}
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            opacity: orb.opacity,
            filter: "blur(40px)",
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [orb.opacity, orb.opacity * 1.5, orb.opacity] }}
          transition={{ duration: orb.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Floating spice dots */}
      {[...Array(18)].map((_, i) => (
        <motion.div
          key={`dot-${i}`}
          className="absolute rounded-full bg-brand-orange"
          style={{
            width: 3 + (i % 4),
            height: 3 + (i % 4),
            left: `${(i * 5.7 + 3) % 95}%`,
            top: `${(i * 7.3 + 5) % 90}%`,
            opacity: 0.15 + (i % 5) * 0.04,
          }}
          animate={{ y: [0, -12 - (i % 8), 0], opacity: [0.15, 0.35, 0.15] }}
          transition={{
            duration: 3 + (i % 4),
            delay: i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
