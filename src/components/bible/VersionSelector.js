import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useAppTheme } from '../../themes';
import { BIBLE_VERSIONS } from '../../constants/Bibles';


export default function VersionSelector({ currentVersion, onSelect }) {
  const theme = useAppTheme();

  return (
    <FlatList
      data={BIBLE_VERSIONS}
      keyExtractor={item => item.id}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => {
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