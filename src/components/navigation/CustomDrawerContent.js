import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useAuth } from '../../contexts/AuthContext';
import { themes } from '../../themes';

const t = themes.dark;

export default function CustomDrawerContent({ showLogout = false, ...props }) {
  const { user, role, signOut } = useAuth();

  // Mostra logout se: showLogout=true (membro/admin) OU usuário pendente logado
  const isPendente   = user && role === 'pendente';
  const shouldLogout = showLogout || isPendente;

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        <DrawerContentScrollView {...props} contentContainerStyle={{ flexGrow: 1 }}>
          <DrawerItemList {...props} />
        </DrawerContentScrollView>
      </View>

      {shouldLogout && (
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