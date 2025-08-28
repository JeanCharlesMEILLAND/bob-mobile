import React from 'react';
import { Image } from 'react-native';

interface EmpruntActifIconProps {
  width?: number;
  height?: number;
}

export const EmpruntActifIcon: React.FC<EmpruntActifIconProps> = ({ 
  width = 20, 
  height = 20 
}) => {
  return (
    <Image 
      source={require('../../../../assets/emprunt-actif.png')}
      style={{
        width,
        height,
        resizeMode: 'contain'
      }}
    />
  );
};