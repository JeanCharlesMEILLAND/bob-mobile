// src/components/ui/Animations.tsx - Composants d'animation réutilisables

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Dimensions,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// =================== FADE ANIMATION ===================

interface FadeInProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  style?: ViewStyle;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  duration = 300,
  delay = 0,
  style,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [fadeAnim, duration, delay]);

  return (
    <Animated.View style={[style, { opacity: fadeAnim }]}>
      {children}
    </Animated.View>
  );
};

export const FadeOut: React.FC<FadeInProps> = ({
  children,
  duration = 300,
  delay = 0,
  style,
}) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [fadeAnim, duration, delay]);

  return (
    <Animated.View style={[style, { opacity: fadeAnim }]}>
      {children}
    </Animated.View>
  );
};

// =================== SLIDE ANIMATIONS ===================

interface SlideInProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  duration?: number;
  delay?: number;
  distance?: number;
  style?: ViewStyle;
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  direction = 'right',
  duration = 300,
  delay = 0,
  distance,
  style,
}) => {
  const slideAnim = useRef(new Animated.Value(1)).current;

  const getInitialValue = () => {
    const defaultDistance = distance || 100;
    switch (direction) {
      case 'left': return -defaultDistance;
      case 'right': return defaultDistance;
      case 'up': return -defaultDistance;
      case 'down': return defaultDistance;
      default: return defaultDistance;
    }
  };

  useEffect(() => {
    slideAnim.setValue(getInitialValue());
    
    const timer = setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [slideAnim, duration, delay, direction]);

  const getTransform = () => {
    if (direction === 'left' || direction === 'right') {
      return [{ translateX: slideAnim }];
    }
    return [{ translateY: slideAnim }];
  };

  return (
    <Animated.View style={[style, { transform: getTransform() }]}>
      {children}
    </Animated.View>
  );
};

// =================== SCALE ANIMATIONS ===================

interface ScaleInProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  initialScale?: number;
  finalScale?: number;
  style?: ViewStyle;
}

export const ScaleIn: React.FC<ScaleInProps> = ({
  children,
  duration = 300,
  delay = 0,
  initialScale = 0,
  finalScale = 1,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(initialScale)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.spring(scaleAnim, {
        toValue: finalScale,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [scaleAnim, duration, delay, finalScale]);

  return (
    <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
      {children}
    </Animated.View>
  );
};

export const PulseAnimation: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
  minScale?: number;
  maxScale?: number;
  duration?: number;
}> = ({
  children,
  style,
  minScale = 0.95,
  maxScale = 1.05,
  duration = 1000,
}) => {
  const pulseAnim = useRef(new Animated.Value(minScale)).current;

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: maxScale,
          duration: duration / 2,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: minScale,
          duration: duration / 2,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(pulse);
    };

    pulse();
  }, [pulseAnim, minScale, maxScale, duration]);

  return (
    <Animated.View style={[style, { transform: [{ scale: pulseAnim }] }]}>
      {children}
    </Animated.View>
  );
};

// =================== ROTATION ANIMATIONS ===================

export const RotateAnimation: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
  duration?: number;
}> = ({ children, style, duration = 2000 }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rotate = () => {
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        rotateAnim.setValue(0);
        rotate();
      });
    };

    rotate();
  }, [rotateAnim, duration]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[style, { transform: [{ rotate: rotation }] }]}>
      {children}
    </Animated.View>
  );
};

// =================== STAGGERED ANIMATIONS ===================

interface StaggeredFadeInProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  animationDuration?: number;
  style?: ViewStyle;
}

export const StaggeredFadeIn: React.FC<StaggeredFadeInProps> = ({
  children,
  staggerDelay = 100,
  animationDuration = 300,
  style,
}) => {
  return (
    <View style={style}>
      {children.map((child, index) => (
        <FadeIn
          key={index}
          delay={index * staggerDelay}
          duration={animationDuration}
        >
          {child}
        </FadeIn>
      ))}
    </View>
  );
};

export const StaggeredSlideIn: React.FC<StaggeredFadeInProps & {
  direction?: 'left' | 'right' | 'up' | 'down';
}> = ({
  children,
  staggerDelay = 100,
  animationDuration = 300,
  direction = 'right',
  style,
}) => {
  return (
    <View style={style}>
      {children.map((child, index) => (
        <SlideIn
          key={index}
          direction={direction}
          delay={index * staggerDelay}
          duration={animationDuration}
        >
          {child}
        </SlideIn>
      ))}
    </View>
  );
};

// =================== BOUNCE ANIMATION ===================

export const BounceIn: React.FC<ScaleInProps> = ({
  children,
  duration = 600,
  delay = 0,
  style,
}) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.spring(bounceAnim, {
        toValue: 1,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [bounceAnim, delay]);

  return (
    <Animated.View style={[style, { transform: [{ scale: bounceAnim }] }]}>
      {children}
    </Animated.View>
  );
};

// =================== SHAKE ANIMATION ===================

interface ShakeAnimationProps {
  children: React.ReactNode;
  trigger: boolean;
  intensity?: number;
  duration?: number;
  style?: ViewStyle;
}

export const ShakeAnimation: React.FC<ShakeAnimationProps> = ({
  children,
  trigger,
  intensity = 10,
  duration = 500,
  style,
}) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger) {
      const shakeSequence = Array(6).fill(0).map((_, index) => 
        Animated.timing(shakeAnim, {
          toValue: index % 2 === 0 ? intensity : -intensity,
          duration: duration / 6,
          useNativeDriver: true,
        })
      );

      Animated.sequence([
        ...shakeSequence,
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: duration / 6,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [trigger, shakeAnim, intensity, duration]);

  return (
    <Animated.View style={[style, { transform: [{ translateX: shakeAnim }] }]}>
      {children}
    </Animated.View>
  );
};

// =================== MORPHING CONTAINER ===================

interface MorphingContainerProps {
  children: React.ReactNode;
  expanded: boolean;
  collapsedHeight: number;
  expandedHeight: number;
  duration?: number;
  style?: ViewStyle;
}

export const MorphingContainer: React.FC<MorphingContainerProps> = ({
  children,
  expanded,
  collapsedHeight,
  expandedHeight,
  duration = 300,
  style,
}) => {
  const heightAnim = useRef(new Animated.Value(collapsedHeight)).current;

  useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: expanded ? expandedHeight : collapsedHeight,
      duration,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [expanded, heightAnim, collapsedHeight, expandedHeight, duration]);

  return (
    <Animated.View style={[style, { height: heightAnim, overflow: 'hidden' }]}>
      {children}
    </Animated.View>
  );
};

// =================== FLOATING ACTION ANIMATION ===================

export const FloatingActionAnimation: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
}> = ({ children, style }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const float = () => {
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -5,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]).start(float);
    };

    float();
  }, [floatAnim]);

  return (
    <Animated.View style={[style, { transform: [{ translateY: floatAnim }] }]}>
      {children}
    </Animated.View>
  );
};

// =================== PROGRESS ANIMATION ===================

interface ProgressBarAnimationProps {
  progress: number; // 0 to 1
  duration?: number;
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  style?: ViewStyle;
}

export const ProgressBarAnimation: React.FC<ProgressBarAnimationProps> = ({
  progress,
  duration = 300,
  height = 4,
  backgroundColor = '#E5E7EB',
  progressColor = '#EC4899',
  style,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim, duration]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.progressContainer, { height, backgroundColor }, style]}>
      <Animated.View
        style={[
          styles.progressBar,
          {
            width: progressWidth,
            backgroundColor: progressColor,
            height,
          },
        ]}
      />
    </View>
  );
};

// =================== PARTICLE ANIMATION ===================

export const ParticleAnimation: React.FC<{
  count?: number;
  duration?: number;
  style?: ViewStyle;
}> = ({ count = 10, duration = 3000, style }) => {
  const particles = Array(count).fill(0).map(() => ({
    x: useRef(new Animated.Value(Math.random() * screenWidth)).current,
    y: useRef(new Animated.Value(screenHeight)).current,
    opacity: useRef(new Animated.Value(1)).current,
    scale: useRef(new Animated.Value(1)).current,
  }));

  useEffect(() => {
    const animateParticles = () => {
      particles.forEach((particle, index) => {
        const delay = index * (duration / count / 4);
        
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(particle.y, {
              toValue: -50,
              duration,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(particle.opacity, {
              toValue: 0,
              duration: duration * 0.8,
              delay: duration * 0.2,
              useNativeDriver: true,
            }),
            Animated.timing(particle.scale, {
              toValue: 0,
              duration: duration * 0.5,
              delay: duration * 0.5,
              useNativeDriver: true,
            }),
          ]).start(() => {
            // Reset pour la prochaine animation
            particle.y.setValue(screenHeight);
            particle.opacity.setValue(1);
            particle.scale.setValue(1);
            particle.x.setValue(Math.random() * screenWidth);
          });
        }, delay);
      });
    };

    const interval = setInterval(animateParticles, duration * 1.5);
    animateParticles(); // Première exécution immédiate

    return () => clearInterval(interval);
  }, [particles, duration, count]);

  return (
    <View style={[styles.particleContainer, style, { pointerEvents: 'none' }]}>
      {particles.map((particle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                { scale: particle.scale },
              ],
              opacity: particle.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
};

// =================== STYLES ===================

const styles = StyleSheet.create({
  progressContainer: {
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    borderRadius: 2,
  },
  particleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: '#EC4899',
    borderRadius: 2,
  },
});

export default {
  FadeIn,
  FadeOut,
  SlideIn,
  ScaleIn,
  PulseAnimation,
  RotateAnimation,
  StaggeredFadeIn,
  StaggeredSlideIn,
  BounceIn,
  ShakeAnimation,
  MorphingContainer,
  FloatingActionAnimation,
  ProgressBarAnimation,
  ParticleAnimation,
};