import React, { useEffect, useState } from 'react';
import './AnimatedBackground.css';

const AnimatedBackground = () => {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    // Generate fewer particles to reduce GPU load
    const newParticles = [];
    // Only create 3 particles instead of 5 to reduce GPU usage
    for (let i = 0; i < 3; i++) {
      newParticles.push({
        id: i,
        // Use larger particles but fewer of them
        size: Math.floor(Math.random() * 80) + 60,
        left: `${Math.floor(Math.random() * 90)}%`,
        top: `${Math.floor(Math.random() * 90)}%`,
        // Use longer animation durations to reduce GPU work
        animationDuration: `${Math.floor(Math.random() * 10) + 20}s`,
        animationDelay: `${Math.floor(Math.random() * 5)}s`
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <div className="animated-background">
      <div className="cyber-particles">
        {particles.map((particle) => (
          <div 
            key={particle.id}
            className="cyber-particle"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: particle.left,
              top: particle.top,
              animationDuration: particle.animationDuration,
              animationDelay: particle.animationDelay
            }}
          />
        ))}
      </div>
      <div className="gradient-overlay"></div>
    </div>
  );
};

export default AnimatedBackground;