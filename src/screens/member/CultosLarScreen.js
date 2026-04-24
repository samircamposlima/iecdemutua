import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useAppTheme } from '../../themes';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function CultoNoLarScreen() {
  const theme = useAppTheme();
  const [enderecos, setEnderecos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; // Trava para evitar atualizações em componentes desmontados
    console.log("Iniciando conexão com Firestore...");

    const unsubscribe = firestore()
      .collection('churches')
      .doc('iecdemutu')
      .collection('addresses')
      .orderBy('order', 'asc')
      .onSnapshot(querySnapshot => {
        if (!querySnapshot) return;

        const list = [];
        querySnapshot.forEach(doc => {
          list.push({ id: doc.id, ...doc.data() });
        });

        if (isMounted) {
          console.log("Dados recebidos. Itens:", list.length);
          setEnderecos(list);
          setLoading(false);
        }
      }, error => {
        console.error("Erro no Firestore:", error);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      unsubscribe(); // Corta a conexão com o Firebase
      console.log("Listener encerrado.");
    };
  }, []); // Mantemos o [] vazio para rodar apenas no "mount"

 const renderItem = ({ item }) => (
  <TouchableOpacity 
    style={[styles.card, { backgroundColor: theme.surfaceVariant }]}
    onPress={() => {
      // Agora usamos o campo específico de endereço para o GPS
      if (item.address) {
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address)}`;
        Linking.openURL(url);
      }
    }}
  >
    <View style={styles.cardContent}>
      <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
        <Icon name="home-group" size={28} color={theme.primary} />
      </View>
      
      <View style={styles.textContainer}>
        {/* Exibe o Título (Ex: ADOLESCENTES) */}
        <Text style={[styles.typeText, { color: theme.primary }]}>
          {item.name}
        </Text>
        
        {/* Exibe o Endereço Real */}
        <Text style={[styles.addressText, { color: theme.text }]}>
          {item.address}
        </Text>
        
        <Text style={[styles.tapAction, { color: theme.primary }]}>
          VER NO MAPA
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.primary }]}>CULTOS NO LAR</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={enderecos}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listPadding}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Nenhum culto cadastrado para esta região.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 25, letterSpacing: 2 },
  listPadding: { paddingBottom: 40 },
  card: { 
    borderRadius: 16, 
    marginBottom: 16,
    padding: 16,
    elevation: 4, // Android Shadow
    shadowColor: '#000', // iOS Shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6
  },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { 
    width: 54, 
    height: 54, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 15 
  },
  textContainer: { flex: 1 },
  addressText: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  tapAction: { fontSize: 10, marginTop: 6, fontWeight: '800', letterSpacing: 1 }
});