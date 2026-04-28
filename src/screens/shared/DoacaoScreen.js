import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAppTheme } from '../../themes';
import Clipboard from '@react-native-clipboard/clipboard';
import { CHURCH_DATA } from '../../utils/constants/QuemSomos';

export default function DoacaoScreen() {
  const theme = useAppTheme();
  
  const copyToClipboard = () => {
    // Execução matemática: Copia a constante e alerta o usuário
    Clipboard.setString(CHURCH_DATA.pixKey); 
    Alert.alert("Copiado", "A chave PIX foi copiada para sua área de transferência.");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
        <Text style={[styles.emoji, { color: theme.primary }]}>🙏</Text>
        
        <Text style={[styles.title, { color: theme.text }]}>Contribua com a Obra</Text>
        
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          Sua generosidade ajuda a manter nossos projetos sociais e a estrutura da nossa igreja local.
        </Text>

        <View style={[styles.pixContainer, { backgroundColor: theme.surfaceVariant }]}>
          <Text style={[styles.pixLabel, { color: theme.primary }]}>CHAVE PIX (E-MAIL)</Text>
          <Text style={[styles.pixValue, { color: theme.text }]}>{CHURCH_DATA.pixKey}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={copyToClipboard}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: theme.textOnGold }]}>COPIAR CHAVE PIX</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.footerText, { color: theme.textDisabled }]}>
        Igreja Evangélica Congregacional de Mutuá{"\n"}
        {CHURCH_DATA.cnpj}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    justifyContent: 'center' 
  },
  card: { 
    padding: 30, 
    borderRadius: 20, 
    borderWidth: 1, 
    alignItems: 'center', 
    elevation: 4,
    // Sombra para iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emoji: { 
    fontSize: 50, 
    marginBottom: 15 
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  description: { 
    textAlign: 'center', 
    fontSize: 14, 
    lineHeight: 20, 
    marginBottom: 25 
  },
  pixContainer: { 
    width: '100%', 
    padding: 15, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginBottom: 20 
  },
  pixLabel: { 
    fontSize: 11, 
    fontWeight: 'bold', 
    letterSpacing: 1.2, 
    marginBottom: 5 
  },
  pixValue: { 
    fontSize: 15, 
    fontWeight: '700' 
  },
  button: { 
    width: '100%', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  buttonText: { 
    fontWeight: 'bold', 
    fontSize: 15,
    letterSpacing: 0.5 
  },
  footerText: { 
    textAlign: 'center', 
    marginTop: 30, 
    fontSize: 12,
    lineHeight: 18
  }
});