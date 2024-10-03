// src/components/ParticleWaveEffectComponent.js
import React, { useEffect, useRef } from 'react';
import ParticleWaveEffect from '../effects/ParticleWaveEffect.js';

const ParticleWaveEffectComponent = () => {
  const containerRef = useRef(null);
  let effectInstance = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      effectInstance.current = new ParticleWaveEffect({
        el: containerRef.current,
      });
    }

    const handleResize = () => {
      if (effectInstance.current) {
        effectInstance.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (effectInstance.current) {
        effectInstance.current.dispose();
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    />
  );
};

export default ParticleWaveEffectComponent;
