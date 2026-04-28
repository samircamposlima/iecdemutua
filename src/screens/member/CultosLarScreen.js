import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useAppTheme } from '../../themes';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function CultoNoLarScreen() {
  const theme = useAppTheme();
  const [enderecos, setEnderecos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    // Listener em tempo real do Firestore
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
          setEnderecos(list);
          setLoading(false);
        }
      }, error => {
        console.error("Erro no Firestore:", error);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const openInMaps = (address) => {
    if (!address) return;
    const query = encodeURIComponent(address);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`
    });

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Fallback para navegador caso o app de mapas não responda
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
      }
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: theme.surfaceVariant }]}
      onPress={() => openInMaps(item.address)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
          <Icon name="home-group" size={28} color={theme.primary} />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.typeText, { color: theme.primary }]}>
            {item.name?.toUpperCase()}
          </Text>
          
          <Text style={[styles.addressText, { color: theme.text }]}>
            {item.address}
          </Text>
          
          <View style={styles.footerCard}>
            <Icon name="map-marker-radius" size={14} color={theme.primary} />
            <Text style={[styles.tapAction, { color: theme.primary }]}>
              TOQUE PARA VER NO MAPA
            </Text>
          </View>
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
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Nenhum culto cadastrado no momento.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 25, letterSpacing: 1 },
  listPadding: { paddingBottom: 40 },
  card: { 
    borderRadius: 16, 
    marginBottom: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
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
  typeText: { fontSize: 13, fontWeight: '800', marginBottom: 4, letterSpacing: 0.5 },
  addressText: { fontSize: 14, fontWeight: '500', lineHeight: 20, marginBottom: 8 },
  footerCard: { flexDirection: 'row', alignItems: 'center' },
  tapAction: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginLeft: 4 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 14 }
});