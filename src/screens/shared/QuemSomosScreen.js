import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, StyleSheet, Linking, TouchableOpacity } from 'react-native';
// Atualizado para API Modular conforme padrão do projeto
import { getFirestore, collection, query, orderBy, onSnapshot } from '@react-native-firebase/firestore';
import { useAppTheme } from '../../themes';
import { useAuth } from '../../contexts/AuthContext';
import { CHURCH_DATA } from '../../utils/constants/QuemSomos';

export default function QuemSomosScreen() {
  const theme = useAppTheme();
  const { role } = useAuth(); // Acesso ao nível de acesso do usuário
  const [pastores, setPastores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // REGRA DE ACESSO: Se for visitante (null/undefined), não inicia o listener
    if (role !== 'membro' && role !== 'admin') {
      setLoading(false);
      return;
    }

    const db = getFirestore();
    const q = query(collection(db, 'pastores'), orderBy('ordem', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const list = [];
      querySnapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setPastores(list);
      setLoading(false);
    }, error => {
      console.error("Erro ao carregar pastores:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [role]);

  const Section = ({ title, body }) => (
    <View style={styles.sectionMargin}>
      <Text style={[styles.dnaTitle, { color: theme.primary }]}>{title}</Text>
      <Text style={[styles.dnaBody, { color: theme.text }]}>{body}</Text>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.mainTitle, { color: theme.primary }]}>QUEM SOMOS</Text>

      <Section title="Nossa Missão:" body="Propagar o Evangelho, divulgar o nome de Jesus, falar dos Seus feitos, até que Ele venha." />
      <Section title="Nossa Visão:" body="Uma teologia Reformada, que defende a soberania de Deus, a autoridade das Escrituras, a salvação pela graça através de Cristo e a necessidade do evangelismo." />
      <Section title="Nosso Propósito:" body="Que o nome do Senhor se faça conhecido entre todos, que Ele seja glorificado e que cada irmão se fortaleça na comunhão e no partilhar do pão em comunidade." />

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <Text style={[styles.subTitle, { color: theme.primary, marginBottom: 20 }]}>Nossa Liderança</Text>

      {loading ? (
        <ActivityIndicator color={theme.primary} size="large" />
      ) : (role === 'membro' || role === 'admin') ? (
        pastores.map(pastor => (
          <View key={pastor.id} style={[styles.pastorCard, { backgroundColor: theme.surfaceVariant }]}>
            <View style={styles.pastorHeader}>
              <Image 
                source={{ uri: pastor.fotoUrl || 'https://via.placeholder.com/150' }} 
                style={[styles.avatar, { borderColor: theme.primary }]} 
              />
              <View>
                <Text style={[styles.pastorNome, { color: theme.text }]}>{pastor.nome}</Text>
                <Text style={[styles.pastorCargo, { color: theme.primary }]}>{pastor.cargo}</Text>
              </View>
            </View>
            <Text style={[styles.pastorBio, { color: theme.textSecondary }]}>{pastor.bio}</Text>
          </View>
        ))
      ) : (
        /* Estado para Visitantes */
        <View style={[styles.lockCard, { backgroundColor: theme.surfaceVariant }]}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={[styles.lockText, { color: theme.textSecondary }]}>
            Informações de liderança visíveis apenas para membros registrados.
          </Text>
        </View>
      )}

      <View style={[styles.divider, { backgroundColor: theme.border }]} />
      
      <Text style={[styles.subTitle, { color: theme.primary, marginBottom: 15 }]}>Fale Conosco</Text>
      
      <View style={[styles.contactCard, { backgroundColor: theme.surfaceVariant }]}>
        <TouchableOpacity 
          onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CHURCH_DATA.address)}`)}
          style={styles.contactItem}
        >
          <Text style={[styles.contactLabel, { color: theme.primary }]}>ENDEREÇO</Text>
          <Text style={[styles.contactValue, { color: theme.text }]}>{CHURCH_DATA.address}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => Linking.openURL(`mailto:${CHURCH_DATA.email}`)}
          style={styles.contactItem}
        >
          <Text style={[styles.contactLabel, { color: theme.primary }]}>E-MAIL</Text>
          <Text style={[styles.contactValue, { color: theme.text }]}>{CHURCH_DATA.email}</Text>
        </TouchableOpacity>
      </View>
      
      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // ... estilos anteriores ...
  lockCard: { padding: 20, borderRadius: 12, alignItems: 'center', gap: 10 },
  lockIcon: { fontSize: 24 },
  lockText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  // Correção na URL do Maps
  contactCard: { padding: 20, borderRadius: 12, marginBottom: 10 },
  contactItem: { marginBottom: 15 },
  contactLabel: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
  contactValue: { fontSize: 15, lineHeight: 20 },
  // Reutilizando os estilos que você já tinha
  container: { flex: 1, padding: 20 },
  mainTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30, letterSpacing: 2 },
  sectionMargin: { marginBottom: 25 },
  dnaTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  dnaBody: { fontSize: 16, lineHeight: 24, textAlign: 'justify' },
  divider: { height: 1, marginVertical: 30, opacity: 0.3 },
  subTitle: { fontSize: 20, fontWeight: 'bold', textTransform: 'uppercase' },
  pastorCard: { padding: 15, borderRadius: 12, marginBottom: 20 },
  pastorHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, marginRight: 15 },
  pastorNome: { fontSize: 18, fontWeight: 'bold' },
  pastorCargo: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  pastorBio: { fontSize: 14, lineHeight: 20, fontStyle: 'italic' },
});