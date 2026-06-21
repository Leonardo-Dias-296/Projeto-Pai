/**
 * PistasScreen — visão geral de todos os veículos em atendimento.
 * Equivale ao "painel de pista" do chefe de oficina.
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { API_URL } from '../config';

type Props = NativeStackScreenProps<RootStackParamList, 'Pistas'>;

const STATUS_LABEL: Record<string, string> = {
  aguardando_diagnostico: '🔍 Diagnóstico',
  em_reparo:              '🔧 Em reparo',
  aguardando_aprovacao:   '⏳ Aprovação',
  aprovado:               '✅ Aprovado',
  concluido:              '✔ Concluído',
};

const STATUS_COLOR: Record<string, string> = {
  aguardando_diagnostico: '#3b82f6',
  em_reparo:              '#eab308',
  aguardando_aprovacao:   '#8b91a8',
  aprovado:               '#22c55e',
  concluido:              '#22c55e',
};

// Dados mockados para desenvolvimento — substitua pelo fetch real
const MOCK_OS = [
  { id:'1', numero:'OS-00258', placa:'ABC1D23', cliente:'Carlos Mendes', veiculo:'VW Gol 2019', status:'em_reparo', total:680, kmEntrada:152300 },
  { id:'2', numero:'OS-00257', placa:'DEF4G56', cliente:'Maria Oliveira', veiculo:'Fiat Argo 2022', status:'aguardando_aprovacao', total:320, kmEntrada:34200 },
  { id:'3', numero:'OS-00255', placa:'NOP3Q45', cliente:'Roberto Lima', veiculo:'Toyota Corolla 2023', status:'aguardando_diagnostico', total:0, kmEntrada:12300 },
];

export function PistasScreen({ navigation }: Props) {
  const [ordens, setOrdens] = useState<typeof MOCK_OS>(MOCK_OS);
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
      // Mantém mock em desenvolvimento
    } finally {
      setCarregando(false);
    }
  }

  function renderOS({ item }: { item: typeof MOCK_OS[0] }) {
    const cor = STATUS_COLOR[item.status] ?? '#8b91a8';
    const label = STATUS_LABEL[item.status] ?? item.status;

    return (
      <TouchableOpacity
        style={s.card}
        onPress={() => navigation.navigate('Acompanhamento', { osId: item.id })}
        activeOpacity={0.75}
      >
        <View style={s.cardTop}>
          <View style={[s.statusDot, { backgroundColor: cor }]} />
          <Text style={s.placa}>{item.placa}</Text>
          <Text style={s.numero}>{item.numero}</Text>
        </View>

        <Text style={s.veiculo}>{item.veiculo}</Text>
        <Text style={s.cliente}>{item.cliente}</Text>

        <View style={s.cardBottom}>
          <View style={[s.statusBadge, { backgroundColor: cor + '20', borderColor: cor + '40' }]}>
            <Text style={[s.statusText, { color: cor }]}>{label}</Text>
          </View>
          {item.total > 0 && (
            <Text style={s.total}>
              {item.total.toLocaleString('pt-BR', { style:'currency', currency:'BRL' })}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={s.container}>
      <FlatList
        data={ordens}
        keyExtractor={(o) => o.id}
        renderItem={renderOS}
        contentContainerStyle={s.list}
        refreshControl={
          <RefreshControl
            refreshing={carregando}
            onRefresh={carregarOS}
            tintColor="#f97316"
          />
        }
        ListEmptyComponent={
          carregando ? (
            <ActivityIndicator color="#f97316" style={{ marginTop: 60 }} />
          ) : (
            <View style={s.empty}>
              <Text style={s.emptyIcon}>🏁</Text>
              <Text style={s.emptyText}>Nenhum veículo na pista</Text>
              <Text style={s.emptySub}>Toque em + para registrar uma entrada</Text>
            </View>
          )
        }
      />

      {/* FAB — novo veículo */}
      <TouchableOpacity
        style={s.fab}
        onPress={() => navigation.navigate('ScanPlaca')}
        activeOpacity={0.8}
      >
        <Text style={s.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, gap: 12, paddingBottom: 100 },

  card: {
    backgroundColor: '#181c27',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#252a38',
    gap: 4,
  },

  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  placa: { fontFamily: 'Courier New', fontWeight: '700', fontSize: 15, color: '#e8eaf0', letterSpacing: 1 },
  numero: { marginLeft: 'auto', fontSize: 12, color: '#8b91a8' },

  veiculo: { fontSize: 14, color: '#e8eaf0', fontWeight: '600' },
  cliente: { fontSize: 13, color: '#8b91a8' },

  cardBottom: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 10 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, borderWidth: 1 },
  statusText: { fontSize: 12, fontWeight: '600' },
  total: { marginLeft: 'auto', fontSize: 13, fontWeight: '700', color: '#f97316' },

  empty: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#e8eaf0' },
  emptySub: { fontSize: 13, color: '#8b91a8', marginTop: 6 },

  fab: {
    position: 'absolute', bottom: 28, right: 24,
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#f97316',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#f97316', shadowOpacity: .5, shadowRadius: 12, elevation: 8,
  },
  fabIcon: { fontSize: 28, color: '#fff', lineHeight: 32 },
});
