import { useColorScheme } from 'react-native';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface Theme {
  dark: boolean;
  background: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  accentText: string;
  success: string;
  warning: string;
  danger: string;
  focus: string;
  breakColor: string;
}

const light: Theme = {
  dark: false,
  background: '#F6F7FB',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF0F6',
  text: '#111827',
  muted: '#6B7280',
  border: '#E5E7EB',
  accent: '#4F46E5',
  accentText: '#FFFFFF',
  success: '#059669',
  warning: '#D97706',
  danger: '#DC2626',
  focus: '#4F46E5',
  breakColor: '#059669',
};

const dark: Theme = {
  dark: true,
  background: '#0B1220',
  surface: '#111827',
  surfaceMuted: '#1F2937',
  text: '#F9FAFB',
  muted: '#9CA3AF',
  border: '#1F2937',
  accent: '#818CF8',
  accentText: '#111827',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
  focus: '#818CF8',
  breakColor: '#34D399',
};

export function getTheme(mode: ThemeMode, systemDark: boolean): Theme {
  if (mode === 'light') return light;
  if (mode === 'dark') return dark;
  return systemDark ? dark : light;
}

export function useTheme(mode: ThemeMode = 'system'): Theme {
  const scheme = useColorScheme();
  return getTheme(mode, scheme === 'dark');
}
