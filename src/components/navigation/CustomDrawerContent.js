import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useAuth } from '../../contexts/AuthContext';
import { themes } from '../../themes';

const t = themes.dark;

/**
 * CustomDrawerContent
 * 
 * Props:
 *  - showLogout: boolean — exibe o botão "Sair da conta" (default: false)
 *  - headerComponent: ReactNode — conteúdo opcional no topo da gaveta (ex: avatar do usuário)
 */
export default function CustomDrawerContent({ showLogout = false, headerComponent, ...props }) {
  const { signOut } = useAuth();

  return (
    <SafeAreaView style={styles.container}>

      {/* Área opcional no topo — ex: nome e foto do usuário */}
      {headerComponent && (
        <View style={styles.header}>
          {headerComponent}
        </View>
      )}

      {/* Lista de itens do drawer */}
      <View style={{ flex: 1 }}>
        <DrawerContentScrollView {...props} contentContainerStyle={{ flexGrow: 1 }}>
          <DrawerItemList {...props} />
        </DrawerContentScrollView>
      </View>

      {/* Botão de logout — só aparece se showLogout=true */}
      {showLogout && (
        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Text style={styles.logoutText}>⬅ Sair da conta</Text>
        </TouchableOpacity>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: t.drawerBackground,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  logoutButton: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  logoutText: {
    color: '#E74C3C',
    fontSize: 15,
    fontWeight: '600',
  },
});