import {
  TouchableOpacity, Text, ActivityIndicator,
  type TouchableOpacityProps, StyleSheet,
} from 'react-native';
import { useColors, spacing, borderRadius, typography } from '../theme';

type Props = TouchableOpacityProps & {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
};

export function Button({ title, loading, variant = 'primary', style, disabled, ...props }: Props) {
  const colors = useColors();

  const bg = variant === 'primary' ? colors.primary
    : variant === 'secondary' ? colors.surfaceElevated
    : 'transparent';

  const txtColor = variant === 'primary' ? '#ffffff'
    : variant === 'secondary' ? colors.text
    : colors.primary;

  const border = variant === 'secondary' ? colors.border : 'transparent';

  return (
    <TouchableOpacity
      style={[
        styles.base,
        { backgroundColor: bg, borderColor: border, opacity: disabled || loading ? 0.6 : 1 },
        style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={txtColor} />
      ) : (
        <Text style={[styles.text, { color: txtColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minHeight: 48,
  },
  text: {
    ...typography.bodyBold,
  },
});
