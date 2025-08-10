import React from 'react';
import { useTheme } from '../context/ThemeContext';

const CursorOverlay = ({ position, isVisible, isDragging = false }) => {
  const { theme } = useTheme();
  if (!isVisible || !position || !position.detected) {
    return null;
  }

  const isPinching = position.isPinching || false;
  const pinchStrength = position.pinchStrength || 0;
  
  // Calculate cursor size based on pinch state
  const baseSize = 32; // 32px base size
  const pinchSizeReduction = 8; // Reduce by up to 8px when pinching
  const currentSize = baseSize - (pinchSizeReduction * pinchStrength);
  const centerOffset = currentSize / 2;
  
  // Calculate glow intensity
  const baseGlow = isPinching ? 30 : 20;
  const pinchGlow = isPinching ? 60 : 40;
  const glowIntensity = baseGlow + (pinchGlow - baseGlow) * pinchStrength;
  
  // Calculate fill opacity
  const fillOpacity = isPinching ? 0.2 + (0.6 * pinchStrength) : 0.2;
  
  // Border and color intensity
  const borderWidth = isPinching ? 3 + (2 * pinchStrength) : 4;
  const accent = theme.accent;
  const hexToRgb = (hex) => {
    const s = hex.replace('#','');
    const bigint = parseInt(s, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
  };
  const accentRgb = hexToRgb(accent);
  const borderColor = isPinching ? 
    `rgba(${accentRgb}, ${0.8 + (0.2 * pinchStrength)})` : 
    `rgba(${accentRgb}, 0.8)`;

  return (
    <div
      className="cursor-overlay fixed pointer-events-none"
      style={{
        left: position.x - centerOffset,
        top: position.y - centerOffset,
        transition: isDragging ? 'none' : 'left 0.1s ease-out, top 0.1s ease-out',
        zIndex: 9999, // Always on top
      }}
    >
      {/* Outer glow ring */}
      <div className="relative">
        {/* Main cursor ring */}
        <div 
          className="rounded-full"
          style={{
            width: `${currentSize}px`,
            height: `${currentSize}px`,
            border: `${borderWidth}px solid ${borderColor}`,
            backgroundColor: `rgba(${accentRgb}, ${fillOpacity})`,
            boxShadow: `
              0 0 ${glowIntensity}px rgba(${accentRgb}, ${0.8 + (0.2 * pinchStrength)}), 
              0 0 ${glowIntensity * 2}px rgba(${accentRgb}, ${0.4 + (0.3 * pinchStrength)})
            `,
            animation: isPinching ? 'pinch-pulse 0.5s infinite' : 'idle-pulse 2s infinite',
            transform: `scale(${1 - (0.1 * pinchStrength)})`,
          }}
        />
        
        {/* Center dot */}
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: `${4 + (2 * pinchStrength)}px`,
            height: `${4 + (2 * pinchStrength)}px`,
            backgroundColor: isPinching ? 
              `rgba(${accentRgb}, ${1})` : 
              `rgba(${accentRgb}, 0.8)`,
            boxShadow: `0 0 ${10 + (5 * pinchStrength)}px rgba(${accentRgb}, 1)`,
          }}
        />
        
        {/* Pinch indicator ring */}
        {isPinching && (
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
            style={{
              width: `${currentSize + 8}px`,
              height: `${currentSize + 8}px`,
              borderColor: `rgba(255, 255, 255, ${0.3 + (0.4 * pinchStrength)})`,
              animation: 'pinch-ripple 0.8s infinite',
            }}
          />
        )}
      </div>
      
      {/* Add CSS animation keyframes */}
      <style>{`
        @keyframes idle-pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes pinch-pulse {
          0% {
            transform: scale(${1 - (0.1 * pinchStrength)});
            opacity: 1;
          }
          50% {
            transform: scale(${1 - (0.05 * pinchStrength)});
            opacity: 0.8;
          }
          100% {
            transform: scale(${1 - (0.1 * pinchStrength)});
            opacity: 1;
          }
        }
        
        @keyframes pinch-ripple {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default CursorOverlay;
