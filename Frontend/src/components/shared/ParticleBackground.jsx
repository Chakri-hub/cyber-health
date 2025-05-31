import React, { useEffect, useRef } from 'react';
import './ParticleBackground.css';

function ParticleBackground({ children }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    // Initialize particles
    const initParticles = () => {
      particles = [];
      const particleCount = Math.min(100, Math.floor((canvas.width * canvas.height) / 9000)); // Adjust count based on screen size
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 1,
          vx: Math.random() * 2 - 1,
          vy: Math.random() * 2 - 1,
          color: `rgba(${Math.floor(Math.random() * 100) + 155}, ${Math.floor(Math.random() * 100) + 155}, ${Math.floor(Math.random() * 100) + 155}, ${Math.random() * 0.3 + 0.2})` // Light colors with transparency
        });
      }
    };
    
    // Draw particles and connections
    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particles.forEach((particle, i) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        
        // Draw connections
        particles.forEach((particle2, j) => {
          if (i === j) return;
          const dx = particle.x - particle2.x;
          const dy = particle.y - particle2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) { // Connection distance threshold
            ctx.beginPath();
            ctx.strokeStyle = `rgba(150, 150, 150, ${0.2 * (1 - distance / 120)})`; // Fade out with distance
            ctx.lineWidth = 0.5;
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(particle2.x, particle2.y);
            ctx.stroke();
          }
        });
      });
      
      animationFrameId = requestAnimationFrame(drawParticles);
    };
    
    // Handle resize
    window.addEventListener('resize', () => {
      resizeCanvas();
      initParticles();
    });
    
    // Initialize
    resizeCanvas();
    initParticles();
    drawParticles();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return (
    <div className="particle-background-wrapper">
      <canvas ref={canvasRef} className="particle-canvas"></canvas>
      <div className="particle-content">
        {children}
      </div>
    </div>
  );
}

export default React.memo(ParticleBackground); // Prevent unnecessary re-renders