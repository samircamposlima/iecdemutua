import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';

import VisitorDrawer  from './VisitorDrawer';
import MemberDrawer   from './MemberDrawer';
import AdminDrawer    from './AdminDrawer';
import AuthStack     from './AuthStack'; 


const RootStack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#C9A84C" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
    <RootStack.Screen name="Auth"      component={AuthStack}   />
    <RootStack.Screen name="VisitorApp" component={VisitorDrawer} />
  </>
) : role === 'admin' ? (
  <RootStack.Screen name="AdminApp"  component={AdminDrawer}  />
) : role === 'membro' ? (
  <RootStack.Screen name="MemberApp" component={MemberDrawer} />
) : (
  // role: "pendente" ou qualquer outro → acesso de visitante
  <RootStack.Screen name="VisitorApp" component={VisitorDrawer} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}