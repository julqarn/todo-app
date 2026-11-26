import { Pressable, StyleSheet, Text } from 'react-native';
import type { Theme } from '@/theme';

interface Props {
  label: string;
  selected?: boolean;
  theme: Theme;
  onPress: () => void;
}

export function Chip({ label, selected, theme, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.accent : theme.surfaceMuted,
          borderColor: selected ? theme.accent : theme.border,
        },
      ]}
    >
      <Text style={{ color: selected ? theme.accentText : theme.text, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
});
