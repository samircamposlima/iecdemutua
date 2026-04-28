import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen   from '../screens/auth/LoginScreen';
import CadastroScreen from '../screens/auth/CadastroScreen';

/**
 * Stack Navigator para usuários não autenticados.
 * Gerencia a transição entre as telas de Login e Criação de Conta.
 */
const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        // Remove o cabeçalho padrão para permitir um design full-screen personalizado
        headerShown: false,
        // Define a animação de transição nativa (slide no iOS, fade no Android)
        animation: 'slide_from_right' 
      }}
    >
      {/* Tela inicial do fluxo de autenticação */}
      <Stack.Screen name="Login" component={LoginScreen} />
      
      {/* Tela de registro de novos membros */}
      <Stack.Screen name="Cadastro" component={CadastroScreen} />
    </Stack.Navigator>
  );
}