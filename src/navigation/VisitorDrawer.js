import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { themes } from '../themes';
import CustomDrawerContent from '../components/navigation/CustomDrawerContent';

import AgendaScreen    from '../screens/shared/AgendaScreen';
import OracaoScreen    from '../screens/shared/OracaoScreen';
import DoacaoScreen    from '../screens/shared/DoacaoScreen';
import QuemSomosScreen from '../screens/shared/QuemSomosScreen';
import HomeScreen      from '../screens/shared/HomeScreen';
import BibliaScreen     from '../screens/shared/BibliaScreen';

const Drawer = createDrawerNavigator();
const t = themes.dark;

function BotaoEntrar() {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      style={styles.botaoEntrar}
      onPress={() => navigation.navigate('Login')}
    >
      <Text style={styles.botaoEntrarTexto}>Entrar</Text>
    </TouchableOpacity>
  );
}

export default function VisitorDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} showLogout={false} />}
      screenOptions={{
        headerRight: () => <BotaoEntrar />,
        headerStyle:                 { backgroundColor: t.headerBackground },
        headerTintColor:             t.headerText,
        drawerStyle:                 { backgroundColor: t.drawerBackground },
        drawerLabelStyle:            { color: t.drawerText },
        drawerActiveTintColor:       t.drawerActive,
        drawerActiveBackgroundColor: '#2A2A2A',
      }}
    >
      <Drawer.Screen name="Início"           component={HomeScreen}      />
      <Drawer.Screen name="Bíblia"           component={BibliaScreen}    />
      <Drawer.Screen name="Agenda"           component={AgendaScreen}    />
      <Drawer.Screen name="Pedido de Oração" component={OracaoScreen}    />
      <Drawer.Screen name="Doação / Pix"     component={DoacaoScreen}    />
      <Drawer.Screen name="Quem Somos"       component={QuemSomosScreen} />
      
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  botaoEntrar: {
    marginRight: 16,
    backgroundColor: '#C9A84C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  botaoEntrarTexto: {
    color: '#1A1A1A',
    fontWeight: '600',
    fontSize: 13,
  },
});