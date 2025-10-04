"use client";

import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

// Define Vanta and THREE types for TypeScript
declare global {
  interface Window {
    VANTA: any;
    THREE: any;
  }
}

const VantaBackground = () => {
  const { theme } = useTheme();
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const vantaRef = useRef(null);

  useEffect(() => {
    if (window.VANTA && vantaRef.current) {
      if (vantaEffect) {
        vantaEffect.destroy();
      }

      const isDark = theme === 'dark';
      
      const newVantaEffect = window.VANTA.NET({
          el: vantaRef.current,
          THREE: window.THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          color: isDark ? 0x228B22 : 0x50c878, // forestgreen for dark, saturated green for light
          backgroundColor: isDark ? 0x1a202c : 0xf0faf4, // dark grey-blue for dark, pale green for light
          points: 10.0,
          maxDistance: 25.0,
          spacing: 18.0,
      });

      setVantaEffect(newVantaEffect);
    }

    return () => {
      if (vantaEffect) {
        vantaEffect.destroy();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]); // Rerun effect when theme changes

  return <div ref={vantaRef} className="fixed top-0 left-0 w-full h-full z-0" />;
};

export default VantaBackground;
