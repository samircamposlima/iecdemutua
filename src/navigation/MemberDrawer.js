import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { themes } from '../themes';
import CustomDrawerContent from '../components/navigation/CustomDrawerContent';

// Importação das telas acessíveis ao nível de Membro
import AgendaScreen    from '../screens/shared/AgendaScreen';
import OracaoScreen    from '../screens/shared/OracaoScreen';
import DoacaoScreen    from '../screens/shared/DoacaoScreen';
import QuemSomosScreen from '../screens/shared/QuemSomosScreen';
import CultosLarScreen from '../screens/member/CultosLarScreen';
import HomeScreen      from '../screens/shared/HomeScreen';
import BibliaScreen    from '../screens/shared/BibliaScreen';

const Drawer = createDrawerNavigator();
const t = themes.dark; // Padronização com o tema escuro do app

/**
 * MemberDrawer: Define a estrutura de navegação lateral para usuários logados.
 * Diferente do AdminDrawer, este navegador omite funções de gestão.
 */
export default function MemberDrawer() {
  return (
    <Drawer.Navigator
      // Injeta o componente customizado para o menu lateral com botão de logout
      drawerContent={(props) => <CustomDrawerContent {...props} showLogout={true} />}
      screenOptions={{
        // Configurações visuais do cabeçalho e menu extraídas do tema central
        headerStyle:                 { backgroundColor: t.headerBackground },
        headerTintColor:             t.headerText,
        drawerStyle:                 { backgroundColor: t.drawerBackground },
        drawerLabelStyle:            { color: t.drawerText },
        drawerActiveTintColor:       t.drawerActive,
        drawerActiveBackgroundColor: '#2A2A2A', // Feedback visual da seleção
      }}
    >
      {/* Telas Compartilhadas (Públicas + Membros) */}
      <Drawer.Screen name="Início"            component={HomeScreen}      />
      <Drawer.Screen name="Bíblia"            component={BibliaScreen}    />
      <Drawer.Screen name="Agenda"            component={AgendaScreen}    />
      <Drawer.Screen name="Pedido de Oração"  component={OracaoScreen}    />
      <Drawer.Screen name="Doação / Pix"      component={DoacaoScreen}    />
      <Drawer.Screen name="Quem Somos"        component={QuemSomosScreen} />
      
      {/* Tela Exclusiva: Permite ao membro interagir com os cultos no lar */}
      <Drawer.Screen name="Cultos no Lar"     component={CultosLarScreen} />
    </Drawer.Navigator>
  );
}