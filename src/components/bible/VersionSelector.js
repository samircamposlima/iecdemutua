import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useAppTheme } from '../../themes';
import { BIBLE_VERSIONS } from '../../utils/constants/Bibles';

/**
 * VersionSelector: Componente de interface para troca de versões da Bíblia.
 * Renderiza uma lista de opções baseada nas constantes do sistema.
 */
export default function VersionSelector({ currentVersion, onSelect }) {
  const theme = useAppTheme(); // Hook de tema para suporte a Dark/Light mode

  return (
    <FlatList
      data={BIBLE_VERSIONS}
      keyExtractor={item => item.id}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => {
        // Verifica se esta versão é a que está atualmente ativa no estado global/hook
        const active = item.id === currentVersion?.id;
        return (
          <TouchableOpacity
            style={[
              styles.item,
              {
                backgroundColor: active ? theme.primary : theme.surface,
                borderColor: active ? theme.primary : theme.border,
              },
            ]}
            onPress={() => onSelect(item)}
          >
            <Text style={[
              styles.label,
              { color: active ? theme.textOnGold : theme.text }
            ]}>
              {item.label}
            </Text>
            <Text style={[styles.id, { color: active ? theme.textOnGold : theme.textSecondary }]}>
              {item.id}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: { fontSize: 15, fontWeight: '500' },
  id:    { fontSize: 13, fontWeight: '700' },
});