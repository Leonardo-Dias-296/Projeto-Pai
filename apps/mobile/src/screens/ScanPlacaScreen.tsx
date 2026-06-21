/**
 * ScanPlacaScreen — câmera para captura da placa + fallback de digitação manual.
 *
 * Dependências:
 *   npx expo install expo-camera expo-image-picker
 */

import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { API_URL } from '../config';

type Props = NativeStackScreenProps<RootStackParamList, 'ScanPlaca'>;

type VeiculoEncontrado = {
  id?: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  cor: string;
  clienteId?: string;
  cliente?: { nome: string; telefone: string };
};

export function ScanPlacaScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [modo, setModo] = useState<'camera' | 'manual'>('camera');
  const [capturando, setCapturando] = useState(false);
  const [placaDigitada, setPlacaDigitada] = useState('');
  const [veiculo, setVeiculo] = useState<VeiculoEncontrado | null>(null);
  const [buscando, setBuscando] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  // ─── Captura de foto ───────────────────────────────────────────────────────
  async function tirarFoto() {
    if (!cameraRef.current) return;
    setCapturando(true);
    try {
      const foto = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.7 });
      if (!foto?.base64) return;

      // Envia para o backend fazer OCR
      const res = await fetch(`${API_URL}/placa/ocr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: foto.base64 }),
      });

      const json = await res.json();

      if (json.placa) {
        await buscarVeiculo(json.placa);
      } else {
        Alert.alert(
          'Placa não reconhecida',
          'Não foi possível ler a placa automaticamente. Digite-a manualmente.',
          [{ text: 'Digitar', onPress: () => setModo('manual') }]
        );
      }
    } catch {
      Alert.alert('Erro', 'Falha ao processar a imagem. Tente novamente.');
    } finally {
      setCapturando(false);
    }
  }

  // ─── Busca de dados na API ─────────────────────────────────────────────────
  async function buscarVeiculo(placa: string) {
    setBuscando(true);
    setVeiculo(null);
    try {
      // 1. Verifica se já existe no banco local
      const localRes = await fetch(`${API_URL}/veiculos/placa/${placa}`);

      if (localRes.ok) {
        const v = await localRes.json();
        setVeiculo({ ...v, placa });
        return;
      }

      // 2. Consulta API veicular externa
      const extRes = await fetch(`${API_URL}/placa/${placa}`);

      if (extRes.ok) {
        const dados = await extRes.json();
        setVeiculo({
          placa,
          marca: dados.marca,
          modelo: dados.modelo,
          ano: dados.ano,
          cor: dados.cor,
        });
      } else {
        // Veículo não encontrado mas placa válida — prossegue com cadastro manual
        setVeiculo({ placa, marca: '', modelo: '', ano: 0, cor: '' });
      }
    } catch {
      Alert.alert('Erro de conexão', 'Não foi possível buscar os dados da placa.');
    } finally {
      setBuscando(false);
    }
  }

  // ─── Confirma e navega para check-in ──────────────────────────────────────
  async function confirmarVeiculo() {
    if (!veiculo) return;

    try {
      // Se é veículo novo, cria no banco antes de prosseguir
      if (!veiculo.id) {
        const createRes = await fetch(`${API_URL}/veiculos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            placa: veiculo.placa,
            marca: veiculo.marca,
            modelo: veiculo.modelo,
            ano: veiculo.ano,
            cor: veiculo.cor,
          }),
        });
        const criado = await createRes.json();
        navigation.replace('CheckIn', { veiculoId: criado.id, placa: veiculo.placa });
      } else {
        navigation.replace('CheckIn', { veiculoId: veiculo.id, placa: veiculo.placa });
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o veículo.');
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  if (!permission?.granted) {
    return (
      <View style={s.centrado}>
        <Text style={s.texto}>Precisamos de acesso à câmera para ler a placa.</Text>
        <TouchableOpacity style={s.btn} onPress={requestPermission}>
          <Text style={s.btnTxt}>Permitir câmera</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setModo('manual')}>
          <Text style={s.link}>Digitar placa manualmente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={{ gap: 16, padding: 16 }}>

      {/* ── Câmera ou input manual ─────────────────────────────────────────── */}
      {modo === 'camera' ? (
        <View style={s.cameraWrap}>
          <CameraView ref={cameraRef} style={s.camera} facing="back">
            {/* Guia de enquadramento */}
            <View style={s.guia}>
              <View style={s.guiaCantoTL} /><View style={s.guiaCantTR} />
              <Text style={s.guiaTxt}>Centralize a placa</Text>
              <View style={s.guiaCantoBL} /><View style={s.guiaCantoBR} />
            </View>
          </CameraView>

          <TouchableOpacity
            style={[s.btn, capturando && { opacity: 0.6 }]}
            onPress={tirarFoto}
            disabled={capturando}
          >
            {capturando
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnTxt}>📸 Tirar foto da placa</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setModo('manual')}>
            <Text style={s.link}>Digitar manualmente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={s.manualWrap}>
          <Text style={s.label}>Placa do veículo</Text>
          <TextInput
            style={s.placaInput}
            value={placaDigitada}
            onChangeText={(t) => setPlacaDigitada(t.toUpperCase())}
            placeholder="Ex: ABC1D23"
            placeholderTextColor="#8b91a8"
            autoCapitalize="characters"
            maxLength={7}
          />
          <TouchableOpacity
            style={[s.btn, (!placaDigitada || buscando) && { opacity: 0.5 }]}
            onPress={() => buscarVeiculo(placaDigitada)}
            disabled={!placaDigitada || buscando}
          >
            {buscando
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnTxt}>🔍 Buscar dados</Text>
            }
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setModo('camera')}>
            <Text style={s.link}>Usar câmera</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Resultado da busca ─────────────────────────────────────────────── */}
      {veiculo && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Veículo identificado</Text>

          <View style={s.placaBadge}>
            <Text style={s.placaTxt}>{veiculo.placa}</Text>
          </View>

          {veiculo.modelo ? (
            <>
              <InfoRow label="Marca / Modelo" value={`${veiculo.marca} ${veiculo.modelo}`} />
              <InfoRow label="Ano" value={String(veiculo.ano)} />
              <InfoRow label="Cor" value={veiculo.cor} />
              {veiculo.cliente && (
                <>
                  <View style={s.divider} />
                  <Text style={s.cardSubtitle}>Cliente cadastrado</Text>
                  <InfoRow label="Nome" value={veiculo.cliente.nome} />
                  <InfoRow label="Telefone" value={veiculo.cliente.telefone} />
                </>
              )}
            </>
          ) : (
            <Text style={s.subText}>Veículo não cadastrado — complete os dados no check-in.</Text>
          )}

          <TouchableOpacity style={[s.btn, { marginTop: 12 }]} onPress={confirmarVeiculo}>
            <Text style={s.btnTxt}>Confirmar e fazer check-in →</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value || '—'}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  texto: { color: '#e8eaf0', textAlign: 'center', fontSize: 15 },

  cameraWrap: { gap: 12 },
  camera: { height: 200, borderRadius: 12, overflow: 'hidden' },

  guia: {
    position: 'absolute', inset: 20,
    borderRadius: 6, alignItems: 'center', justifyContent: 'center',
  },
  guiaCantoTL: { position:'absolute', top:0, left:0, width:20, height:20, borderTopWidth:2, borderLeftWidth:2, borderColor:'#f97316', borderRadius:2 },
  guiaCantTR:  { position:'absolute', top:0, right:0, width:20, height:20, borderTopWidth:2, borderRightWidth:2, borderColor:'#f97316', borderRadius:2 },
  guiaCantoBL: { position:'absolute', bottom:0, left:0, width:20, height:20, borderBottomWidth:2, borderLeftWidth:2, borderColor:'#f97316', borderRadius:2 },
  guiaCantoBR: { position:'absolute', bottom:0, right:0, width:20, height:20, borderBottomWidth:2, borderRightWidth:2, borderColor:'#f97316', borderRadius:2 },
  guiaTxt: { color:'#f97316', fontSize:12, fontWeight:'600' },

  manualWrap: { gap: 10 },
  label: { fontSize: 13, color: '#8b91a8', fontWeight: '600' },
  placaInput: {
    backgroundColor: '#181c27', borderWidth: 1, borderColor: '#252a38',
    borderRadius: 10, padding: 14, fontSize: 22, fontFamily: 'Courier New',
    fontWeight: '700', color: '#e8eaf0', letterSpacing: 4, textAlign: 'center',
  },

  btn: { backgroundColor: '#f97316', borderRadius: 10, padding: 14, alignItems: 'center' },
  btnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  link: { color: '#f97316', textAlign: 'center', fontSize: 13, padding: 8 },

  card: {
    backgroundColor: '#181c27', borderRadius: 12,
    borderWidth: 1, borderColor: '#252a38', padding: 16, gap: 8,
  },
  cardTitle: { fontSize: 13, color: '#8b91a8', fontWeight: '600', marginBottom: 4 },
  cardSubtitle: { fontSize: 12, color: '#8b91a8', fontWeight: '600' },

  placaBadge: {
    backgroundColor: '#0f1117', borderWidth: 1, borderColor: '#3a4055',
    borderRadius: 8, padding: 10, alignItems: 'center', marginBottom: 8,
  },
  placaTxt: { fontFamily: 'Courier New', fontSize: 22, fontWeight: '800', color: '#e8eaf0', letterSpacing: 3 },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderColor: '#252a38' },
  infoLabel: { color: '#8b91a8', fontSize: 13 },
  infoValue: { color: '#e8eaf0', fontSize: 13, fontWeight: '600' },

  subText: { color: '#8b91a8', fontSize: 13 },
  divider: { height: 1, backgroundColor: '#252a38', marginVertical: 4 },
});
