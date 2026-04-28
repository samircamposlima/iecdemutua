import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../themes';

/**
 * GerenciarMembrosScreen: Tela exclusiva do perfil Administrador.
 * * Funcionalidade futura (Roadmap): 
 * Centralizará o gerenciamento de permissões (RBAC), aprovação de novos membros 
 * e edição de dados da congregação.
 */
export default function GerenciarMembrosScreen() {
  const theme = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.card}>
        <Text style={[styles.title, { color: theme.primary }]}>
          Painel de Gestão
        </Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          Módulo exclusivo para administradores. Aqui será realizada a gestão 
          de membros, controle de cargos (Role-Based Access Control) e 
          moderação de pedidos de oração.
        </Text>
        
        {/* Placeholder visual para indicar desenvolvimento ativo */}
        <View style={[styles.badge, { backgroundColor: theme.surface }]}>
          <Text style={{ color: theme.text, fontWeight: 'bold' }}>
            EM DESENVOLVIMENTO
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C9A84C',
  },
});