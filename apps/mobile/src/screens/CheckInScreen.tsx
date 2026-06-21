import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { API_URL } from '../config';
import type { NivelCombustivel } from '@autocontrol/shared';

type Props = NativeStackScreenProps<RootStackParamList, 'CheckIn'>;

const COMBUSTIVEL: { valor: NivelCombustivel; label: string; icone: string }[] = [
  { valor: 'vazio',  label: 'Vazio',  icone: '▪' },
  { valor: 'quarto', label: '1/4',    icone: '▪▪' },
  { valor: 'meio',   label: '1/2',    icone: '▪▪▪' },
  { valor: 'cheio',  label: 'Cheio',  icone: '▪▪▪▪' },
];

export function CheckInScreen({ navigation, route }: Props) {
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
    <ScrollView style={s.container} contentContainerStyle={s.content}>

      <View style={s.card}>
        <Text style={s.sectionTitle}>Quilometragem</Text>
        <TextInput
          style={s.kmInput}
          value={km}
          onChangeText={setKm}
          placeholder="ex: 152.300"
          placeholderTextColor="#8b91a8"
          keyboardType="numeric"
        />
      </View>

      <View style={s.card}>
        <Text style={s.sectionTitle}>Nível de combustível</Text>
        <View style={s.combRow}>
          {COMBUSTIVEL.map((c) => (
            <TouchableOpacity
              key={c.valor}
              style={[s.combBtn, combustivel === c.valor && s.combBtnActive]}
              onPress={() => setCombustivel(c.valor)}
            >
              <Text style={[s.combIcn, combustivel === c.valor && { color: '#f97316' }]}>{c.icone}</Text>
              <Text style={[s.combLbl, combustivel === c.valor && { color: '#f97316' }]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.sectionTitle}>Relato do cliente <Text style={s.opcional}>(opcional)</Text></Text>
        <TextInput
          style={s.relatoInput}
          value={relato}
          onChangeText={setRelato}
          placeholder="O que o cliente está relatando? Ex: barulho na suspensão dianteira ao freiar..."
          placeholderTextColor="#8b91a8"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity
        style={[s.btnPrimary, salvando && { opacity: 0.6 }]}
        onPress={confirmar}
        disabled={salvando}
      >
        {salvando
          ? <ActivityIndicator color="#fff" />
          : <Text style={s.btnTxt}>Registrar defeitos →</Text>
        }
      </TouchableOpacity>

    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },

  card: {
    backgroundColor: '#181c27', borderRadius: 12,
    borderWidth: 1, borderColor: '#252a38', padding: 16, gap: 10,
  },

  sectionTitle: { fontSize: 13, color: '#8b91a8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  opcional: { color: '#3a4055', textTransform: 'none', letterSpacing: 0 },

  kmInput: {
    backgroundColor: '#0f1117', borderWidth: 1, borderColor: '#252a38',
    borderRadius: 8, padding: 12, fontSize: 24, fontWeight: '700',
    color: '#e8eaf0', textAlign: 'center',
  },

  combRow: { flexDirection: 'row', gap: 8 },
  combBtn: {
    flex: 1, backgroundColor: '#0f1117', borderRadius: 8,
    borderWidth: 1, borderColor: '#252a38', padding: 12, alignItems: 'center', gap: 4,
  },
  combBtnActive: { borderColor: '#f97316', backgroundColor: '#f9731610' },
  combIcn: { fontSize: 12, color: '#8b91a8', letterSpacing: 2 },
  combLbl: { fontSize: 12, color: '#8b91a8', fontWeight: '600' },

  relatoInput: {
    backgroundColor: '#0f1117', borderWidth: 1, borderColor: '#252a38',
    borderRadius: 8, padding: 12, fontSize: 14, color: '#e8eaf0', minHeight: 100,
  },

  btnPrimary: { backgroundColor: '#f97316', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 4 },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
