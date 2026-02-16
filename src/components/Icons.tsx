import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, Polygon, Line } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

// Lightning Icon
export const LightningIcon = ({ size = 24, color = '#00FF94' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
      fill={color}
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Dumbbell Icon
export const DumbbellIcon = ({ size = 24, color = '#00FF94' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6.5 6L6.5 18M17.5 6L17.5 18M3 9L3 15M21 9L21 15M6.5 9L17.5 9M6.5 15L17.5 15"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="3" cy="9" r="1.5" fill={color} />
    <Circle cx="3" cy="15" r="1.5" fill={color} />
    <Circle cx="21" cy="9" r="1.5" fill={color} />
    <Circle cx="21" cy="15" r="1.5" fill={color} />
  </Svg>
);

// Apple Icon (Nutrition)
export const AppleIcon = ({ size = 24, color = '#00FF94' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3c-1.5 0-2.5 1-2.5 2.5S11 8 12 8s2.5-1 2.5-2.5S13.5 3 12 3z"
      fill={color}
    />
    <Path
      d="M12 8c-3.5 0-6.5 2-7 5.5-.3 2 .5 4 2 5.5 1 1 2.5 2 4 2s3-1 4-2c1.5-1.5 2.3-3.5 2-5.5C16.5 10 13.5 8 12 8z"
      fill={color}
      stroke={color}
      strokeWidth="1.5"
    />
  </Svg>
);

// Fire Icon (Streak)
export const FireIcon = ({ size = 24, color = '#FF6B9D' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2c-1 3-3 5-6 6 0 4 2 7 6 9 4-2 6-5 6-9-3-1-5-3-6-6z"
      fill={color}
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 17c-2-1-3-2.5-3-4.5 1.5 0 2.5-1 3-2.5.5 1.5 1.5 2.5 3 2.5 0 2-1 3.5-3 4.5z"
      fill="#FFB800"
    />
  </Svg>
);

// Target Icon (Mission)
export const TargetIcon = ({ size = 24, color = '#00FF94' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
    <Circle cx="12" cy="12" r="6" stroke={color} strokeWidth="2" fill="none" />
    <Circle cx="12" cy="12" r="2" fill={color} />
  </Svg>
);

// Trophy Icon
export const TrophyIcon = ({ size = 24, color = '#FFB800' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 8V6c0-1 1-2 2-2h6c1 0 2 1 2 2v2M7 8h10M7 8c-2 0-3 1-3 3s1 3 3 3m10-6c2 0 3 1 3 3s-1 3-3 3m0 0c0 3-2 5-5 5s-5-2-5-5m10 0H7"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 19h6M12 16v3"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

// History/Clock Icon
export const HistoryIcon = ({ size = 24, color = '#00D9FF' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
    <Path
      d="M12 6v6l4 4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Plus Icon
export const PlusIcon = ({ size = 24, color = '#FFFFFF' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5v14M5 12h14"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
    />
  </Svg>
);

// Water Drop Icon
export const WaterIcon = ({ size = 24, color = '#00D9FF' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2.5c-3 3.5-6 7-6 10.5 0 3.5 2.5 6 6 6s6-2.5 6-6c0-3.5-3-7-6-10.5z"
      fill={color}
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Search Icon
export const SearchIcon = ({ size = 24, color = '#94A3B8' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" fill="none" />
    <Path
      d="M21 21l-4.35-4.35"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

// Checkmark Icon
export const CheckIcon = ({ size = 24, color = '#00FF94' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 13l4 4L19 7"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Close/X Icon
export const CloseIcon = ({ size = 24, color = '#FF6B9D' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6l12 12"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </Svg>
);

// Stats/Chart Icon
export const StatsIcon = ({ size = 24, color = '#00FF94' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="13" width="4" height="8" rx="1" fill={color} />
    <Rect x="10" y="8" width="4" height="13" rx="1" fill={color} />
    <Rect x="17" y="3" width="4" height="18" rx="1" fill={color} />
  </Svg>
);