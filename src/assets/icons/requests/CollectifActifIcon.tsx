import React from 'react';
import { Image } from 'react-native';

interface CollectifActifIconProps {
  width?: number;
  height?: number;
}

export const CollectifActifIcon: React.FC<CollectifActifIconProps> = ({ 
  width = 20, 
  height = 20 
}) => {
  return (
    <Image 
      source={require('../../../../assets/collectif-actif.png')}
      style={{
        width,
        height,
        resizeMode: 'contain'
      }}
    />
  );
};