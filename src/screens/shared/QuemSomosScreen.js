import React from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function QuemSomosScreen() {
  const { role } = useAuth();
  const isMember = role === 'membro' || role === 'admin';

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Quem Somos</Text>
      {isMember && <Text>+ Contatos dos pastores</Text>}
    </View>
  );
}