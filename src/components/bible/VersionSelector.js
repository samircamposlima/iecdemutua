import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

// Lista dos seus 13 arquivos — ajusta os nomes conforme os teus .sqlite
export const BIBLE_VERSIONS = [
  { id: 'ACF.sqlite',  label: 'ACF — Almeida Corrigida Fiel' },
  { id: 'ARA.sqlite',  label: 'ARA — Almeida Revista e Atualizada' },
  { id: 'ARC.sqlite',  label: 'ARC — Almeida Revista e Corrigida' },
  { id: 'AS21.sqlite', label: 'AS21 — Almeida Século 21' },
  { id: 'KJA.sqlite',  label: 'KJA — King James Atualizada' },
  { id: 'KJF.sqlite',  label: 'KJF — King James Fiel 2000' },
  { id: 'NAA.sqlite',  label: 'NAA — Nova Almeida Atualizada' },
  { id: 'NBV.sqlite',  label: 'NBV — Nova Bíblia Viva' },
  { id: 'NVI.sqlite',  label: 'NVI — Nova Versão Internacional' },
  { id: 'NVT.sqlite',  label: 'NVT — Nova Versão Transformadora' },
  { id: 'TB.sqlite',   label: 'TB — Tradução Brasileira' },
];

export default function VersionSelector({ selectedVersion, onSelect, theme }) {
  return (
    <FlatList
      data={BIBLE_VERSIONS}
      keyExtractor={item => item.id}
      renderItem={({ item }) => {
        const isSelected = item.id === selectedVersion;
        return (
          <TouchableOpacity
            style={[
              styles.item,
              { borderBottomColor: theme.border },
              isSelected && { backgroundColor: theme.primary + '22' },
            ]}
            onPress={() => onSelect(item.id)}
          >
            <Text style={[
              styles.label,
              { color: isSelected ? theme.primary : theme.text },
            ]}>
              {item.label}
            </Text>
            {isSelected && (
              <Text style={{ color: theme.primary, fontSize: 18 }}>✓</Text>
            )}
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  label: { fontSize: 15 },
});