import { useColorScheme } from 'react-native';

export type ThemeColors = {
  primary: string;
  primaryLight: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  danger: string;
  success: string;
  warning: string;
  info: string;
};

const light: ThemeColors = {
  primary: '#f97316',
  primaryLight: '#ffedd5',
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceElevated: '#ffffff',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  danger: '#ef4444',
  success: '#22c55e',
  warning: '#eab308',
  info: '#3b82f6',
};

const dark: ThemeColors = {
  primary: '#f97316',
  primaryLight: '#431e05',
  background: '#0f1117',
  surface: '#181c27',
  surfaceElevated: '#1e2332',
  text: '#e8eaf0',
  textSecondary: '#8b91a8',
  textMuted: '#3a4055',
  border: '#252a38',
  borderLight: '#1e2332',
  danger: '#ef4444',
  success: '#22c55e',
  warning: '#eab308',
  info: '#3b82f6',
};

export function useColors(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const typography = {
  caption: { fontSize: 12, lineHeight: 16 },
  body: { fontSize: 14, lineHeight: 20 },
  bodyBold: { fontSize: 14, lineHeight: 20, fontWeight: '700' as const },
  subtitle: { fontSize: 15, lineHeight: 22, fontWeight: '600' as const },
  title: { fontSize: 18, lineHeight: 24, fontWeight: '700' as const },
  h2: { fontSize: 13, lineHeight: 18, fontWeight: '600' as const, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
};
