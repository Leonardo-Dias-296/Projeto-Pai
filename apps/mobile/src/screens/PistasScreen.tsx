import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, useWindowDimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { Card, Badge, ScreenView } from '../components';
import { useColors, spacing, borderRadius, typography } from '../theme';
import { API_URL } from '../config';

type Props = NativeStackScreenProps<RootStackParamList, 'Pistas'>;

const STATUS_LABEL: Record<string, string> = {
  aguardando_diagnostico: 'Diagnóstico',
  em_reparo: 'Em reparo',
  aguardando_aprovacao: 'Aprovação',
  aprovado: 'Aprovado',
  concluido: 'Concluído',
};

const STATUS_COLOR: Record<string, string> = {
  aguardando_diagnostico: '#3b82f6',
  em_reparo: '#eab308',
  aguardando_aprovacao: '#8b91a8',
  aprovado: '#22c55e',
  concluido: '#22c55e',
};

const STATUS_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  aguardando_diagnostico: 'search',
  em_reparo: 'build',
  aguardando_aprovacao: 'time',
  aprovado: 'checkmark-circle',
  concluido: 'checkmark-done',
};

const MOCK_OS = [
  { id:'1', numero:'OS-00258', placa:'ABC1D23', cliente:'Carlos Mendes', veiculo:'VW Gol 2019', status:'em_reparo', total:680, kmEntrada:152300 },
  { id:'2', numero:'OS-00257', placa:'DEF4G56', cliente:'Maria Oliveira', veiculo:'Fiat Argo 2022', status:'aguardando_aprovacao', total:320, kmEntrada:34200 },
  { id:'3', numero:'OS-00255', placa:'NOP3Q45', cliente:'Roberto Lima', veiculo:'Toyota Corolla 2023', status:'aguardando_diagnostico', total:0, kmEntrada:12300 },
];

export function PistasScreen({ navigation }: Props) {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const [ordens, setOrdens] = useState(MOCK_OS);
  const [carregando, setCarregando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      carregarOS();
    }, [])
  );

  async function carregarOS() {
    setCarregando(true);
    try {
      const res = await fetch(`${API_URL}/os?status=em_andamento`);
      if (res.ok) {
        const json = await res.json();
        setOrdens(json.data ?? MOCK_OS);
      }
    } catch {
    } finally {
      setCarregando(false);
    }
  }

  function renderOS({ item }: { item: typeof MOCK_OS[0] }) {
    const cor = STATUS_COLOR[item.status] ?? '#8b91a8';
    const label = STATUS_LABEL[item.status] ?? item.status;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate('Acompanhamento', { osId: item.id })}
        style={isTablet ? styles.cardTablet : undefined}
      >
        <Card elevated style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTopLeft}>
              <View style={[styles.statusIcon, { backgroundColor: cor + '20' }]}>
                <Ionicons name={STATUS_ICON[item.status] || 'ellipse'} size={14} color={cor} />
              </View>
              <View>
                <Text style={[styles.placa, { color: colors.text }]}>{item.placa}</Text>
                <Text style={[styles.veiculo, { color: colors.textSecondary }]}>{item.veiculo}</Text>
              </View>
            </View>
            <Text style={[styles.numero, { color: colors.textMuted }]}>{item.numero}</Text>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={14} color={colors.textMuted} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>{item.cliente}</Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <Badge label={label} color={cor} />
            {item.total > 0 && (
              <Text style={[styles.total, { color: colors.primary }]}>
                {item.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </Text>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <ScreenView scroll={false}>
      <FlatList
        data={ordens}
        keyExtractor={(o) => o.id}
        renderItem={renderOS}
        numColumns={isTablet ? 2 : 1}
        columnWrapperStyle={isTablet ? styles.gridRow : undefined}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={carregando}
            onRefresh={carregarOS}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Veículos na pista</Text>
            <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
              {ordens.length} veículo{ordens.length !== 1 ? 's' : ''} em atendimento
            </Text>
          </View>
        }
        ListEmptyComponent={
          carregando ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 60 }} />
          ) : (
            <View style={styles.empty}>
              <View style={[styles.emptyIconWrap, { backgroundColor: colors.surfaceElevated }]}>
                <Ionicons name="flag-outline" size={32} color={colors.textMuted} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhum veículo na pista</Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                Toque no botão abaixo para registrar uma entrada
              </Text>
            </View>
          )
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('ScanPlaca')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
    paddingBottom: 100,
    gap: spacing.md,
  },
  gridRow: {
    gap: spacing.md,
  },
  card: {
    padding: spacing.lg,
    gap: spacing.md,
    width: '100%',
  },
  cardTablet: {
    flex: 1,
    maxWidth: '50%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placa: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
    fontFamily: 'Courier New',
  },
  veiculo: {
    fontSize: 13,
    marginTop: 1,
  },
  numero: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardBody: {
    gap: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: {
    fontSize: 13,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  total: {
    fontSize: 15,
    fontWeight: '800',
  },

  header: {
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerSub: {
    fontSize: 13,
    marginTop: 2,
  },

  empty: {
    alignItems: 'center',
    marginTop: 60,
    gap: spacing.md,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: spacing.xxl,
  },

  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f97316',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});
