import React, { useEffect, useRef } from 'react';
import './EnhancedParticleBackground.css';

function EnhancedParticleBackground({ children }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let mousePosition = {
      x: null,
      y: null
    };
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    // Initialize particles
    const initParticles = () => {
      particles = [];
      const particleCount = Math.min(120, Math.floor((canvas.width * canvas.height) / 8000)); // Slightly more particles
      
      for (let i = 0; i < particleCount; i++) {
        const size = Math.random() * 3 + 1;
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: size,
          originalRadius: size, // Store original size for mouse interaction
          vx: Math.random() * 1 - 0.5,
          vy: Math.random() * 1 - 0.5,
          color: `rgba(${Math.floor(Math.random() * 100) + 155}, ${Math.floor(Math.random() * 100) + 155}, ${Math.floor(Math.random() * 100) + 155}, ${Math.random() * 0.3 + 0.2})` // Light colors with transparency
        });
      }
    };
    
    // Handle mouse movement
    const handleMouseMove = (e) => {
      mousePosition.x = e.clientX;
      mousePosition.y = e.clientY;
    };
    
    // Handle mouse leave
    const handleMouseLeave = () => {
      mousePosition.x = null;
      mousePosition.y = null;
    };
    
    // Draw particles and connections
    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particles.forEach((particle, i) => {
        // Update position with slight randomness for more organic movement
        particle.x += particle.vx + (Math.random() * 0.2 - 0.1);
        particle.y += particle.vy + (Math.random() * 0.2 - 0.1);
        
        // Bounce off edges with slight angle change
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -1;
          particle.vx += (Math.random() * 0.1 - 0.05); // Add slight randomness to bounce
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -1;
          particle.vy += (Math.random() * 0.1 - 0.05); // Add slight randomness to bounce
        }
        
        // Mouse interaction - particles grow and accelerate near mouse
        if (mousePosition.x && mousePosition.y) {
          const dx = mousePosition.x - particle.x;
          const dy = mousePosition.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) {
            // Grow particles near mouse
            const scale = 1 + (120 - distance) / 120;
            particle.radius = particle.originalRadius * scale;
            
            // Slight attraction to mouse
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (120 - distance) / 1200;
            particle.vx += forceDirectionX * force;
            particle.vy += forceDirectionY * force;
            
            // Limit velocity
            const maxVel = 2;
            const vel = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
            if (vel > maxVel) {
              particle.vx = (particle.vx / vel) * maxVel;
              particle.vy = (particle.vy / vel) * maxVel;
            }
          } else {
            // Return to original size when away from mouse
            particle.radius = particle.originalRadius;
          }
        } else {
          // Return to original size when mouse leaves canvas
          particle.radius = particle.originalRadius;
        }
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        
        // Draw connections with gradient
        particles.forEach((particle2, j) => {
          if (i === j) return;
          const dx = particle.x - particle2.x;
          const dy = particle.y - particle2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) { // Increased connection distance
            // Create gradient for connection line
            const gradient = ctx.createLinearGradient(
              particle.x, particle.y, particle2.x, particle2.y
            );
            
            // Extract colors from particles for gradient
            const color1 = particle.color.replace('rgba(', '').replace(')', '').split(',');
            const color2 = particle2.color.replace('rgba(', '').replace(')', '').split(',');
            
            gradient.addColorStop(0, `rgba(${color1[0]}, ${color1[1]}, ${color1[2]}, ${0.2 * (1 - distance / 150)})`);
            gradient.addColorStop(1, `rgba(${color2[0]}, ${color2[1]}, ${color2[2]}, ${0.2 * (1 - distance / 150)})`);
            
            ctx.beginPath();
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 0.6 * (1 - distance / 150); // Thicker lines for closer particles
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
    
    // Add mouse event listeners
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    
    // Initialize
    resizeCanvas();
    initParticles();
    drawParticles();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return (
    <div className="enhanced-particle-background-wrapper">
      <canvas ref={canvasRef} className="enhanced-particle-canvas"></canvas>
      <div className="enhanced-particle-content">
        {children}
      </div>
    </div>
  );
}

export default React.memo(EnhancedParticleBackground); // Prevent unnecessary re-renders