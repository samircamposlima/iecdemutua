import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { themes } from '../themes';
import CustomDrawerContent from '../components/navigation/CustomDrawerContent';

import AgendaScreen           from '../screens/shared/AgendaScreen';
import OracaoScreen           from '../screens/shared/OracaoScreen';
import DoacaoScreen           from '../screens/shared/DoacaoScreen';
import QuemSomosScreen        from '../screens/shared/QuemSomosScreen';
import CultosLarScreen        from '../screens/member/CultosLarScreen';
import GerenciarMembrosScreen from '../screens/admin/GerenciarMembrosScreen';
import HomeScreen             from '../screens/shared/HomeScreen';
import BibliaScreen           from '../screens/shared/BibliaScreen';


const Drawer = createDrawerNavigator();
const t = themes.dark;

export default function AdminDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} showLogout={true} />}
      screenOptions={{
        headerStyle:                 { backgroundColor: t.headerBackground },
        headerTintColor:             t.headerText,
        drawerStyle:                 { backgroundColor: t.drawerBackground },
        drawerLabelStyle:            { color: t.drawerText },
        drawerActiveTintColor:       t.drawerActive,
        drawerActiveBackgroundColor: '#2A2A2A',
      }}
    >
      <Drawer.Screen name="Início"            component={HomeScreen}             />
      <Drawer.Screen name="Bíblia"           component={BibliaScreen}            />
      <Drawer.Screen name="Agenda"            component={AgendaScreen}           />
      <Drawer.Screen name="Pedido de Oração"  component={OracaoScreen}           />
      <Drawer.Screen name="Doação / Pix"      component={DoacaoScreen}           />
      <Drawer.Screen name="Quem Somos"        component={QuemSomosScreen}        />
      <Drawer.Screen name="Cultos no Lar"     component={CultosLarScreen}        />
      <Drawer.Screen name="Gerenciar Membros" component={GerenciarMembrosScreen} />
    </Drawer.Navigator>
  );
}