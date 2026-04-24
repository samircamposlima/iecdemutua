import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, ScrollView,
  TouchableOpacity, StyleSheet, ActivityIndicator, Linking,
} from 'react-native';
import { getFirestore, doc, getDoc, collection, query, where, orderBy, limit, getDocs } from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useAppTheme } from '../../themes';

// ── Links das redes sociais — substitua pelos perfis reais da igreja ──
const SOCIAL_LINKS = {
  instagram: 'https://instagram.com/igreja.missao',
  facebook:  'https://facebook.com/iecDeMutua',
};
// ─────────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { user, role } = useAuth();
  const navigation     = useNavigation();
  const theme          = useAppTheme();

  const [themeOfYear, setThemeOfYear] = useState(null);
  const [verseOfDay,  setVerseOfDay]  = useState(null);
  const [nextEvent,   setNextEvent]   = useState(null);
  const [loading,     setLoading]     = useState(true);

  const isMember  = role === 'membro' || role === 'admin';
  const firstName = user?.displayName?.split(' ')[0] ?? null;

  useEffect(() => {
    async function loadHomeData() {
      try {
        const db = getFirestore();

        const themeSnap = await getDoc(doc(db, 'config', 'themeOfYear'));
        if (themeSnap?.exists) setThemeOfYear(themeSnap.data());

        const verseSnap = await getDoc(doc(db, 'config', 'verseOfDay'));
        if (verseSnap?.exists) setVerseOfDay(verseSnap.data());

        const eventsRef   = collection(db, 'events');
        const now         = new Date();
        const constraints = isMember
          ? [where('date', '>=', now), orderBy('date'), limit(1)]
          : [where('date', '>=', now), where('isPrivate', '==', false), orderBy('date'), limit(1)];
        const eventsSnap  = await getDocs(query(eventsRef, ...constraints));
        if (!eventsSnap.empty) setNextEvent(eventsSnap.docs[0].data());

      } catch (error) {
        console.error('Erro ao carregar Home:', error);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, [isMember]);

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
    >
      {/* ── Tema do Ano ── */}
      {themeOfYear && (
        <View style={[styles.themeCard, { backgroundColor: theme.surface }]}>
          {themeOfYear.imageUrl ? (
            <Image
              source={{ uri: themeOfYear.imageUrl }}
              style={styles.themeImage}
              resizeMode="stretch"
            />
          ) : (
            <View style={[styles.themeImagePlaceholder, { backgroundColor: theme.surfaceVariant }]}>
              <Text style={{ color: theme.textDisabled }}>Imagem do tema</Text>
            </View>
          )}
          <View style={styles.themeTextContainer}>
            <Text style={[styles.themeTitle, { color: theme.primary }]}>
              {themeOfYear.title}
            </Text>
            {themeOfYear.verse ? (
              <Text style={[styles.themeVerse, { color: theme.textSecondary }]}>
                {themeOfYear.verse}
              </Text>
            ) : null}
          </View>
        </View>
      )}

      {/* ── Saudação ── */}
      <View style={styles.greetingContainer}>
        <Text style={[styles.greeting, { color: theme.text }]}>
          {getGreeting()}{firstName ? `, ${firstName}` : ''} 👋
        </Text>
        <Text style={[styles.greetingSub, { color: theme.textSecondary }]}>
          Igreja Evangélica de Mutua
        </Text>
      </View>

      {/* ── Aviso pendente ── */}
      {role === 'pendente' && (
        <View style={[styles.avisoPendenteCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.avisoPendenteTitle, { color: theme.primary }]}>
            ⏳ Acesso pendente
          </Text>
          <Text style={[styles.avisoPendenteText, { color: theme.textSecondary }]}>
            Sua conta foi criada! Um administrador ainda precisa liberar seu acesso como membro.
            Enquanto isso, você pode usar o app como visitante.
          </Text>
        </View>
      )}

      {/* ── Próximo Evento ── */}
      {nextEvent && (
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.cardLabel, { color: theme.primary }]}>📅 PRÓXIMO EVENTO</Text>
          <Text style={[styles.cardTitle, { color: theme.text }]}>{nextEvent.title}</Text>
          <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
            {formatDate(nextEvent.date?.toDate())}
          </Text>
        </View>
      )}

      {/* ── Versículo do Dia ── */}
      {verseOfDay && (
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.cardLabel, { color: theme.primary }]}>🙏 VERSÍCULO DO DIA</Text>
          <Text style={[styles.verseText, { color: theme.text }]}>
            "{verseOfDay.text}"
          </Text>
          <Text style={[styles.cardSub, { color: theme.primary }]}>
            {verseOfDay.reference}
          </Text>
        </View>
      )}

      {/* ── Acesso Rápido ── */}
      <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>⚡ ACESSO RÁPIDO</Text>
      <View style={styles.quickGrid}>
        <QuickButton label="Bíblia"  emoji="📖" onPress={() => navigation.navigate('Biblia')}           theme={theme} />
        <QuickButton label="Oração"  emoji="🙏" onPress={() => navigation.navigate('Pedido de Oração')} theme={theme} />
        <QuickButton label="Pix"     emoji="💛" onPress={() => navigation.navigate('Doação / Pix')}     theme={theme} />
        {isMember && (
          <QuickButton label="Cultos" emoji="🏠" onPress={() => navigation.navigate('Cultos no Lar')}   theme={theme} />
        )}
      </View>

      {/* ── Redes Sociais ── */}
      <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>🌐 REDES SOCIAIS</Text>
      <View style={[styles.socialCard, { backgroundColor: theme.surface }]}>
        <SocialButton
          label="Instagram"
          emoji="📸"
          color="#E1306C"
          onPress={() => Linking.openURL(SOCIAL_LINKS.instagram)}
          theme={theme}
        />
        <View style={[styles.socialDivider, { backgroundColor: theme.divider }]} />
        <SocialButton
          label="Facebook"
          emoji="👥"
          color="#1877F2"
          onPress={() => Linking.openURL(SOCIAL_LINKS.facebook)}
          theme={theme}
        />
      </View>

    </ScrollView>
  );
}

// ── Botão de acesso rápido ──
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

// ── Botão de rede social ──
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

// ── Utilitários ──
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function formatDate(date) {
  if (!date) return '';
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── Estilos ──
const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 48,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 3,
  },
  themeImage: {
    width: '100%',
    aspectRatio: 1300 / 800,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  themeImagePlaceholder: {
    width: '100%',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeTextContainer: {
    padding: 14,
    paddingBottom: 18,
  },
  themeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  themeVerse: {
    fontSize: 13,
  },
  greetingContainer: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  greetingSub: {
    fontSize: 14,
    marginTop: 2,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
  },
  verseText: {
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 6,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  quickButton: {
    width: '47%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    elevation: 1,
  },
  quickEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  quickButtonLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  socialCard: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    marginBottom: 8,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  socialIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  socialEmoji: {
    fontSize: 20,
  },
  socialLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  socialArrow: {
    fontSize: 22,
    fontWeight: '300',
  },
  socialDivider: {
    height: 1,
    marginLeft: 68,
  },
  avisoPendenteCard: {
  borderRadius: 12,
  padding: 16,
  marginBottom: 14,
  elevation: 2,
  borderLeftWidth: 3,
  borderLeftColor: '#C9A84C',
},
avisoPendenteTitle: {
  fontSize: 14,
  fontWeight: '700',
  marginBottom: 6,
},
avisoPendenteText: {
  fontSize: 13,
  lineHeight: 20,
},
});