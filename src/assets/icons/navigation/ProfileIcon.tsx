import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface ProfileIconProps {
  width?: number;
  height?: number;
  active?: boolean;
}

export const ProfileIcon: React.FC<ProfileIconProps> = ({ 
  width = 16, 
  height = 20, 
  active = false 
}) => {
  if (active) {
    return (
      <Svg width={width} height={height} viewBox="0 0 16 20" fill="none">
        <Path d="M8 8C10.2091 8 12 6.20914 12 4C12 1.79086 10.2091 0 8 0C5.79086 0 4 1.79086 4 4C4 6.20914 5.79086 8 8 8Z" fill="url(#paint0_linear_4278_2686)"/>
        <Path d="M16 15.5C16 17.985 16 20 8 20C0 20 0 17.985 0 15.5C0 13.015 3.582 11 8 11C12.418 11 16 13.015 16 15.5Z" fill="url(#paint1_linear_4278_2686)"/>
        <Defs>
          <LinearGradient id="paint0_linear_4278_2686" x1="8" y1="-2.98023e-07" x2="-3.23596" y2="17.9775" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#05B1F5"/>
            <Stop offset="1" stopColor="#166DF6"/>
          </LinearGradient>
          <LinearGradient id="paint1_linear_4278_2686" x1="8" y1="-2.98023e-07" x2="-3.23596" y2="17.9775" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#05B1F5"/>
            <Stop offset="1" stopColor="#166DF6"/>
          </LinearGradient>
        </Defs>
      </Svg>
    );
  }

  return (
    <Svg width={width} height={height} viewBox="0 0 16 20" fill="none">
      <Path d="M8 8C10.2091 8 12 6.20914 12 4C12 1.79086 10.2091 0 8 0C5.79086 0 4 1.79086 4 4C4 6.20914 5.79086 8 8 8Z" fill="#7C8CA8"/>
      <Path opacity="0.5" d="M16 15.5C16 17.985 16 20 8 20C0 20 0 17.985 0 15.5C0 13.015 3.582 11 8 11C12.418 11 16 13.015 16 15.5Z" fill="#7C8CA8"/>
    </Svg>
  );
};