import React from 'react';
import { Image } from 'react-native';

interface PretActifIconProps {
  width?: number;
  height?: number;
}

export const PretActifIcon: React.FC<PretActifIconProps> = ({ 
  width = 20, 
  height = 20 
}) => {
  return (
    <Image 
      source={require('../../../../assets/pret-actif.png')}
      style={{
        width,
        height,
        resizeMode: 'contain'
      }}
    />
  );
};