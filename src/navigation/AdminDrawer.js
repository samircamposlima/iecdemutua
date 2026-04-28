import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { themes } from '../themes';
import CustomDrawerContent from '../components/navigation/CustomDrawerContent';

// Importação das telas organizadas por contexto (Shared, Member, Admin)
import AgendaScreen           from '../screens/shared/AgendaScreen';
import OracaoScreen           from '../screens/shared/OracaoScreen';
import DoacaoScreen           from '../screens/shared/DoacaoScreen';
import QuemSomosScreen        from '../screens/shared/QuemSomosScreen';
import CultosLarScreen        from '../screens/member/CultosLarScreen';
import GerenciarMembrosScreen from '../screens/admin/GerenciarMembrosScreen';
import HomeScreen             from '../screens/shared/HomeScreen';
import BibliaScreen           from '../screens/shared/BibliaScreen';

const Drawer = createDrawerNavigator();

// Definição de tema constante para evitar processamento desnecessário durante render
const t = themes.dark;

/**
 * Navegador do tipo Drawer para usuários com perfil de Administrador.
 * Inclui telas exclusivas como 'Gerenciar Membros'.
 */
export default function AdminDrawer() {
  return (
    <Drawer.Navigator
      // Personalização do menu lateral (Injeção do componente de Logout)
      drawerContent={(props) => <CustomDrawerContent {...props} showLogout={true} />}
      screenOptions={{
        // Padronização visual do Header
        headerStyle:                 { backgroundColor: t.headerBackground },
        headerTintColor:             t.headerText,
        
        // Estilização do Menu Lateral
        drawerStyle:                 { backgroundColor: t.drawerBackground },
        drawerLabelStyle:            { color: t.drawerText },
        drawerActiveTintColor:       t.drawerActive,
        drawerActiveBackgroundColor: '#2A2A2A', // Destaque visual da rota atual
      }}
    >
      {/* Rotas Compartilhadas (Shared) */}
      <Drawer.Screen name="Início"            component={HomeScreen}   />
      <Drawer.Screen name="Bíblia"            component={BibliaScreen}  />
      <Drawer.Screen name="Agenda"            component={AgendaScreen}   />
      <Drawer.Screen name="Pedido de Oração"  component={OracaoScreen}   />
      <Drawer.Screen name="Doação / Pix"      component={DoacaoScreen}   />
      <Drawer.Screen name="Quem Somos"        component={QuemSomosScreen} />
      
      {/* Rotas de Membros (Visualização Admin) */}
      <Drawer.Screen name="Cultos no Lar"     component={CultosLarScreen} />
      
      {/* Rota Privativa: Gerenciamento Administrativo */}
      <Drawer.Screen 
        name="Gerenciar Membros" 
        component={GerenciarMembrosScreen} 
        options={{
          drawerLabel: 'Gerenciar Membros', // Rótulo amigável para o menu
        }}
      />
    </Drawer.Navigator>
  );
}