import React, { useState, useRef, useEffect } from 'react';

const DraggableApp = ({ 
  children, 
  initialPosition = { x: 0, y: 0 }, 
  initialSize = { width: 200, height: 150 },
  appId,
  onPositionChange,
  onSizeChange,
  externalPosition = null, // New prop for external position updates
  isExternallyDragged = false // Flag to indicate external dragging
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  const appRef = useRef(null);

  // Load saved position and size from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`smartMirror_${appId}_layout`);
    if (saved) {
      try {
        const { position: savedPos, size: savedSize } = JSON.parse(saved);
        if (savedPos) setPosition(savedPos);
        if (savedSize) setSize(savedSize);
      } catch (e) {
        console.error('Error loading saved layout:', e);
      }
    }
  }, [appId]);

  // Sync position with external position when provided (hand-tracking drag)
  useEffect(() => {
    if (externalPosition && isExternallyDragged) {
      setPosition(externalPosition);
    }
  }, [externalPosition, isExternallyDragged]);

  // When externally dragged, we render using the external position directly
  // to avoid conflicts with internal state updates.

  // Save position and size to localStorage
  const saveLayout = (newPosition, newSize) => {
    const layout = {
      position: newPosition || position,
      size: newSize || size
    };
    localStorage.setItem(`smartMirror_${appId}_layout`, JSON.stringify(layout));
  };

  // Mouse down handler for dragging
  const handleMouseDown = (e) => {
    if (e.target.classList.contains('resize-handle')) return;
    if (isExternallyDragged) return; // Don't handle mouse events when externally dragged
    
    setIsDragging(true);
    const rect = appRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    e.preventDefault();
  };

  // Mouse down handler for resizing
  const handleResizeMouseDown = (e) => {
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
    e.preventDefault();
    e.stopPropagation();
  };

  // Mouse move handler
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const newPosition = {
          x: Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragOffset.x)),
          y: Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragOffset.y))
        };
        setPosition(newPosition);
        onPositionChange?.(newPosition);
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        const newSize = {
          width: Math.max(150, Math.min(window.innerWidth - position.x, resizeStart.width + deltaX)),
          height: Math.max(100, Math.min(window.innerHeight - position.y, resizeStart.height + deltaY))
        };
        setSize(newSize);
        onSizeChange?.(newSize);
      }
    };

    const handleMouseUp = () => {
      if (isDragging || isResizing) {
        saveLayout(position, size);
      }
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, resizeStart, position, size, onPositionChange, onSizeChange]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={appRef}
      className="draggable-app absolute"
      data-app-id={appId}
      style={{
        left: (externalPosition ? externalPosition.x : position.x),
        top: (externalPosition ? externalPosition.y : position.y),
        width: size.width,
        height: size.height,
        zIndex: (isExternallyDragged || isDragging || isResizing) ? 1000 : 'auto',
        transition: isExternallyDragged ? 'none' : undefined,
        willChange: isExternallyDragged ? 'left, top' : undefined
      }}
      onMouseDown={handleMouseDown}
    >
      <div 
        className="w-full h-full bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {children}
      </div>
      
      {/* Resize handle */}
      <div
        className="resize-handle"
        onMouseDown={handleResizeMouseDown}
      />
    </div>
  );
};

export default DraggableApp;
