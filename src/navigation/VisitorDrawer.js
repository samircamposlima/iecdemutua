import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { themes } from '../themes';
import CustomDrawerContent from '../components/navigation/CustomDrawerContent';
import { useAuth } from '../contexts/AuthContext';

// Importação das telas acessíveis ao público (Shared)
import AgendaScreen    from '../screens/shared/AgendaScreen';
import OracaoScreen    from '../screens/shared/OracaoScreen';
import DoacaoScreen    from '../screens/shared/DoacaoScreen';
import QuemSomosScreen from '../screens/shared/QuemSomosScreen';
import HomeScreen      from '../screens/shared/HomeScreen';
import BibliaScreen    from '../screens/shared/BibliaScreen';

const Drawer = createDrawerNavigator();
const t = themes.dark;

/**
 * Componente de Ação Rápida: Botão de Login posicionado no Header.
 * Facilita a conversão de visitantes para o fluxo de autenticação.
 */
function BotaoEntrar() {
  const navigation = useNavigation();
  const { user, role } = useAuth();
  
  // Se o usuário está logado mas aguarda liberação (pendente), 
  // não exibimos o botão de entrar para evitar redundância.
  if (user && role === 'pendente') return null;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.botaoEntrar}
      onPress={() => navigation.navigate('Auth')}
    >
      <Text style={styles.botaoEntrarTexto}>Entrar</Text>
    </TouchableOpacity>
  );
}

/**
 * VisitorDrawer: Estrutura de navegação para usuários não autenticados.
 * Foca em conteúdo informativo e acesso básico à Bíblia.
 */
export default function VisitorDrawer() {
  return (
    <Drawer.Navigator
      // Renderiza o menu lateral sem a opção de Logout (pois o usuário não está logado)
      drawerContent={(props) => <CustomDrawerContent {...props} showLogout={false} />}
      screenOptions={{
        // Injeção do botão de login à direita do Header em todas as telas
        headerRight: () => <BotaoEntrar />,
        headerStyle:                 { backgroundColor: t.headerBackground },
        headerTintColor:             t.headerText,
        drawerStyle:                 { backgroundColor: t.drawerBackground },
        drawerLabelStyle:            { color: t.drawerText },
        drawerActiveTintColor:       t.drawerActive,
        drawerActiveBackgroundColor: '#2A2A2A',
      }}
    >
      <Drawer.Screen name="Início"            component={HomeScreen}      />
      <Drawer.Screen name="Bíblia"            component={BibliaScreen}    />
      <Drawer.Screen name="Agenda"            component={AgendaScreen}    />
      <Drawer.Screen name="Pedido de Oração"  component={OracaoScreen}    />
      <Drawer.Screen name="Doação / Pix"      component={DoacaoScreen}    />
      <Drawer.Screen name="Quem Somos"        component={QuemSomosScreen} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  botaoEntrar: {
    marginRight: 16,
    backgroundColor: '#C9A84C', // Cor de destaque (Gold) do tema
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    // Sombra discreta para destacar o botão no header
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  botaoEntrarTexto: {
    color: '#1A1A1A',
    fontWeight: '600',
    fontSize: 13,
  },
});