import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';

// Importação dos fluxos de navegação segmentados
import VisitorDrawer  from './VisitorDrawer';
import MemberDrawer   from './MemberDrawer';
import AdminDrawer    from './AdminDrawer';
import AuthStack      from './AuthStack'; 
import ReadingScreen from '../screens/ReadingScreen';

const RootStack = createNativeStackNavigator();

/**
 * RootNavigator: O componente de nível mais alto que define qual fluxo de navegação
 * será montado com base no estado de autenticação e cargo (role) do usuário.
 */
export default function RootNavigator() {
  const { user, role, loading } = useAuth();

  // Tela de transição (Splash Screen funcional) enquanto verifica autenticação no Firebase
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#C9A84C" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        
        {/* Lógica de Navegação Condicional: 
            Garante que o usuário nunca acesse rotas proibidas via hardware back button 
        */}
        {!user ? (
          <>
            {/* Usuário não logado: Acesso às telas de Auth e conteúdo público */}
            <RootStack.Screen name="Auth" component={AuthStack} />
            <RootStack.Screen name="VisitorApp" component={VisitorDrawer} />
          </>
        ) : role === 'admin' ? (
          // Fluxo completo para Administradores
          <RootStack.Screen name="AdminApp" component={AdminDrawer} />
        ) : role === 'membro' ? (
          // Fluxo restrito para Membros
          <RootStack.Screen name="MemberApp" component={MemberDrawer} />
        ) : (
          // Fallback para usuários logados mas sem cargo definido (ex: novos cadastros)
          <RootStack.Screen name="VisitorApp" component={VisitorDrawer} />
        )}

        {/* Rota Global: ReadingScreen
            A tela de leitura da Bíblia é mantida no RootStack para permitir 
            navegação fluida (push/pop) sem as restrições de menu lateral (Drawer).
        */}
        <RootStack.Screen 
          name="ReadingScreen" 
          component={ReadingScreen} 
          options={{ 
            animation: 'slide_from_bottom', // Animação estilo modal para leitura
          }}
        />

      </RootStack.Navigator>
    </NavigationContainer>
  );
}