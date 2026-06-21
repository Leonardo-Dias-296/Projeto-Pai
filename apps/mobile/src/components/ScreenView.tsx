import { SafeAreaView, ScrollView, View, type ViewProps, StyleSheet } from 'react-native';
import { useColors, spacing } from '../theme';

type Props = ViewProps & {
  scroll?: boolean;
  safe?: boolean;
};

export function ScreenView({ scroll = true, safe = true, style, children, ...props }: Props) {
  const colors = useColors();
  const Wrapper = safe ? SafeAreaView : View;
  const content = (
    <Wrapper style={[styles.safe, { backgroundColor: colors.background }, style]} {...props}>
      {children}
    </Wrapper>
  );
  if (!scroll) return content;
  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {content}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxxl, flexGrow: 1 },
});
