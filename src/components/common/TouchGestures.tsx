import React, { useRef, useEffect, ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TouchGesturesProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onLongPress?: () => void;
  className?: string;
  disabled?: boolean;
}

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

export const TouchGestures: React.FC<TouchGesturesProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  onLongPress,
  className = '',
  disabled = false
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // États pour les gestes
  const touchStart = useRef<TouchPoint | null>(null);
  const touchCurrent = useRef<TouchPoint | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const initialDistance = useRef<number>(0);
  const currentDistance = useRef<number>(0);

  // Configuration des seuils
  const SWIPE_THRESHOLD = 50; // Distance minimale pour un swipe
  const VELOCITY_THRESHOLD = 0.3; // Vitesse minimale pour un swipe
  const LONG_PRESS_DURATION = 500; // Durée pour un long press
  const PINCH_THRESHOLD = 20; // Distance minimale pour un pinch

  useEffect(() => {
    if (!isMobile || disabled || !elementRef.current) return;

    const element = elementRef.current;

    // Gestion du début du touch
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      
      const touch = e.touches[0];
      const now = Date.now();
      
      touchStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: now
      };
      
      touchCurrent.current = { ...touchStart.current };

      // Gérer le pinch (2 doigts)
      if (e.touches.length === 2 && onPinch) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialDistance.current = getDistance(touch1, touch2);
      }

      // Démarrer le timer pour long press
      if (onLongPress) {
        longPressTimer.current = setTimeout(() => {
          onLongPress();
          // Vibration tactile si supportée
          if ('vibrate' in navigator) {
            navigator.vibrate(50);
          }
        }, LONG_PRESS_DURATION);
      }
    };

    // Gestion du mouvement
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      
      if (!touchStart.current) return;

      const touch = e.touches[0];
      touchCurrent.current = {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now()
      };

      // Annuler le long press si on bouge
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      // Gérer le pinch
      if (e.touches.length === 2 && onPinch) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        currentDistance.current = getDistance(touch1, touch2);
        
        if (Math.abs(currentDistance.current - initialDistance.current) > PINCH_THRESHOLD) {
          const scale = currentDistance.current / initialDistance.current;
          onPinch(scale);
        }
      }
    };

    // Gestion de la fin du touch
    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      
      // Annuler le long press
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      if (!touchStart.current || !touchCurrent.current) return;

      const deltaX = touchCurrent.current.x - touchStart.current.x;
      const deltaY = touchCurrent.current.y - touchStart.current.y;
      const deltaTime = touchCurrent.current.timestamp - touchStart.current.timestamp;
      
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const velocity = distance / deltaTime;

      // Déterminer le type de swipe
      if (distance >= SWIPE_THRESHOLD && velocity >= VELOCITY_THRESHOLD) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (absX > absY) {
          // Swipe horizontal
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight();
            triggerHapticFeedback();
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft();
            triggerHapticFeedback();
          }
        } else {
          // Swipe vertical
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown();
            triggerHapticFeedback();
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp();
            triggerHapticFeedback();
          }
        }
      }

      // Reset
      touchStart.current = null;
      touchCurrent.current = null;
      initialDistance.current = 0;
      currentDistance.current = 0;
    };

    // Gestion de l'annulation
    const handleTouchCancel = (e: TouchEvent) => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      
      touchStart.current = null;
      touchCurrent.current = null;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
    element.addEventListener('touchcancel', handleTouchCancel, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchCancel);
      
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, [
    isMobile,
    disabled,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinch,
    onLongPress
  ]);

  // Calcul de la distance entre deux points de touch
  const getDistance = (touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Feedback haptique
  const triggerHapticFeedback = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(25);
    }
  };

  return (
    <div 
      ref={elementRef}
      className={`${className} ${isMobile ? 'touch-manipulation' : ''}`}
      style={{
        touchAction: disabled ? 'auto' : 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        msUserSelect: 'none'
      }}
    >
      {children}
    </div>
  );
};

// Hook pour les gestes tactiles réutilisables
export const useTouchGestures = () => {
  const isMobile = useIsMobile();

  const createSwipeHandler = (
    onSwipeLeft?: () => void,
    onSwipeRight?: () => void,
    onSwipeUp?: () => void,
    onSwipeDown?: () => void
  ) => {
    if (!isMobile) return {};

    let startX = 0;
    let startY = 0;
    let startTime = 0;

    return {
      onTouchStart: (e: React.TouchEvent) => {
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        startTime = Date.now();
      },
      onTouchEnd: (e: React.TouchEvent) => {
        if (!e.changedTouches[0]) return;
        
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;
        const deltaTime = Date.now() - startTime;
        
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const velocity = distance / deltaTime;

        if (distance >= 50 && velocity >= 0.3) {
          const absX = Math.abs(deltaX);
          const absY = Math.abs(deltaY);

          if (absX > absY) {
            if (deltaX > 0 && onSwipeRight) onSwipeRight();
            else if (deltaX < 0 && onSwipeLeft) onSwipeLeft();
          } else {
            if (deltaY > 0 && onSwipeDown) onSwipeDown();
            else if (deltaY < 0 && onSwipeUp) onSwipeUp();
          }
        }
      }
    };
  };

  const createLongPressHandler = (onLongPress: () => void, duration = 500) => {
    if (!isMobile) return {};

    let timer: NodeJS.Timeout | null = null;

    return {
      onTouchStart: () => {
        timer = setTimeout(() => {
          onLongPress();
          if ('vibrate' in navigator) {
            navigator.vibrate(50);
          }
        }, duration);
      },
      onTouchEnd: () => {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      },
      onTouchMove: () => {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      }
    };
  };

  return {
    createSwipeHandler,
    createLongPressHandler,
    isMobile
  };
};

export default TouchGestures;
