/**
 * AutoControl Mobile — App.tsx
 *
 * Stack de navegação principal.
 * Instale as dependências com:
 *   npx expo install @react-navigation/native @react-navigation/native-stack
 *   npx expo install react-native-screens react-native-safe-area-context
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import { PistasScreen } from './src/screens/PistasScreen';
import { ScanPlacaScreen } from './src/screens/ScanPlacaScreen';
import { CheckInScreen } from './src/screens/CheckInScreen';
import { DefeitosScreen } from './src/screens/DefeitosScreen';
import { AcompanhamentoScreen } from './src/screens/AcompanhamentoScreen';
import { FinalizarScreen } from './src/screens/FinalizarScreen';

export type RootStackParamList = {
  Pistas: undefined;
  ScanPlaca: undefined;
  CheckIn: { veiculoId: string; placa: string; osExistenteId?: string };
  Defeitos: { osId: string; placa: string };
  Acompanhamento: { osId: string };
  Finalizar: { osId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const THEME = {
  colors: {
    primary: '#f97316',
    background: '#0f1117',
    card: '#181c27',
    text: '#e8eaf0',
    border: '#252a38',
    notification: '#f97316',
  },
};

export default function App() {
  return (
    <NavigationContainer theme={THEME as any}>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#181c27' },
          headerTintColor: '#e8eaf0',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#0f1117' },
        }}
      >
        <Stack.Screen
          name="Pistas"
          component={PistasScreen}
          options={{ title: 'AutoControl', headerLargeTitle: true }}
        />
        <Stack.Screen
          name="ScanPlaca"
          component={ScanPlacaScreen}
          options={{ title: 'Escanear placa', presentation: 'modal' }}
        />
        <Stack.Screen
          name="CheckIn"
          component={CheckInScreen}
          options={({ route }) => ({ title: `Check-in · ${route.params.placa}` })}
        />
        <Stack.Screen
          name="Defeitos"
          component={DefeitosScreen}
          options={{ title: 'Defeitos relatados' }}
        />
        <Stack.Screen
          name="Acompanhamento"
          component={AcompanhamentoScreen}
          options={{ title: 'Acompanhar OS' }}
        />
        <Stack.Screen
          name="Finalizar"
          component={FinalizarScreen}
          options={{ title: 'Finalizar serviço' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
