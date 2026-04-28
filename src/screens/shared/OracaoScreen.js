import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  StyleSheet, ScrollView, Alert, ActivityIndicator, Switch 
} from 'react-native';
import { getFirestore } from '../../services/firebase'; 
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
  const [nomePersonalizado, setNomePersonalizado] = useState('');

  const firstName = user?.displayName?.split(' ')[0] ?? 'Visitante';

  const handleEnviar = async () => {
    // ─── Validação Matemática ───
    if (!categoria) {
      Alert.alert("Atenção", "Selecione uma categoria para o seu pedido.");
      return;
    }
    
    if (pedido.trim().length < 10) {
      Alert.alert("Atenção", "Descreva seu pedido com um pouco mais de detalhes (mínimo 10 caracteres).");
      return;
    }

    setLoading(true);
    try {
      const db = getFirestore();
      const nomeFinal = nomePersonalizado.trim() || firstName;
      
      // Objeto de dados limpo para o Firestore
      const pedidoData = {
        userId: user?.uid || 'visitante_anonimo',
        userName: nomeFinal, 
        texto: pedido.trim(),
        categoria: categoria,
        isPrivado: isPrivado,
        status: PRAYER_STATUS.PENDING,
        dataCriacao: serverTimestamp(),
      };

      await addDoc(collection(db, 'pedidos'), pedidoData);

      // Reset de estado e navegação
      setPedido('');
      setNomePersonalizado('');
      setIsPrivado(false);
      setCategoria(null);

      Alert.alert("Sucesso", "Seu pedido de oração foi enviado com sucesso.");
      navigation.goBack();
    } catch (error) {
      // Erro tratado sem poluir o console com logs excessivos
      Alert.alert("Erro", "Não foi possível enviar seu pedido agora. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: theme.primary }]}>PEDIDO DE ORAÇÃO</Text>
      
      <Text style={[styles.label, { color: theme.textSecondary }]}>CATEGORIA:</Text>
      <View style={styles.categoriesContainer}>
        {PRAYER_CATEGORIES.map((item) => (
          <TouchableOpacity 
            key={item} 
            onPress={() => setCategoria(item)}
            activeOpacity={0.7}
            style={[
              styles.chip, 
              { backgroundColor: categoria === item ? theme.primary : theme.surfaceVariant }
            ]}
          >
            <Text style={{ 
              color: categoria === item ? theme.textOnGold : theme.text, 
              fontSize: 12,
              fontWeight: categoria === item ? '700' : '400' 
            }}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { color: theme.textSecondary }]}>SEU NOME (OPCIONAL):</Text>
      <View style={[styles.inputCard, styles.nameInputCard, { backgroundColor: theme.surfaceVariant }]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder={user ? `Logado como: ${firstName}` : "Como quer ser chamado?"}
          placeholderTextColor={theme.textSecondary}
          value={nomePersonalizado}
          onChangeText={setNomePersonalizado}
        />
      </View>

      <Text style={[styles.label, { color: theme.textSecondary }]}>SEU PEDIDO:</Text>
      <View style={[styles.inputCard, { backgroundColor: theme.surfaceVariant }]}>
        <TextInput
          style={[styles.input, { color: theme.text, flex: 1 }]}
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
          <Text style={{ color: theme.textSecondary, fontSize: 11 }}>
            Apenas os pastores visualizarão este pedido.
          </Text>
        </View>
        <Switch 
          value={isPrivado} 
          onValueChange={setIsPrivado} 
          trackColor={{ true: theme.primary, false: theme.border }} 
          thumbColor={isPrivado ? theme.primary : '#f4f3f4'}
        />
      </View>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: theme.primary }]}
        onPress={handleEnviar}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color={theme.textOnGold} />
        ) : (
          <Text style={[styles.buttonText, { color: theme.textOnGold }]}>ENVIAR PEDIDO</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 25 },
  label: { fontSize: 11, fontWeight: '800', marginBottom: 8, letterSpacing: 1 },
  categoriesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 25 },
  chip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'transparent' },
  inputCard: { borderRadius: 12, padding: 15, minHeight: 150, marginBottom: 20 },
  nameInputCard: { minHeight: 55, justifyContent: 'center' },
  input: { fontSize: 15, lineHeight: 22 },
  switchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 35, paddingHorizontal: 5 },
  switchLabel: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  button: { height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  buttonText: { fontWeight: '800', fontSize: 16, letterSpacing: 1 }
});