import { View, type ViewProps, StyleSheet } from 'react-native';
import { useColors, spacing, borderRadius } from '../theme';

type Props = ViewProps & { elevated?: boolean };

export function Card({ style, elevated, ...props }: Props) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: elevated ? colors.surfaceElevated : colors.surface,
          borderColor: colors.border,
        },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
});
