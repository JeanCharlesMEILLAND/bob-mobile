// src/components/ui/LoadingStates.tsx - Composants de loading cohérents

import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

// =================== LOADING BASIQUE ===================

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = '#EC4899',
  message
}) => (
  <View style={styles.spinnerContainer}>
    <ActivityIndicator size={size} color={color} />
    {message && (
      <Text style={styles.loadingMessage}>{message}</Text>
    )}
  </View>
);

// =================== LOADING OVERLAY ===================

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  transparent?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Chargement...',
  transparent = false
}) => {
  if (!visible) return null;

  return (
    <View style={[
      styles.overlay,
      transparent && styles.transparentOverlay
    ]}>
      <View style={styles.overlayContent}>
        <ActivityIndicator size="large" color="#EC4899" />
        <Text style={styles.overlayMessage}>{message}</Text>
      </View>
    </View>
  );
};

// =================== LOADING SKELETON ===================

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style
}) => {
  const animatedValue = new Animated.Value(0);

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    
    animation.start();
    return () => animation.stop();
  }, []);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E5E7EB', '#F3F4F6'],
  });

  return (
    <Animated.View
      style={[
        {
          width: typeof width === 'string' ? width : width,
          height: height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
};

// =================== EVENT CARD SKELETON ===================

export const EventCardSkeleton: React.FC = () => (
  <View style={styles.cardSkeleton}>
    <View style={styles.cardSkeletonHeader}>
      <Skeleton width={60} height={60} borderRadius={30} />
      <View style={styles.cardSkeletonInfo}>
        <Skeleton width="70%" height={16} />
        <Skeleton width="50%" height={12} style={{ marginTop: 8 }} />
      </View>
    </View>
    <Skeleton width="100%" height={12} style={{ marginTop: 12 }} />
    <Skeleton width="80%" height={12} style={{ marginTop: 6 }} />
    <View style={styles.cardSkeletonFooter}>
      <Skeleton width={80} height={24} borderRadius={12} />
      <Skeleton width={60} height={24} borderRadius={12} />
    </View>
  </View>
);

// =================== BOB CARD SKELETON ===================

export const BobCardSkeleton: React.FC = () => (
  <View style={styles.cardSkeleton}>
    <View style={styles.cardSkeletonHeader}>
      <Skeleton width={40} height={40} borderRadius={8} />
      <View style={styles.cardSkeletonInfo}>
        <Skeleton width="60%" height={14} />
        <Skeleton width="40%" height={12} style={{ marginTop: 6 }} />
      </View>
      <Skeleton width={50} height={20} borderRadius={10} />
    </View>
    <Skeleton width="100%" height={10} style={{ marginTop: 10 }} />
    <View style={styles.cardSkeletonFooter}>
      <Skeleton width="30%" height={12} />
      <Skeleton width={40} height={16} borderRadius={8} />
    </View>
  </View>
);

// =================== LIST LOADING ===================

interface ListLoadingProps {
  itemCount?: number;
  renderSkeleton?: () => React.ReactElement;
}

export const ListLoading: React.FC<ListLoadingProps> = ({
  itemCount = 5,
  renderSkeleton = () => <EventCardSkeleton />
}) => (
  <View style={styles.listLoading}>
    {Array.from({ length: itemCount }).map((_, index) => (
      <View key={index} style={styles.listItem}>
        {renderSkeleton()}
      </View>
    ))}
  </View>
);

// =================== PULL TO REFRESH ===================

interface PullToRefreshIndicatorProps {
  refreshing: boolean;
  message?: string;
}

export const PullToRefreshIndicator: React.FC<PullToRefreshIndicatorProps> = ({
  refreshing,
  message = 'Actualisation...'
}) => {
  if (!refreshing) return null;

  return (
    <View style={styles.pullToRefreshContainer}>
      <ActivityIndicator size="small" color="#EC4899" />
      <Text style={styles.pullToRefreshText}>{message}</Text>
    </View>
  );
};

// =================== INFINITE SCROLL LOADING ===================

export const InfiniteScrollLoader: React.FC = () => (
  <View style={styles.infiniteScrollContainer}>
    <ActivityIndicator size="small" color="#EC4899" />
    <Text style={styles.infiniteScrollText}>Chargement...</Text>
  </View>
);

// =================== BUTTON LOADING ===================

interface LoadingButtonProps {
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  style?: any;
  textStyle?: any;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading,
  children,
  loadingText,
  style,
  textStyle
}) => (
  <View style={[styles.loadingButton, style]}>
    {loading ? (
      <View style={styles.loadingButtonContent}>
        <ActivityIndicator size="small" color="#FFF" style={{ marginRight: 8 }} />
        <Text style={[styles.loadingButtonText, textStyle]}>
          {loadingText || 'Chargement...'}
        </Text>
      </View>
    ) : (
      children
    )}
  </View>
);

// =================== PROGRESSIVE IMAGE LOADING ===================

interface ProgressiveImageProps {
  source: { uri: string };
  style?: any;
  loadingComponent?: React.ReactElement;
  errorComponent?: React.ReactElement;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  source,
  style,
  loadingComponent,
  errorComponent
}) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  const handleLoad = () => setLoading(false);
  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  if (error && errorComponent) {
    return errorComponent;
  }

  return (
    <View style={style}>
      {loading && (
        <View style={[style, styles.imageLoadingContainer]}>
          {loadingComponent || <Skeleton width={100} height={100} />}
        </View>
      )}
      <Animated.Image
        source={source}
        style={[
          style,
          { opacity: loading ? 0 : 1 }
        ]}
        onLoad={handleLoad}
        onError={handleError}
      />
    </View>
  );
};

// =================== STYLES ===================

const styles = StyleSheet.create({
  // Spinner basique
  spinnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingMessage: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },

  // Overlay
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  transparentOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  overlayContent: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
  },
  overlayMessage: {
    marginTop: 12,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },

  // Card skeletons
  cardSkeleton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardSkeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardSkeletonInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cardSkeletonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },

  // List loading
  listLoading: {
    padding: 16,
  },
  listItem: {
    marginBottom: 8,
  },

  // Pull to refresh
  pullToRefreshContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  pullToRefreshText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },

  // Infinite scroll
  infiniteScrollContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  infiniteScrollText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },

  // Loading button
  loadingButton: {
    backgroundColor: '#EC4899',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  loadingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Progressive image
  imageLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default {
  LoadingSpinner,
  LoadingOverlay,
  Skeleton,
  EventCardSkeleton,
  BobCardSkeleton,
  ListLoading,
  PullToRefreshIndicator,
  InfiniteScrollLoader,
  LoadingButton,
  ProgressiveImage,
};