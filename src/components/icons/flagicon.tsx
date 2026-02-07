import React, { ComponentProps } from "react";
import type { Country } from 'react-phone-number-input';
import * as Flags from "country-flag-icons/react/3x2";
type CountryCode = keyof typeof Flags;

interface FlagIconProps {
  country: CountryCode | 'EU'; 
}

export const FlagIcon = ({ country }: FlagIconProps) => {
  const FlagComponent = Flags[country as keyof typeof Flags];
  // Render the flag or a fallback placeholder if not found
  if (country === 'EU') {
    return <Flags.EU style={{ width: '18px', height: '12px', borderRadius: '2px' }} />;
  }
  return FlagComponent ? (
    <FlagComponent style={{ width: '18px', height: '12px' }} />
  ) : (
    <div style={{ width: '18px', height: '12px', background: '#eee' }} />
  );
};