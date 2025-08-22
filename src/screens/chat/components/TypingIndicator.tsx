// src/screens/chat/components/TypingIndicator.tsx - Indicateur de frappe
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated
} from 'react-native';
import { TypingIndicator } from '../../../types/chat.types';

interface TypingIndicatorProps {
  users: TypingIndicator[];
}

export const TypingIndicatorComponent: React.FC<TypingIndicatorProps> = ({ users }) => {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (users.length > 0) {
      // Animation d'apparition
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Animation des points
      const animateDots = () => {
        const sequence = Animated.sequence([
          Animated.timing(dot1Anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot2Anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot3Anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.parallel([
            Animated.timing(dot1Anim, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot2Anim, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot3Anim, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        ]);

        const loop = Animated.loop(sequence);
        loop.start();

        return loop;
      };

      const dotsAnimation = animateDots();

      return () => {
        dotsAnimation.stop();
      };
    } else {
      // Animation de disparition
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [users.length]);

  if (users.length === 0) {
    return null;
  }

  const getUsersText = () => {
    if (users.length === 1) {
      return `${users[0].userName} est en train d'écrire`;
    } else if (users.length === 2) {
      return `${users[0].userName} et ${users[1].userName} sont en train d'écrire`;
    } else {
      return `${users[0].userName} et ${users.length - 1} autres sont en train d'écrire`;
    }
  };

  const styles = {
    container: {
      flexDirection: 'row' as const,
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: '#F8F9FA',
      borderTopWidth: 1,
      borderTopColor: '#E9ECEF',
    },

    avatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#E5E5E5',
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginRight: 8,
    },

    avatarText: {
      fontSize: 10,
      fontWeight: 'bold' as const,
      color: '#666',
    },

    textContainer: {
      flex: 1,
      flexDirection: 'row' as const,
      alignItems: 'center',
    },

    typingText: {
      fontSize: 13,
      color: '#666',
      fontStyle: 'italic' as const,
    },

    dotsContainer: {
      flexDirection: 'row' as const,
      alignItems: 'center',
      marginLeft: 4,
    },

    dot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: '#007AFF',
      marginHorizontal: 1,
    },
  };

  return (
    <Animated.View style={[styles.container, { opacity: opacityAnim }]}>
      {/* Avatar du premier utilisateur */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {users[0].userName.charAt(0).toUpperCase()}
        </Text>
      </View>

      {/* Texte et animation */}
      <View style={styles.textContainer}>
        <Text style={styles.typingText}>{getUsersText()}</Text>
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, { opacity: dot1Anim }]} />
          <Animated.View style={[styles.dot, { opacity: dot2Anim }]} />
          <Animated.View style={[styles.dot, { opacity: dot3Anim }]} />
        </View>
      </View>
    </Animated.View>
  );
};