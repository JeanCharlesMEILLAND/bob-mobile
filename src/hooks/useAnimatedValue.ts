// src/hooks/useAnimatedValue.ts - Hooks pour animations

import { useRef, useEffect, useCallback } from 'react';
import { Animated, Easing } from 'react-native';

// =================== ANIMATED VALUE HOOK ===================

export interface UseAnimatedValueReturn {
  value: Animated.Value;
  animate: (toValue: number, config?: Animated.TimingAnimationConfig) => Promise<void>;
  animateWithSpring: (toValue: number, config?: Animated.SpringAnimationConfig) => Promise<void>;
  reset: (value?: number) => void;
  setValue: (value: number) => void;
}

export function useAnimatedValue(initialValue: number = 0): UseAnimatedValueReturn {
  const animatedValue = useRef(new Animated.Value(initialValue)).current;

  const animate = useCallback((
    toValue: number,
    config: Partial<Animated.TimingAnimationConfig> = {}
  ): Promise<void> => {
    return new Promise((resolve) => {
      Animated.timing(animatedValue, {
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
        ...config,
        toValue,
      }).start(() => resolve());
    });
  }, [animatedValue]);

  const animateWithSpring = useCallback((
    toValue: number,
    config: Partial<Animated.SpringAnimationConfig> = {}
  ): Promise<void> => {
    return new Promise((resolve) => {
      Animated.spring(animatedValue, {
        tension: 100,
        friction: 8,
        useNativeDriver: true,
        ...config,
        toValue,
      }).start(() => resolve());
    });
  }, [animatedValue]);

  const reset = useCallback((value: number = initialValue) => {
    animatedValue.setValue(value);
  }, [animatedValue, initialValue]);

  const setValue = useCallback((value: number) => {
    animatedValue.setValue(value);
  }, [animatedValue]);

  return {
    value: animatedValue,
    animate,
    animateWithSpring,
    reset,
    setValue,
  };
}

// =================== SEQUENCE ANIMATION HOOK ===================

export function useSequenceAnimation() {
  const runSequence = useCallback((
    animations: Array<() => Promise<void>>
  ): Promise<void> => {
    return animations.reduce(
      (promise, animation) => promise.then(animation),
      Promise.resolve()
    );
  }, []);

  const runParallel = useCallback((
    animations: Array<() => Promise<void>>
  ): Promise<void> => {
    return Promise.all(animations.map(animation => animation())).then(() => {});
  }, []);

  return {
    runSequence,
    runParallel,
  };
}

// =================== STAGGER ANIMATION HOOK ===================

export function useStaggerAnimation() {
  const staggerAnimate = useCallback((
    values: Animated.Value[],
    toValue: number,
    staggerDelay: number = 100,
    config: Animated.TimingAnimationConfig = { toValue: 0, useNativeDriver: false }
  ): Promise<void> => {
    return new Promise((resolve) => {
      const animations = values.map((value, index) =>
        Animated.timing(value, {
          toValue,
          duration: 300,
          delay: index * staggerDelay,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
          ...config,
        })
      );

      Animated.parallel(animations).start(() => resolve());
    });
  }, []);

  const staggerSpring = useCallback((
    values: Animated.Value[],
    toValue: number,
    staggerDelay: number = 100,
    config: Animated.SpringAnimationConfig = { toValue: 0, useNativeDriver: false }
  ): Promise<void> => {
    return new Promise((resolve) => {
      const animations = values.map((value, index) =>
        Animated.spring(value, {
          toValue,
          delay: index * staggerDelay,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
          ...config,
        })
      );

      Animated.parallel(animations).start(() => resolve());
    });
  }, []);

  return {
    staggerAnimate,
    staggerSpring,
  };
}

// =================== INTERPOLATION HOOK ===================

export function useInterpolation(
  animatedValue: Animated.Value,
  inputRange: number[],
  outputRange: number[] | string[]
) {
  return useRef(
    animatedValue.interpolate({
      inputRange,
      outputRange,
      extrapolate: 'clamp',
    })
  ).current;
}

// =================== LOOP ANIMATION HOOK ===================

export function useLoopAnimation(
  duration: number = 1000,
  autoStart: boolean = true
) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const startLoop = useCallback(() => {
    animationRef.current = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      { iterations: -1 }
    );
    animationRef.current.start();
  }, [animatedValue, duration]);

  const stopLoop = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.stop();
      animatedValue.setValue(0);
    }
  }, [animatedValue]);

  const pauseLoop = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.stop();
    }
  }, []);

  const resumeLoop = useCallback(() => {
    startLoop();
  }, [startLoop]);

  useEffect(() => {
    if (autoStart) {
      startLoop();
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [autoStart, startLoop]);

  return {
    value: animatedValue,
    startLoop,
    stopLoop,
    pauseLoop,
    resumeLoop,
  };
}

// =================== GESTURE ANIMATION HOOK ===================

export function useGestureAnimation() {
  const gestureValue = useRef(new Animated.Value(0)).current;
  const velocityValue = useRef(new Animated.Value(0)).current;

  const handleGestureStart = useCallback(() => {
    gestureValue.setOffset((gestureValue as any)._value);
    gestureValue.setValue(0);
  }, [gestureValue]);

  const handleGestureMove = useCallback((value: number) => {
    gestureValue.setValue(value);
  }, [gestureValue]);

  const handleGestureEnd = useCallback((
    velocity: number = 0,
    boundaries?: { min?: number; max?: number }
  ) => {
    gestureValue.flattenOffset();
    velocityValue.setValue(velocity);

    let finalValue = (gestureValue as any)._value;
    
    if (boundaries) {
      if (boundaries.min !== undefined && finalValue < boundaries.min) {
        finalValue = boundaries.min;
      }
      if (boundaries.max !== undefined && finalValue > boundaries.max) {
        finalValue = boundaries.max;
      }
    }

    Animated.spring(gestureValue, {
      toValue: finalValue,
      velocity,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [gestureValue, velocityValue]);

  const snapTo = useCallback((
    snapPoints: number[],
    velocity: number = 0
  ) => {
    const currentValue = (gestureValue as any)._value;
    
    // Trouver le point de snap le plus proche
    const closestSnapPoint = snapPoints.reduce((closest, snapPoint) => {
      const currentDistance = Math.abs(currentValue - closest);
      const snapDistance = Math.abs(currentValue - snapPoint);
      return snapDistance < currentDistance ? snapPoint : closest;
    });

    Animated.spring(gestureValue, {
      toValue: closestSnapPoint,
      velocity,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [gestureValue]);

  return {
    gestureValue,
    velocityValue,
    handleGestureStart,
    handleGestureMove,
    handleGestureEnd,
    snapTo,
  };
}

// =================== ANIMATED LIST HOOK ===================

export function useAnimatedList<T>(
  items: T[],
  keyExtractor: (item: T, index: number) => string
) {
  const animatedValues = useRef(new Map<string, Animated.Value>()).current;

  // Créer ou récupérer la valeur animée pour chaque élément
  const getAnimatedValue = useCallback((item: T, index: number) => {
    const key = keyExtractor(item, index);
    
    if (!animatedValues.has(key)) {
      animatedValues.set(key, new Animated.Value(0));
    }
    
    return animatedValues.get(key)!;
  }, [animatedValues, keyExtractor]);

  // Animer l'entrée des nouveaux éléments
  const animateIn = useCallback((
    item: T,
    index: number,
    delay: number = 0
  ): Promise<void> => {
    const animatedValue = getAnimatedValue(item, index);
    
    return new Promise((resolve) => {
      animatedValue.setValue(0);
      
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        delay,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
      }).start(() => resolve());
    });
  }, [getAnimatedValue]);

  // Animer la sortie des éléments
  const animateOut = useCallback((
    item: T,
    index: number,
    delay: number = 0
  ): Promise<void> => {
    const animatedValue = getAnimatedValue(item, index);
    
    return new Promise((resolve) => {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        delay,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        // Supprimer la valeur animée après l'animation
        const key = keyExtractor(item, index);
        animatedValues.delete(key);
        resolve();
      });
    });
  }, [getAnimatedValue, keyExtractor, animatedValues]);

  // Nettoyer les valeurs animées obsolètes
  useEffect(() => {
    const currentKeys = new Set(items.map(keyExtractor));
    const animatedKeys = Array.from(animatedValues.keys());
    
    animatedKeys.forEach(key => {
      if (!currentKeys.has(key)) {
        animatedValues.delete(key);
      }
    });
  }, [items, keyExtractor, animatedValues]);

  return {
    getAnimatedValue,
    animateIn,
    animateOut,
  };
}

// =================== TRANSITION HOOK ===================

export function useTransition(
  show: boolean,
  config: {
    duration?: number;
    easing?: (value: number) => number;
    useNativeDriver?: boolean;
  } = {}
) {
  const {
    duration = 300,
    easing = Easing.out(Easing.quad),
    useNativeDriver = true,
  } = config;

  const animatedValue = useRef(new Animated.Value(show ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: show ? 1 : 0,
      duration,
      easing,
      useNativeDriver,
    }).start();
  }, [show, animatedValue, duration, easing, useNativeDriver]);

  return {
    animatedValue,
    style: {
      opacity: animatedValue,
      transform: [
        {
          scale: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1],
          }),
        },
      ],
    },
  };
}