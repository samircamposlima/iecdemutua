import React from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function AgendaScreen() {
  const { role } = useAuth();
  const isMember = role === 'membro' || role === 'admin';

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Agenda — eventos públicos</Text>
      {isMember && <Text>+ Eventos privados (só membros)</Text>}
    </View>
  );
}