import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';

import { PistasScreen } from './src/screens/PistasScreen';
import { ScanPlacaScreen } from './src/screens/ScanPlacaScreen';
import { CheckInScreen } from './src/screens/CheckInScreen';
import { DefeitosScreen } from './src/screens/DefeitosScreen';
import { AcompanhamentoScreen } from './src/screens/AcompanhamentoScreen';
import { FinalizarScreen } from './src/screens/FinalizarScreen';
import { useColors, spacing, typography } from './src/theme';

export type RootStackParamList = {
  Pistas: undefined;
  ScanPlaca: undefined;
  CheckIn: { veiculoId: string; placa: string; osExistenteId?: string };
  Defeitos: { osId: string; placa: string };
  Acompanhamento: { osId: string };
  Finalizar: { osId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function PistasStack() {
  const colors = useColors();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
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
  );
}

function SettingsPlaceholder() {
  const colors = useColors();
  return (
    <View style={[styles.placeholder, { backgroundColor: colors.background }]}>
      <Ionicons name="settings-outline" size={48} color={colors.textMuted} />
      <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
        Configurações
      </Text>
    </View>
  );
}

function NavIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  return <Ionicons name={focused ? name : `${name}-outline` as any} size={24} color={color} />;
}

export default function App() {
  const colors = useColors();

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          notification: colors.primary,
        },
      }}
    >
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            paddingBottom: 4,
            height: 56,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}
      >
        <Tab.Screen
          name="PistasTab"
          component={PistasStack}
          options={{
            tabBarLabel: 'Pistas',
            tabBarIcon: ({ color, focused }) => (
              <NavIcon name="car-sport" focused={focused} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Configuracoes"
          component={SettingsPlaceholder}
          options={{
            tabBarLabel: 'Config',
            tabBarIcon: ({ color, focused }) => (
              <NavIcon name="settings" focused={focused} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  placeholderText: {
    ...typography.title,
  },
});
