// src/assets/icons/ui/ClocheIcon.tsx - Version SVG avec le vrai design
import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface ClocheIconProps {
  width?: number;
  height?: number;
  hasNotification?: boolean;
}

export const ClocheIcon: React.FC<ClocheIconProps> = ({
  width = 24,
  height = 24,
  hasNotification = false
}) => (
  <View style={{
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center'
  }}>
    <Svg width={width} height={height} viewBox="0 0 32 32" fill="none">
      {/* Cloche principale avec dégradé bleu */}
      <Path 
        d="M25.0001 11.9974V12.9361C25.0001 14.0627 25.3201 15.1641 25.9228 16.1014L27.4001 18.3987C28.7481 20.4974 27.7188 23.3494 25.3734 24.0121C19.245 25.7476 12.7551 25.7476 6.62675 24.0121C4.28142 23.3494 3.25208 20.4974 4.60008 18.3987L6.07742 16.1014C6.6817 15.1563 7.00237 14.0578 7.00142 12.9361V11.9974C7.00142 6.84273 11.0307 2.66406 16.0001 2.66406C20.9694 2.66406 25.0001 6.84273 25.0001 11.9974Z" 
        fill="url(#paint0_linear)"
      />
      
      {/* Détails intérieurs de la cloche */}
      <Path 
        d="M16.9999 8C16.9999 7.73478 16.8945 7.48043 16.707 7.29289C16.5195 7.10536 16.2651 7 15.9999 7C15.7347 7 15.4803 7.10536 15.2928 7.29289C15.1053 7.48043 14.9999 7.73478 14.9999 8V13.3333C14.9999 13.5985 15.1053 13.8529 15.2928 14.0404C15.4803 14.228 15.7347 14.3333 15.9999 14.3333C16.2651 14.3333 16.5195 14.228 16.707 14.0404C16.8945 13.8529 16.9999 13.5985 16.9999 13.3333V8ZM9.65723 24.7267C10.0929 26.0655 10.9411 27.2321 12.0803 28.0594C13.2195 28.8867 14.5913 29.3323 15.9992 29.3323C17.4071 29.3323 18.779 28.8867 19.9182 28.0594C21.0574 27.2321 21.9056 26.0655 22.3412 24.7267C18.1479 25.5133 13.8519 25.5133 9.65723 24.7267Z" 
        fill="#B0D3FF"
      />
      
      
      <Defs>
        <LinearGradient id="paint0_linear" x1="16.0001" y1="2.66406" x2="5.0735" y2="25.8203" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#05B1F5" />
          <Stop offset="1" stopColor="#166DF6" />
        </LinearGradient>
      </Defs>
    </Svg>
  </View>
);