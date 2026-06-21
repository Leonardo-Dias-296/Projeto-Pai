import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { Card, Button, ScreenView } from '../components';
import { useColors, spacing, borderRadius, typography } from '../theme';
import { API_URL } from '../config';
import type { NivelCombustivel } from '@autocontrol/shared';

type Props = NativeStackScreenProps<RootStackParamList, 'CheckIn'>;

const COMBUSTIVEL: { valor: NivelCombustivel; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { valor: 'vazio',  label: 'Vazio',  icon: 'battery-dead' },
  { valor: 'quarto', label: '1/4',    icon: 'battery-charging' },
  { valor: 'meio',   label: '1/2',    icon: 'battery-half' },
  { valor: 'cheio',  label: 'Cheio',  icon: 'battery-full' },
];

export function CheckInScreen({ navigation, route }: Props) {
  const colors = useColors();
  const { veiculoId, placa } = route.params;

  const [km, setKm] = useState('');
  const [combustivel, setCombustivel] = useState<NivelCombustivel>('meio');
  const [relato, setRelato] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function confirmar() {
    if (!km) {
      Alert.alert('KM obrigatório', 'Informe a quilometragem atual do veículo.');
      return;
    }
    setSalvando(true);
    try {
      const res = await fetch(`${API_URL}/os`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          veiculoId,
          kmEntrada: Number(km.replace(/\D/g, '')),
          nivelCombustivel: combustivel,
          relatoCliente: relato.trim() || undefined,
        }),
      });
      const os = await res.json();
      navigation.replace('Defeitos', { osId: os.id, placa });
    } catch {
      Alert.alert('Erro', 'Não foi possível criar a ordem de serviço.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScreenView>
      <Card>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Quilometragem</Text>
        <TextInput
          style={[styles.kmInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
          value={km}
          onChangeText={setKm}
          placeholder="152.300"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
        />
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Nível de combustível</Text>
        <View style={styles.combRow}>
          {COMBUSTIVEL.map((c) => {
            const ativo = combustivel === c.valor;
            return (
              <TouchableOpacity
                key={c.valor}
                style={[
                  styles.combBtn,
                  {
                    backgroundColor: colors.background,
                    borderColor: ativo ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setCombustivel(c.valor)}
              >
                <Ionicons
                  name={c.icon}
                  size={18}
                  color={ativo ? colors.primary : colors.textMuted}
                />
                <Text style={[styles.combLbl, { color: ativo ? colors.primary : colors.textSecondary }]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
          Relato do cliente <Text style={[styles.opcional, { color: colors.textMuted }]}>(opcional)</Text>
        </Text>
        <TextInput
          style={[styles.relatoInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
          value={relato}
          onChangeText={setRelato}
          placeholder="O que o cliente está relatando?"
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </Card>

      <Button
        title="Registrar defeitos"
        onPress={confirmar}
        loading={salvando}
        style={{ marginTop: spacing.sm }}
      />
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    ...typography.h2,
    marginBottom: spacing.sm,
  },
  opcional: {
    fontWeight: '400',
    textTransform: 'none',
    letterSpacing: 0,
  },
  kmInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: 12,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  combRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  combBtn: {
    flex: 1,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  combLbl: {
    fontSize: 12,
    fontWeight: '600',
  },
  relatoInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 14,
    minHeight: 100,
  },
});
