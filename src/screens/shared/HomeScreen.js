import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, Image, ScrollView,
  TouchableOpacity, StyleSheet, ActivityIndicator, Linking,
} from 'react-native';
import { 
  getFirestore, doc, getDoc, collection, query, 
  where, orderBy, limit, getDocs 
} from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { useAppTheme } from '../../themes';

const SOCIAL_LINKS = {
  instagram: 'https://instagram.com/igreja.missao',
  facebook:  'https://facebook.com/iecDeMutua',
};

export default function HomeScreen() {
  const { user, role } = useAuth();
  const navigation = useNavigation();
  const theme = useAppTheme();

  const [themeOfYear, setThemeOfYear] = useState(null);
  const [verseOfDay, setVerseOfDay] = useState(null);
  const [nextEvent, setNextEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const isMember = role === 'membro' || role === 'admin';
  const firstName = user?.displayName?.split(' ')[0] ?? null;

  // ─── LÓGICA DE DADOS (TRIAGEM MATEMÁTICA) ───────────────────────────────

  const loadHomeData = useCallback(async () => {
    try {
      const db = getFirestore();
      const now = new Date();

      // 1. Execução em paralelo para otimizar tempo de carregamento
      const [themeSnap, agendaSnap] = await Promise.all([
        getDoc(doc(db, 'config', 'themeOfYear')),
        getDocs(query(
          collection(db, 'agenda'),
          where('dateStart', '>=', now),
          ...(isMember ? [] : [where('visibility', '==', 0)]),
          orderBy('dateStart', 'asc'),
          limit(1)
        ))
      ]);

      if (themeSnap.exists) setThemeOfYear(themeSnap.data());

      if (!agendaSnap.empty) {
        const data = agendaSnap.docs[0].data();
        setNextEvent({ title: data.name, date: data.dateStart });
      }

      // 2. Versículo do Dia (Lógica de Cache Separada)
      await fetchVerse(db);

    } catch (error) {
      // Log removido para produção, mantendo apenas erro crítico silencioso
    } finally {
      setLoading(false);
    }
  }, [isMember]);

  const fetchVerse = async (db) => {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const saved = await AsyncStorage.getItem('@verse_data');
      const verseObj = saved ? JSON.parse(saved) : null;

      if (verseObj?.date === today) {
        setVerseOfDay(verseObj.data);
        return;
      }

      const response = await api.get('data/almeida/random');
      const { text, book, chapter, verse } = response.data.random_verse;
      const newVerse = { text: text.trim(), reference: `${book} ${chapter}:${verse}` };

      await AsyncStorage.setItem('@verse_data', JSON.stringify({ date: today, data: newVerse }));
      setVerseOfDay(newVerse);

    } catch (err) {
      // Fallback matemático: Firebase -> Hardcoded
      const verseSnap = await getDoc(doc(db, 'config', 'verseOfDay'));
      setVerseOfDay(verseSnap.exists() ? verseSnap.data() : {
        text: "O Senhor é o meu pastor, nada me faltará.",
        reference: "Salmos 23:1"
      });
    }
  };

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  // ─── RENDERIZAÇÃO ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={{ backgroundColor: theme.background }} 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Tema do Ano */}
      {themeOfYear && (
        <View style={[styles.themeCard, { backgroundColor: theme.surface }]}>
          {themeOfYear.imageUrl ? (
            <Image source={{ uri: themeOfYear.imageUrl }} style={styles.themeImage} resizeMode="stretch" />
          ) : (
            <View style={[styles.themeImagePlaceholder, { backgroundColor: theme.surfaceVariant }]} />
          )}
          <View style={styles.themeTextContainer}>
            <Text style={[styles.themeTitle, { color: theme.primary }]}>{themeOfYear.title}</Text>
            {themeOfYear.verse && <Text style={[styles.themeVerse, { color: theme.textSecondary }]}>{themeOfYear.verse}</Text>}
          </View>
        </View>
      )}

      {/* Saudação */}
      <View style={styles.greetingContainer}>
        <Text style={[styles.greeting, { color: theme.text }]}>{getGreeting()}{firstName ? `, ${firstName}` : ''} 👋</Text>
        <Text style={[styles.greetingSub, { color: theme.textSecondary }]}>Igreja Evangélica de Mutua</Text>
      </View>

      {/* Próximo Evento */}
      {nextEvent && (
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: theme.surface }]}
          onPress={() => navigation.navigate('Agenda')}
        >
          <Text style={[styles.cardLabel, { color: theme.primary }]}>📅 PRÓXIMO EVENTO</Text>
          <Text style={[styles.cardTitle, { color: theme.text }]}>{nextEvent.title}</Text>
          <Text style={[styles.cardSub, { color: theme.textSecondary }]}>{formatDate(nextEvent.date?.toDate())}</Text>
        </TouchableOpacity>
      )}

      {/* Versículo */}
      {verseOfDay && (
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.cardLabel, { color: theme.primary }]}>🙏 VERSÍCULO DO DIA</Text>
          <Text style={[styles.verseText, { color: theme.text }]}>"{verseOfDay.text}"</Text>
          <Text style={[styles.cardSub, { color: theme.primary, fontWeight: '700' }]}>{verseOfDay.reference}</Text>
        </View>
      )}

      {/* Acesso Rápido */}
      <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>⚡ ACESSO RÁPIDO</Text>
      <View style={styles.quickGrid}>
        <QuickButton label="Bíblia" emoji="📖" onPress={() => navigation.navigate('Bíblia')} theme={theme} />
        <QuickButton label="Oração" emoji="🙏" onPress={() => navigation.navigate('Pedido de Oração')} theme={theme} />
        <QuickButton label="Pix" emoji="💛" onPress={() => navigation.navigate('Doação / Pix')} theme={theme} />
        {isMember && <QuickButton label="Cultos" emoji="🏠" onPress={() => navigation.navigate('Cultos no Lar')} theme={theme} />}
      </View>

      {/* Redes Sociais */}
      <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>🌐 REDES SOCIAIS</Text>
      <View style={[styles.socialCard, { backgroundColor: theme.surface }]}>
        <SocialButton label="Instagram" emoji="📸" color="#E1306C" onPress={() => Linking.openURL(SOCIAL_LINKS.instagram)} theme={theme} />
        <View style={[styles.socialDivider, { backgroundColor: theme.divider }]} />
        <SocialButton label="Facebook" emoji="👥" color="#1877F2" onPress={() => Linking.openURL(SOCIAL_LINKS.facebook)} theme={theme} />
      </View>
    </ScrollView>
  );
}

// ─── AUXILIARES ───────────────────────────────────────────────────────────

function QuickButton({ label, emoji, onPress, theme }) {
  return (
    <TouchableOpacity 
      style={[styles.quickButton, { backgroundColor: theme.surface, borderColor: theme.border }]} 
      onPress={onPress}
    >
      <Text style={styles.quickEmoji}>{emoji}</Text>
      <Text style={[styles.quickButtonLabel, { color: theme.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function SocialButton({ label, emoji, color, onPress, theme }) {
  return (
    <TouchableOpacity style={styles.socialButton} onPress={onPress}>
      <View style={[styles.socialIconContainer, { backgroundColor: color + '22' }]}>
        <Text style={styles.socialEmoji}>{emoji}</Text>
      </View>
      <Text style={[styles.socialLabel, { color: theme.text }]}>{label}</Text>
      <Text style={[styles.socialArrow, { color: theme.textDisabled }]}>›</Text>
    </TouchableOpacity>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  return hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
}

function formatDate(date) {
  if (!date) return '';
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  themeCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 20, elevation: 3 },
  themeImage: { width: '100%', aspectRatio: 13 / 8 },
  themeImagePlaceholder: { width: '100%', height: 180 },
  themeTextContainer: { padding: 16 },
  themeTitle: { fontSize: 18, fontWeight: 'bold' },
  themeVerse: { fontSize: 13, marginTop: 4 },
  greetingContainer: { marginBottom: 20 },
  greeting: { fontSize: 22, fontWeight: 'bold' },
  greetingSub: { fontSize: 14, marginTop: 2 },
  card: { borderRadius: 12, padding: 16, marginBottom: 14, elevation: 2 },
  cardLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardSub: { fontSize: 13, marginTop: 4 },
  verseText: { fontSize: 15, fontStyle: 'italic', lineHeight: 22, marginBottom: 8 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10, marginTop: 10 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickButton: { width: '48%', borderRadius: 12, borderWidth: 1, padding: 16, alignItems: 'center' },
  quickEmoji: { fontSize: 28, marginBottom: 6 },
  quickButtonLabel: { fontSize: 14, fontWeight: '600' },
  socialCard: { borderRadius: 12, overflow: 'hidden', elevation: 2 },
  socialButton: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  socialIconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  socialEmoji: { fontSize: 20 },
  socialLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  socialArrow: { fontSize: 22 },
  socialDivider: { height: 1, marginLeft: 68 },
});