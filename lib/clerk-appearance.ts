import { dark } from '@clerk/themes';
import type { Appearance } from '@clerk/types';

export const clerkAppearance: Appearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: '#00D4FF',
    colorBackground: '#1E2329',
    colorInputBackground: '#2B3139',
    colorText: '#EAECEF',
    colorTextSecondary: '#848E9C',
    borderRadius: '0.5rem',
  },
};
