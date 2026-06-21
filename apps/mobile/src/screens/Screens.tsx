import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { Card, Button, Badge, ScreenView } from '../components';
import { useColors, spacing, borderRadius, typography } from '../theme';
import { API_URL } from '../config';

// ─── DefeitosScreen ──────────────────────────────────────────────────────────

type DefeitosProps = NativeStackScreenProps<RootStackParamList, 'Defeitos'>;

const PROBLEMAS_COMUNS = [
  { id:'p1', label:'Barulho na suspensão', icon: 'car-sport' as const },
  { id:'p2', label:'Falha no motor', icon: 'flash' as const },
  { id:'p3', label:'Luz de injeção acesa', icon: 'warning' as const },
  { id:'p4', label:'Vazamento de óleo', icon: 'water' as const },
  { id:'p5', label:'Freios com ruído', icon: 'disc' as const },
  { id:'p6', label:'Câmbio com dificuldade', icon: 'cog' as const },
  { id:'p7', label:'Ar condicionado', icon: 'snow' as const },
  { id:'p8', label:'Bateria fraca', icon: 'battery-dead' as const },
  { id:'p9', label:'Revisão programada', icon: 'calendar' as const },
];

export function DefeitosScreen({ navigation, route }: DefeitosProps) {
  const colors = useColors();
  const { osId, placa } = route.params;
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [outro, setOutro] = useState('');
  const [salvando, setSalvando] = useState(false);

  function toggle(id: string) {
    setSelecionados((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function criarOS() {
    const itens = [
      ...PROBLEMAS_COMUNS.filter((p) => selecionados.has(p.id)).map((p) => ({
        descricao: p.label, tipo: 'defeito' as const,
      })),
      ...(outro.trim() ? [{ descricao: outro.trim(), tipo: 'defeito' as const }] : []),
    ];
    if (itens.length === 0) {
      Alert.alert('Selecione ao menos um defeito', 'Marque o problema ou descreva no campo livre.');
      return;
    }
    setSalvando(true);
    try {
      await Promise.all(
        itens.map((item) =>
          fetch(`${API_URL}/os/${osId}/itens`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
          })
        )
      );
      navigation.replace('Acompanhamento', { osId });
    } catch {
      Alert.alert('Erro', 'Falha ao salvar os defeitos.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScreenView>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Problemas relatados para {placa}
      </Text>

      <Card>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Marque os defeitos</Text>
        <View style={styles.problemasGrid}>
          {PROBLEMAS_COMUNS.map((p) => {
            const ativo = selecionados.has(p.id);
            return (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.problemaChip,
                  {
                    backgroundColor: ativo ? colors.primary + '15' : colors.background,
                    borderColor: ativo ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => toggle(p.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={p.icon}
                  size={16}
                  color={ativo ? colors.primary : colors.textMuted}
                />
                <Text style={[styles.chipLabel, { color: ativo ? colors.primary : colors.textSecondary }]}>
                  {p.label}
                </Text>
                {ativo && (
                  <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Outro problema</Text>
        <TextInput
          style={[styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
          value={outro}
          onChangeText={setOutro}
          placeholder="Descreva um problema específico..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </Card>

      <Button
        title="Abrir ordem de serviço"
        onPress={criarOS}
        loading={salvando}
        style={{ marginTop: spacing.sm }}
      />
    </ScreenView>
  );
}

// ─── AcompanhamentoScreen ─────────────────────────────────────────────────────

type AcompProps = NativeStackScreenProps<RootStackParamList, 'Acompanhamento'>;

const STATUS_ITEM = ['pendente', 'em_andamento', 'concluido'] as const;
const STATUS_LABEL_ITEM: Record<string, string> = {
  pendente: 'Pendente',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
};
const STATUS_COLOR_ITEM: Record<string, string> = {
  pendente: '#8b91a8',
  em_andamento: '#eab308',
  concluido: '#22c55e',
};
const STATUS_ICON_ITEM: Record<string, keyof typeof Ionicons.glyphMap> = {
  pendente: 'ellipse-outline',
  em_andamento: 'sync-circle',
  concluido: 'checkmark-circle',
};

export function AcompanhamentoScreen({ navigation, route }: AcompProps) {
  const colors = useColors();
  const { osId } = route.params;
  const [itens, setItens] = useState([
    { id:'i1', descricao:'Barulho na suspensão', status:'em_andamento', valorMaoObra:0, valorPecas:0 },
    { id:'i2', descricao:'Troca de óleo 5W30',   status:'concluido',   valorMaoObra:80, valorPecas:150 },
    { id:'i3', descricao:'Revisão freios diant.', status:'pendente',    valorMaoObra:0, valorPecas:0 },
  ]);

  function mudarStatus(itemId: string, direcao: 1 | -1) {
    const item = itens.find((i) => i.id === itemId);
    if (!item) return;
    const idx = STATUS_ITEM.indexOf(item.status as any);
    const novoIdx = idx + direcao;
    if (novoIdx < 0 || novoIdx >= STATUS_ITEM.length) return;
    const novoStatus = STATUS_ITEM[novoIdx];
    setItens((prev) => prev.map((i) => (i.id === itemId ? { ...i, status: novoStatus } : i)));
    fetch(`${API_URL}/os/${osId}/itens/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: novoStatus }),
    }).catch(() => {});
  }

  const total = itens.reduce((s, i) => s + i.valorMaoObra + i.valorPecas, 0);
  const todosFeitos = itens.every((i) => i.status === 'concluido');

  return (
    <ScreenView>
      {itens.map((item) => {
        const cor = STATUS_COLOR_ITEM[item.status];
        const label = STATUS_LABEL_ITEM[item.status];
        const icon = STATUS_ICON_ITEM[item.status];
        const podeAvancar = item.status !== 'concluido';
        const podeVoltar = item.status !== 'pendente';

        return (
          <Card key={item.id} style={styles.itemCard}>
            <View style={styles.itemRow}>
              <Ionicons name={icon} size={22} color={cor} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemDesc, { color: colors.text }]}>{item.descricao}</Text>
                <Text style={[styles.statusText, { color: cor }]}>{label}</Text>
              </View>
              <View style={styles.statusActions}>
                {podeVoltar && (
                  <TouchableOpacity
                    style={[styles.statusBtn, { backgroundColor: colors.danger + '15' }]}
                    onPress={() => mudarStatus(item.id, -1)}
                  >
                    <Ionicons name="arrow-back" size={16} color={colors.danger} />
                  </TouchableOpacity>
                )}
                {podeAvancar && (
                  <TouchableOpacity
                    style={[styles.statusBtn, { backgroundColor: colors.primary + '20' }]}
                    onPress={() => mudarStatus(item.id, 1)}
                  >
                    <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Card>
        );
      })}

      {total > 0 && (
        <Card style={styles.totalCard}>
          <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total estimado</Text>
          <Text style={[styles.totalValue, { color: colors.primary }]}>
            {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </Text>
        </Card>
      )}

      {todosFeitos && (
        <Button
          title="Finalizar e notificar cliente"
          onPress={() => navigation.navigate('Finalizar', { osId })}
          style={{ marginTop: spacing.sm }}
        />
      )}
    </ScreenView>
  );
}

// ─── FinalizarScreen ─────────────────────────────────────────────────────────

type FinalizarProps = NativeStackScreenProps<RootStackParamList, 'Finalizar'>;

export function FinalizarScreen({ navigation, route }: FinalizarProps) {
  const colors = useColors();
  const { osId } = route.params;
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function finalizar() {
    setEnviando(true);
    try {
      await fetch(`${API_URL}/os/${osId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'concluido' }),
      });
      setEnviado(true);
    } catch {
      Alert.alert('Erro', 'Não foi possível finalizar a OS.');
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <ScreenView scroll={false}>
        <View style={styles.sucesso}>
          <View style={[styles.sucessoIcon, { backgroundColor: colors.success + '20' }]}>
            <Ionicons name="checkmark-done" size={48} color={colors.success} />
          </View>
          <Text style={[styles.sucessoTitle, { color: colors.text }]}>Serviço finalizado!</Text>
          <Text style={[styles.sucessoSub, { color: colors.textSecondary }]}>
            Mensagem enviada ao cliente via WhatsApp.
          </Text>
          <Button
            title="Voltar à pista"
            onPress={() => navigation.navigate('Pistas')}
            style={{ width: '100%', marginTop: spacing.xl }}
          />
        </View>
      </ScreenView>
    );
  }

  return (
    <ScreenView>
      <Card>
        <View style={styles.confirmHeader}>
          <Ionicons name="chatbubbles-outline" size={32} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.textMuted, marginTop: spacing.sm }]}>
            Resumo dos serviços
          </Text>
        </View>
        <Text style={[styles.confirmText, { color: colors.textSecondary }]}>
          Ao confirmar, a OS será marcada como concluída e o cliente receberá uma
          mensagem automática no WhatsApp com a lista de serviços realizados.
        </Text>
      </Card>

      <Button
        title="Finalizar e notificar via WhatsApp"
        onPress={finalizar}
        loading={enviando}
        style={{ marginTop: spacing.sm }}
      />
    </ScreenView>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: spacing.sm,
  },

  // Defeitos
  problemasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  problemaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 14,
    minHeight: 80,
  },

  // Acompanhamento
  itemCard: {
    padding: spacing.lg,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  itemDesc: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  statusActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  statusBtn: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
  },

  // Finalizar
  sucesso: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  sucessoIcon: {
    width: 88,
    height: 88,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  sucessoTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  sucessoSub: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  confirmHeader: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  confirmText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
});
