import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  StyleSheet, ScrollView, Alert, ActivityIndicator, Switch 
} from 'react-native';
import { getFirestore} from '../../services/firebase'; // Usando seu serviço modular
import { collection, addDoc, serverTimestamp } from '@react-native-firebase/firestore';
import { PRAYER_CATEGORIES, PRAYER_STATUS } from '../../utils/constants/PedidosDeOracao';
import { useAuth } from '../../contexts/AuthContext';
import { useAppTheme } from '../../themes';

export default function OracaoScreen({ navigation }) {
  const theme = useAppTheme();
  const { user } = useAuth();
  
  const [pedido, setPedido] = useState('');
  const [categoria, setCategoria] = useState(null);
  const [isPrivado, setIsPrivado] = useState(false);
  const [loading, setLoading] = useState(false);
  const firstName = user?.displayName?.split(' ')[0] ?? 'Visitante';
  const [nomePersonalizado, setNomePersonalizado] = useState('');

const handleEnviar = async () => {

  if (!categoria) {
    Alert.alert("Atenção", "Por favor, selecione uma categoria para o seu pedido.");
    return;
  }
  
  if (pedido.trim().length < 10) {
    Alert.alert("Atenção", "O pedido precisa de mais detalhes.");
    return;
  }
  const nomeFinal = nomePersonalizado.trim() || firstName;
  // Validação básica para evitar documentos vazios no Firestore
  if (pedido.trim().length < 10) {
    Alert.alert("Atenção", "O pedido precisa de mais detalhes para ser registrado.");
    return;
  }

  setLoading(true);
  try {
    const db = getFirestore(); // Obtém a instância exportada do seu firebase.js
    
    await addDoc(collection(db, 'pedidos'), {
    userId: user?.uid || 'visitante_anonimo',
    userName: nomeFinal, 
    texto: pedido,
    categoria: categoria,
    isPrivado: isPrivado,
    status: PRAYER_STATUS.PENDING,
    dataCriacao: serverTimestamp(), // Timestamp para ordenação no Admin
    });
    setPedido('');
    setNomePersonalizado('');
    setIsPrivado(false);
    setCategoria(null)

    Alert.alert("Sucesso", "Seu pedido de oração foi enviado com sucesso.");
    navigation.goBack();
  } catch (error) {
    console.error("Erro ao salvar pedido:", error);
    Alert.alert("Erro", "Não foi possível conectar ao banco de dados.");
  } finally {
    setLoading(false);
  }
};

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.primary }]}>PEDIDO DE ORAÇÃO</Text>
      
      <Text style={[styles.label, { color: theme.textSecondary }]}>CATEGORIA:</Text>
      <View style={styles.categoriesContainer}>
        {PRAYER_CATEGORIES.map((item) => (
          <TouchableOpacity 
            key={item} 
            onPress={() => setCategoria(item)}
            style={[
              styles.chip, 
              { backgroundColor: categoria === item ? theme.primary : theme.surfaceVariant }
            ]}
          >
            <Text style={{ color: categoria === item ? '#000' : theme.text, fontSize: 12 }}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { color: theme.textSecondary }]}>SEU NOME (OPCIONAL):</Text>
      <View style={[styles.inputCard, { backgroundColor: theme.surfaceVariant, minHeight: 50, marginBottom: 15 }]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder={user ? `Logado como: ${firstName}` : "Como quer ser chamado?"}
          placeholderTextColor={theme.textSecondary}
          value={nomePersonalizado}
          onChangeText={setNomePersonalizado}
        />
      </View>

      <View style={[styles.inputCard, { backgroundColor: theme.surfaceVariant }]}>
        <TextInput
          style={[styles.input, { color: theme.text,flex: 1 }]}
          placeholder="Como podemos orar por você?"
          placeholderTextColor={theme.textSecondary}
          multiline
          value={pedido}
          onChangeText={setPedido}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.switchLabel, { color: theme.text }]}>Pedido Sigiloso?</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 11 }}>Apenas os pastores visualizarão este pedido.</Text>
        </View>
        <Switch value={isPrivado} onValueChange={setIsPrivado} trackColor={{ true: theme.primary }} />
      </View>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: theme.primary }]}
        onPress={handleEnviar}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.buttonText}>ENVIAR PEDIDO</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  label: { fontSize: 12, fontWeight: 'bold', marginBottom: 10 },
  categoriesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  inputCard: { borderRadius: 12, padding: 15, minHeight: 120, marginBottom: 20 },
  input: { fontSize: 15, lineHeight: 22 },
  switchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  switchLabel: { fontSize: 16, fontWeight: 'bold' },
  button: { height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  buttonText: { fontWeight: 'bold', color: '#000' }
});