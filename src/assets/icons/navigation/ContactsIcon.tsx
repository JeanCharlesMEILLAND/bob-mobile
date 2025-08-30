import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface ContactsIconProps {
  width?: number;
  height?: number;
  active?: boolean;
}

export const ContactsIcon: React.FC<ContactsIconProps> = ({ 
  width = 20, 
  height = 20, 
  active = false 
}) => {
  if (active) {
    return (
      <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
        <Path d="M7 8C9.20914 8 11 6.20914 11 4C11 1.79086 9.20914 0 7 0C4.79086 0 3 1.79086 3 4C3 6.20914 4.79086 8 7 8Z" fill="url(#paint0_linear_contacts_active)"/>
        <Path d="M7 20C10.866 20 14 18.2091 14 16C14 13.7909 10.866 12 7 12C3.13401 12 0 13.7909 0 16C0 18.2091 3.13401 20 7 20Z" fill="url(#paint1_linear_contacts_active)"/>
        <Path opacity="0.4" d="M13.5 6C14.8807 6 16 4.88071 16 3.5C16 2.11929 14.8807 1 13.5 1C12.1193 1 11 2.11929 11 3.5C11 4.88071 12.1193 6 13.5 6Z" fill="#099FF5"/>
        <Path opacity="0.4" d="M20 15.5C20 16.8807 18.8807 18 17.5 18C16.1193 18 15 16.8807 15 15.5C15 14.1193 16.1193 13 17.5 13C18.8807 13 20 14.1193 20 15.5Z" fill="#099FF5"/>
        <Defs>
          <LinearGradient id="paint0_linear_contacts_active" x1="7" y1="0" x2="0" y2="8" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#05B1F5"/>
            <Stop offset="1" stopColor="#166DF6"/>
          </LinearGradient>
          <LinearGradient id="paint1_linear_contacts_active" x1="7" y1="12" x2="0" y2="20" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#05B1F5"/>
            <Stop offset="1" stopColor="#166DF6"/>
          </LinearGradient>
        </Defs>
      </Svg>
    );
  }

  return (
    <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
      <Path d="M7 8C9.20914 8 11 6.20914 11 4C11 1.79086 9.20914 0 7 0C4.79086 0 3 1.79086 3 4C3 6.20914 4.79086 8 7 8Z" fill="#7C8CA8"/>
      <Path opacity="0.6" d="M7 20C10.866 20 14 18.2091 14 16C14 13.7909 10.866 12 7 12C3.13401 12 0 13.7909 0 16C0 18.2091 3.13401 20 7 20Z" fill="#7C8CA8"/>
      <Path opacity="0.4" d="M13.5 6C14.8807 6 16 4.88071 16 3.5C16 2.11929 14.8807 1 13.5 1C12.1193 1 11 2.11929 11 3.5C11 4.88071 12.1193 6 13.5 6Z" fill="#7C8CA8"/>
      <Path opacity="0.4" d="M20 15.5C20 16.8807 18.8807 18 17.5 18C16.1193 18 15 16.8807 15 15.5C15 14.1193 16.1193 13 17.5 13C18.8807 13 20 14.1193 20 15.5Z" fill="#7C8CA8"/>
    </Svg>
  );
};