import React from 'react';
import { Image } from 'react-native';

interface ServiceActifIconProps {
  width?: number;
  height?: number;
}

export const ServiceActifIcon: React.FC<ServiceActifIconProps> = ({ 
  width = 20, 
  height = 20 
}) => {
  return (
    <Image 
      source={require('../../../../assets/service-actif.png')}
      style={{
        width,
        height,
        resizeMode: 'contain'
      }}
    />
  );
};