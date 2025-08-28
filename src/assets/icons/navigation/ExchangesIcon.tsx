import React from 'react';
import Svg, { Path, G, Defs, LinearGradient, Stop } from 'react-native-svg';

interface ExchangesIconProps {
  width?: number;
  height?: number;
  active?: boolean;
}

export const ExchangesIcon: React.FC<ExchangesIconProps> = ({ 
  width = 20, 
  height = 19, 
  active = false 
}) => {
  if (active) {
    return (
      <Svg width={width} height={height} viewBox="0 0 20 19" fill="none">
        <G opacity="0.4">
          <Path d="M13.668 7C15.3248 7 16.668 5.65685 16.668 4C16.668 2.34315 15.3248 1 13.668 1C12.0111 1 10.668 2.34315 10.668 4C10.668 5.65685 12.0111 7 13.668 7Z" fill="#099FF5"/>
          <Path d="M14.668 18C17.4294 18 19.668 16.6569 19.668 15C19.668 13.3431 17.4294 12 14.668 12C11.9065 12 9.66797 13.3431 9.66797 15C9.66797 16.6569 11.9065 18 14.668 18Z" fill="#099FF5"/>
        </G>
        <Path d="M7.66895 8C9.87809 8 11.6689 6.20914 11.6689 4C11.6689 1.79086 9.87809 0 7.66895 0C5.45981 0 3.66895 1.79086 3.66895 4C3.66895 6.20914 5.45981 8 7.66895 8Z" fill="url(#paint0_linear_4889_3046)"/>
        <Path d="M7.66895 19.001C11.5349 19.001 14.6689 17.2101 14.6689 15.001C14.6689 12.7919 11.5349 11.001 7.66895 11.001C3.80295 11.001 0.668945 12.7919 0.668945 15.001C0.668945 17.2101 3.80295 19.001 7.66895 19.001Z" fill="url(#paint1_linear_4889_3046)"/>
        <Defs>
          <LinearGradient id="paint0_linear_4889_3046" x1="7.66894" y1="-2.83137e-07" x2="-3.36678" y2="16.2623" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#05B1F5"/>
            <Stop offset="1" stopColor="#166DF6"/>
          </LinearGradient>
          <LinearGradient id="paint1_linear_4889_3046" x1="7.66894" y1="-2.83137e-07" x2="-3.36678" y2="16.2623" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#05B1F5"/>
            <Stop offset="1" stopColor="#166DF6"/>
          </LinearGradient>
        </Defs>
      </Svg>
    );
  }

  return (
    <Svg width={width} height={height} viewBox="0 0 20 19" fill="none">
      <Path opacity="0.4" d="M13.668 7C15.3248 7 16.668 5.65685 16.668 4C16.668 2.34315 15.3248 1 13.668 1C12.0111 1 10.668 2.34315 10.668 4C10.668 5.65685 12.0111 7 13.668 7Z" fill="#7C8CA8"/>
      <Path opacity="0.4" d="M14.668 18C17.4294 18 19.668 16.6569 19.668 15C19.668 13.3431 17.4294 12 14.668 12C11.9065 12 9.66797 13.3431 9.66797 15C9.66797 16.6569 11.9065 18 14.668 18Z" fill="#7C8CA8"/>
      <Path d="M7.66895 8C9.87809 8 11.6689 6.20914 11.6689 4C11.6689 1.79086 9.87809 0 7.66895 0C5.45981 0 3.66895 1.79086 3.66895 4C3.66895 6.20914 5.45981 8 7.66895 8Z" fill="#7C8CA8"/>
      <Path d="M7.66895 19C11.5349 19 14.6689 17.2091 14.6689 15C14.6689 12.7909 11.5349 11 7.66895 11C3.80295 11 0.668945 12.7909 0.668945 15C0.668945 17.2091 3.80295 19 7.66895 19Z" fill="#7C8CA8"/>
    </Svg>
  );
};