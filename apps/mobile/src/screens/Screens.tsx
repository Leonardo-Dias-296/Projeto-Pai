/**
 * DefeitosScreen — checklist de problemas + campo livre
 */

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { API_URL } from '../config';

type Props = NativeStackScreenProps<RootStackParamList, 'Defeitos'>;

const PROBLEMAS_COMUNS = [
  { id:'p1', label:'Barulho na suspensão' },
  { id:'p2', label:'Falha / engasgos no motor' },
  { id:'p3', label:'Luz de injeção acesa' },
  { id:'p4', label:'Vazamento de óleo' },
  { id:'p5', label:'Freios com ruído' },
  { id:'p6', label:'Câmbio com dificuldade' },
  { id:'p7', label:'Ar condicionado sem funcionar' },
  { id:'p8', label:'Bateria fraca / motor não parte' },
  { id:'p9', label:'Revisão programada' },
];

export function DefeitosScreen({ navigation, route }: Props) {
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
        descricao: p.label,
        tipo: 'defeito',
      })),
      ...(outro.trim() ? [{ descricao: outro.trim(), tipo: 'defeito' }] : []),
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
    <ScrollView style={s.container} contentContainerStyle={s.content}>

      <Text style={s.subtitle}>Problemas relatados para {placa}</Text>

      <View style={s.card}>
        <Text style={s.sectionTitle}>Marque os defeitos</Text>
        {PROBLEMAS_COMUNS.map((p) => {
          const ativo = selecionados.has(p.id);
          return (
            <TouchableOpacity
              key={p.id}
              style={[s.checkRow, ativo && s.checkRowActive]}
              onPress={() => toggle(p.id)}
            >
              <View style={[s.checkbox, ativo && s.checkboxActive]}>
                {ativo && <Text style={s.checkmark}>✓</Text>}
              </View>
              <Text style={[s.checkLabel, ativo && { color: '#e8eaf0' }]}>{p.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={s.card}>
        <Text style={s.sectionTitle}>Outro problema</Text>
        <TextInput
          style={s.textArea}
          value={outro}
          onChangeText={setOutro}
          placeholder="Descreva um problema específico..."
          placeholderTextColor="#8b91a8"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity
        style={[s.btnPrimary, salvando && { opacity: 0.6 }]}
        onPress={criarOS}
        disabled={salvando}
      >
        {salvando
          ? <ActivityIndicator color="#fff" />
          : <Text style={s.btnTxt}>Abrir ordem de serviço →</Text>
        }
      </TouchableOpacity>

    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
/**
 * AcompanhamentoScreen — lista de itens da OS com atualização de status
 */

type AcompProps = NativeStackScreenProps<RootStackParamList, 'Acompanhamento'>;

const STATUS_ITEM = ['pendente', 'em_andamento', 'concluido'] as const;
const STATUS_LABEL_ITEM: Record<string, string> = {
  pendente: '⏳ Pendente',
  em_andamento: '🔧 Andamento',
  concluido: '✅ Concluído',
};
const STATUS_COLOR_ITEM: Record<string, string> = {
  pendente: '#8b91a8',
  em_andamento: '#eab308',
  concluido: '#22c55e',
};

export function AcompanhamentoScreen({ navigation, route }: AcompProps) {
  const { osId } = route.params;
  const [itens, setItens] = useState([
    { id:'i1', descricao:'Barulho na suspensão', status:'em_andamento', valorMaoObra:0, valorPecas:0 },
    { id:'i2', descricao:'Troca de óleo 5W30',   status:'concluido',   valorMaoObra:80, valorPecas:150 },
    { id:'i3', descricao:'Revisão freios diant.', status:'pendente',    valorMaoObra:0, valorPecas:0 },
  ]);

  async function avancarStatus(itemId: string) {
    const item = itens.find((i) => i.id === itemId);
    if (!item) return;

    const idx = STATUS_ITEM.indexOf(item.status as any);
    if (idx >= STATUS_ITEM.length - 1) return;
    const novoStatus = STATUS_ITEM[idx + 1];

    setItens((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, status: novoStatus } : i))
    );

    await fetch(`${API_URL}/os/${osId}/itens/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: novoStatus }),
    }).catch(() => {});
  }

  const total = itens.reduce((s, i) => s + i.valorMaoObra + i.valorPecas, 0);
  const todosFeitos = itens.every((i) => i.status === 'concluido');

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>

      {itens.map((item) => {
        const cor = STATUS_COLOR_ITEM[item.status];
        const label = STATUS_LABEL_ITEM[item.status];
        const podAvancar = item.status !== 'concluido';

        return (
          <View key={item.id} style={s.itemCard}>
            <View style={s.itemTop}>
              <View style={[s.dot, { backgroundColor: cor }]} />
              <Text style={s.itemDesc}>{item.descricao}</Text>
            </View>
            <View style={s.itemBottom}>
              <Text style={[s.statusLbl, { color: cor }]}>{label}</Text>
              {podAvancar && (
                <TouchableOpacity style={s.avancarBtn} onPress={() => avancarStatus(item.id)}>
                  <Text style={s.avancarTxt}>Avançar →</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      })}

      {total > 0 && (
        <View style={s.totalCard}>
          <Text style={s.totalLabel}>Total estimado</Text>
          <Text style={s.totalValue}>
            {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </Text>
        </View>
      )}

      {todosFeitos && (
        <TouchableOpacity
          style={s.btnPrimary}
          onPress={() => navigation.navigate('Finalizar', { osId })}
        >
          <Text style={s.btnTxt}>Finalizar e notificar cliente →</Text>
        </TouchableOpacity>
      )}

    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
/**
 * FinalizarScreen — resumo final + disparo do WhatsApp
 */

type FinalizarProps = NativeStackScreenProps<RootStackParamList, 'Finalizar'>;

export function FinalizarScreen({ navigation, route }: FinalizarProps) {
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
      <View style={[s.container, { alignItems: 'center', justifyContent: 'center', padding: 32 }]}>
        <Text style={{ fontSize: 64 }}>✅</Text>
        <Text style={[s.subtitle, { textAlign: 'center', marginTop: 16, fontSize: 18, fontWeight: '700', color: '#e8eaf0' }]}>
          Serviço finalizado!
        </Text>
        <Text style={[s.subtitle, { textAlign: 'center', marginTop: 8 }]}>
          Mensagem enviada ao cliente via WhatsApp.
        </Text>
        <TouchableOpacity
          style={[s.btnPrimary, { marginTop: 32, width: '100%' }]}
          onPress={() => navigation.navigate('Pistas')}
        >
          <Text style={s.btnTxt}>Voltar à pista</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.card}>
        <Text style={s.sectionTitle}>Resumo dos serviços</Text>
        <Text style={{ color: '#8b91a8', fontSize: 13 }}>
          Ao confirmar, a OS será marcada como concluída e o cliente receberá uma mensagem automática no WhatsApp com a lista de serviços realizados.
        </Text>
      </View>

      <TouchableOpacity
        style={[s.btnPrimary, enviando && { opacity: 0.6 }]}
        onPress={finalizar}
        disabled={enviando}
      >
        {enviando
          ? <ActivityIndicator color="#fff" />
          : <Text style={s.btnTxt}>💬 Finalizar e notificar via WhatsApp</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Estilos compartilhados
// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  subtitle: { fontSize: 14, color: '#8b91a8' },

  card: {
    backgroundColor: '#181c27', borderRadius: 12,
    borderWidth: 1, borderColor: '#252a38', padding: 16, gap: 10,
  },
  sectionTitle: { fontSize: 12, color: '#8b91a8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },

  checkRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderBottomWidth: 1, borderColor: '#252a38',
  },
  checkRowActive: { backgroundColor: 'transparent' },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
    borderColor: '#3a4055', alignItems: 'center', justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: '#f97316', borderColor: '#f97316' },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  checkLabel: { fontSize: 14, color: '#8b91a8', flex: 1 },

  textArea: {
    backgroundColor: '#0f1117', borderWidth: 1, borderColor: '#252a38',
    borderRadius: 8, padding: 12, fontSize: 14, color: '#e8eaf0', minHeight: 80,
  },

  itemCard: {
    backgroundColor: '#181c27', borderRadius: 12,
    borderWidth: 1, borderColor: '#252a38', padding: 14, gap: 8,
  },
  itemTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  itemDesc: { fontSize: 14, color: '#e8eaf0', fontWeight: '600', flex: 1 },
  itemBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusLbl: { fontSize: 12, fontWeight: '600' },
  avancarBtn: { backgroundColor: '#f9731620', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
  avancarTxt: { color: '#f97316', fontSize: 12, fontWeight: '700' },

  totalCard: {
    backgroundColor: '#181c27', borderRadius: 12, borderWidth: 1, borderColor: '#252a38',
    padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  totalLabel: { color: '#8b91a8', fontSize: 14, fontWeight: '600' },
  totalValue: { color: '#f97316', fontSize: 20, fontWeight: '800' },

  btnPrimary: { backgroundColor: '#f97316', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 4 },
  btnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
