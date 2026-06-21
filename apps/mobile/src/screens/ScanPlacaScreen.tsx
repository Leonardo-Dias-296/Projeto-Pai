import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, useWindowDimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { Card, Button, ScreenView } from '../components';
import { useColors, spacing, borderRadius, typography } from '../theme';
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
  const colors = useColors();
  const { width } = useWindowDimensions();
  const cameraHeight = width * 0.75;

  const [permission, requestPermission] = useCameraPermissions();
  const [modo, setModo] = useState<'camera' | 'manual'>('camera');
  const [capturando, setCapturando] = useState(false);
  const [placaDigitada, setPlacaDigitada] = useState('');
  const [veiculo, setVeiculo] = useState<VeiculoEncontrado | null>(null);
  const [buscando, setBuscando] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  async function tirarFoto() {
    if (!cameraRef.current) return;
    setCapturando(true);
    try {
      const foto = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.7 });
      if (!foto?.base64) return;
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
          'Não foi possível ler a placa. Digite manualmente.',
          [{ text: 'Digitar', onPress: () => setModo('manual') }]
        );
      }
    } catch {
      Alert.alert('Erro', 'Falha ao processar a imagem.');
    } finally {
      setCapturando(false);
    }
  }

  async function buscarVeiculo(placa: string) {
    setBuscando(true);
    setVeiculo(null);
    try {
      const localRes = await fetch(`${API_URL}/veiculos/placa/${placa}`);
      if (localRes.ok) {
        const v = await localRes.json();
        setVeiculo({ ...v, placa });
        return;
      }
      const extRes = await fetch(`${API_URL}/placa/${placa}`);
      if (extRes.ok) {
        const dados = await extRes.json();
        setVeiculo({ placa, marca: dados.marca, modelo: dados.modelo, ano: dados.ano, cor: dados.cor });
      } else {
        setVeiculo({ placa, marca: '', modelo: '', ano: 0, cor: '' });
      }
    } catch {
      Alert.alert('Erro de conexão', 'Não foi possível buscar os dados da placa.');
    } finally {
      setBuscando(false);
    }
  }

  async function confirmarVeiculo() {
    if (!veiculo) return;
    try {
      if (!veiculo.id) {
        const createRes = await fetch(`${API_URL}/veiculos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            placa: veiculo.placa, marca: veiculo.marca,
            modelo: veiculo.modelo, ano: veiculo.ano, cor: veiculo.cor,
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

  if (!permission?.granted) {
    return (
      <ScreenView scroll={false}>
        <View style={styles.center}>
          <View style={[styles.iconWrap, { backgroundColor: colors.surfaceElevated }]}>
            <Ionicons name="camera-outline" size={36} color={colors.primary} />
          </View>
          <Text style={[styles.centerText, { color: colors.textSecondary }]}>
            Precisamos de acesso à câmera para escanear a placa.
          </Text>
          <Button title="Permitir câmera" onPress={requestPermission} />
          <TouchableOpacity onPress={() => setModo('manual')}>
            <Text style={[styles.link, { color: colors.primary }]}>Digitar placa manualmente</Text>
          </TouchableOpacity>
        </View>
      </ScreenView>
    );
  }

  return (
    <ScreenView>
      {modo === 'camera' ? (
        <View style={styles.section}>
          <View style={[styles.cameraWrap, { height: cameraHeight }]}>
            <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back">
              <View style={styles.guia}>
                <View style={styles.guiaCantoTL} /><View style={styles.guiaCantTR} />
                <Text style={styles.guiaTxt}>Centralize a placa</Text>
                <View style={styles.guiaCantoBL} /><View style={styles.guiaCantoBR} />
              </View>
            </CameraView>
          </View>
          <Button
            title="Tirar foto da placa"
            onPress={tirarFoto}
            loading={capturando}
            style={{ marginTop: spacing.md }}
          />
          <TouchableOpacity onPress={() => setModo('manual')}>
            <Text style={[styles.link, { color: colors.primary, textAlign: 'center', marginTop: spacing.sm }]}>
              Digitar manualmente
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.section}>
          <Card>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Placa do veículo</Text>
            <TextInput
              style={[styles.placaInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              value={placaDigitada}
              onChangeText={(t) => setPlacaDigitada(t.toUpperCase())}
              placeholder="ABC1D23"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
              maxLength={7}
            />
            <Button
              title="Buscar dados"
              onPress={() => buscarVeiculo(placaDigitada)}
              disabled={!placaDigitada}
              loading={buscando}
              style={{ marginTop: spacing.sm }}
            />
          </Card>
          <TouchableOpacity onPress={() => setModo('camera')}>
            <Text style={[styles.link, { color: colors.primary, textAlign: 'center', marginTop: spacing.md }]}>
              Usar câmera
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {veiculo && (
        <Card elevated style={styles.veiculoCard}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Veículo identificado</Text>

          <View style={[styles.placaBadge, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Ionicons name="car-sport" size={18} color={colors.primary} />
            <Text style={[styles.placaTxt, { color: colors.text }]}>{veiculo.placa}</Text>
          </View>

          {veiculo.modelo ? (
            <>
              <InfoRow colors={colors} label="Marca / Modelo" value={`${veiculo.marca} ${veiculo.modelo}`} />
              <InfoRow colors={colors} label="Ano" value={String(veiculo.ano)} />
              <InfoRow colors={colors} label="Cor" value={veiculo.cor} />
              {veiculo.cliente && (
                <>
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  <InfoRow colors={colors} label="Cliente" value={veiculo.cliente.nome} />
                  <InfoRow colors={colors} label="Telefone" value={veiculo.cliente.telefone} />
                </>
              )}
            </>
          ) : (
            <Text style={[styles.subText, { color: colors.textSecondary }]}>
              Veículo não cadastrado — complete os dados no check-in.
            </Text>
          )}

          <Button title="Confirmar e fazer check-in" onPress={confirmarVeiculo} style={{ marginTop: spacing.md }} />
        </Card>
      )}
    </ScreenView>
  );
}

function InfoRow({ colors, label, value }: { colors: any; label: string; value: string }) {
  return (
    <View style={[infoStyles.row, { borderBottomColor: colors.border }]}>
      <Text style={[infoStyles.label, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[infoStyles.value, { color: colors.text }]}>{value || '—'}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  label: { fontSize: 13 },
  value: { fontSize: 13, fontWeight: '600' },
});

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.xxl,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    textAlign: 'center',
    fontSize: 15,
  },
  link: {
    fontSize: 13,
    fontWeight: '600',
    padding: spacing.sm,
  },
  section: {
    gap: spacing.sm,
  },
  cameraWrap: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  guia: {
    position: 'absolute',
    top: 20, left: 20, right: 20, bottom: 20,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guiaCantoTL: { position:'absolute', top:0, left:0, width:20, height:20, borderTopWidth:2, borderLeftWidth:2, borderColor:'#f97316', borderRadius:2 },
  guiaCantTR:  { position:'absolute', top:0, right:0, width:20, height:20, borderTopWidth:2, borderRightWidth:2, borderColor:'#f97316', borderRadius:2 },
  guiaCantoBL: { position:'absolute', bottom:0, left:0, width:20, height:20, borderBottomWidth:2, borderLeftWidth:2, borderColor:'#f97316', borderRadius:2 },
  guiaCantoBR: { position:'absolute', bottom:0, right:0, width:20, height:20, borderBottomWidth:2, borderRightWidth:2, borderColor:'#f97316', borderRadius:2 },
  guiaTxt: { color:'#f97316', fontSize:12, fontWeight:'600' },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  placaInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: 14,
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Courier New',
    letterSpacing: 4,
    textAlign: 'center',
  },
  veiculoCard: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h2,
  },
  placaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  placaTxt: {
    fontFamily: 'Courier New',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 3,
  },
  subText: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginVertical: spacing.xs,
  },
});
