import React, {
  useEffect, useRef, useCallback, useState,
} from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, StatusBar, Platform, ActivityIndicator, ToastAndroid,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppTheme } from '../themes';
import {
  getVerses,
  getPreviousChapter,
  getNextChapter,
} from '../services/BibleService';
import { saveReadingPosition } from '../services/BibleStorage';

export default function ReadingScreen() {
  const theme = useAppTheme();
  const s = makeStyles(theme);
  const navigation = useNavigation();
  const route = useRoute();

  const {
    versionFile,
    versionId,
    bookId,
    bookName,
    shortName,
    chapter,
    verse: initialVerse,
  } = route.params;

  // Estados de controle de conteúdo
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBookId, setCurrentBookId] = useState(bookId);
  const [currentBookName, setCurrentBookName] = useState(bookName);
  const [currentShortName, setCurrentShortName] = useState(shortName);
  const [currentChapter, setCurrentChapter] = useState(chapter);
  const [highlightVerse, setHighlightVerse] = useState(initialVerse);

  const listRef = useRef(null);

  // ─── Carregamento de Dados ──────────────────────────────────────────────

  const loadVerses = useCallback(async (bkId, ch) => {
    setLoading(true);
    try {
      const vss = await getVerses(versionFile, bkId, ch);
      setVerses(vss || []);
    } catch (e) {
      setVerses([]);
    } finally {
      setLoading(false);
    }
  }, [versionFile]);

  // Efeito disparado ao mudar de livro ou capítulo
  useEffect(() => {
    loadVerses(currentBookId, currentChapter);

    // Salva posição persistente (BibleReadingPreferencesRepository)
    saveReadingPosition({
      bookId: currentBookId,
      bookName: currentBookName,
      shortName: currentShortName,
      chapter: currentChapter,
      verse: highlightVerse ?? 0,
    });
  }, [currentBookId, currentChapter]);

  // ─── Lógica de Scroll e Highlight ───────────────────────────────────────

  useEffect(() => {
    if (!highlightVerse || verses.length === 0) return;

    const index = verses.findIndex(v => v.verse === highlightVerse);
    if (index < 0) return;

    // Timer para garantir que a lista terminou de renderizar antes do scroll
    const timer = setTimeout(() => {
      listRef.current?.scrollToIndex({ index, animated: true, viewOffset: 80 });
    }, 400);

    // Remove o destaque visual após 2.5 segundos (flashHighlight)
    const clearTimer = setTimeout(() => setHighlightVerse(null), 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(clearTimer);
    };
  }, [verses, highlightVerse]);

  // ─── Navegação Matemática entre Capítulos ──────────────────────────────

  const handlePageChange = async (direction) => {
    const fetcher = direction === 'next' ? getNextChapter : getPreviousChapter;
    const res = await fetcher(versionFile, currentBookId, currentChapter);

    if (!res) {
      const msg = direction === 'next' ? 'Fim da Bíblia' : 'Início da Bíblia';
      if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
      return;
    }

    // Atualiza estados locais (Trigger para o useEffect de carregamento)
    setCurrentBookId(res.bookId);
    setCurrentBookName(res.bookName);
    setCurrentShortName(res.shortName);
    setCurrentChapter(res.chapter);
    setHighlightVerse(null); // Reseta highlight ao trocar de página
  };

  // ─── Componentização de Linha (ViewHolder) ──────────────────────────────

  const renderVerse = useCallback(({ item }) => {
    const isHighlighted = item.verse === highlightVerse;
    return (
      <View style={[s.verseRow, isHighlighted && s.verseRowHighlight]}>
        <Text style={[s.verseNum, isHighlighted && s.verseNumHighlight]}>
          {item.verse}
        </Text>
        <Text style={[s.verseText, isHighlighted && s.verseTextHighlight]}>
          {item.text}
        </Text>
      </View>
    );
  }, [highlightVerse, s]);

  const titleText = highlightVerse
    ? `${currentShortName} ${currentChapter}:${highlightVerse}`
    : `${currentShortName} ${currentChapter}`;

  return (
    <View style={s.container}>
      <StatusBar backgroundColor={theme.headerBackground} barStyle="light-content" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={s.headerTitleBtn} 
          onPress={() => navigation.navigate('Biblia')}
        >
          <Text style={s.headerTitle} numberOfLines={1}>{titleText}</Text>
        </TouchableOpacity>
      </View>

      {/* Corpo do Texto */}
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={verses}
          keyExtractor={(item) => String(item.verse)}
          renderItem={renderVerse}
          contentContainerStyle={s.listPad}
          initialNumToRender={20}
          onScrollToIndexFailed={(info) => {
            // Fallback para itens fora da viewport inicial
            listRef.current?.scrollToOffset({
              offset: info.averageItemHeight * info.index,
              animated: false,
            });
            setTimeout(() => {
              listRef.current?.scrollToIndex({ index: info.index, animated: true, viewOffset: 80 });
            }, 100);
          }}
        />
      )}

      {/* Rodapé Fixo */}
      <View style={s.footer}>
        <TouchableOpacity style={s.footerBtn} onPress={() => handlePageChange('prev')}>
          <Text style={s.footerBtnText}>← Anterior</Text>
        </TouchableOpacity>

        <View style={s.footerCenter}>
          <Text style={s.footerChapter}>{currentShortName} {currentChapter}</Text>
          <Text style={s.footerVersion}>{versionId}</Text>
        </View>

        <TouchableOpacity style={s.footerBtn} onPress={() => handlePageChange('next')}>
          <Text style={s.footerBtnText}>Próximo →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Estilos (Ajustes de Performance e UI) ────────────────────────────────

function makeStyles(theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.headerBackground,
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
      paddingHorizontal: 16,
      paddingBottom: 15,
      elevation: 4,
    },
    backBtn: { paddingRight: 15 },
    backIcon: { color: theme.primary, fontSize: 24, fontWeight: 'bold' },
    headerTitleBtn: { flex: 1 },
    headerTitle: { color: theme.headerText, fontSize: 19, fontWeight: '700' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listPad: { padding: 20, paddingBottom: 120 },
    verseRow: {
      flexDirection: 'row',
      marginBottom: 16,
      gap: 12,
      paddingVertical: 4,
      paddingHorizontal: 6,
      borderRadius: 8,
    },
    verseRowHighlight: {
      backgroundColor: theme.primary + '15',
      borderLeftWidth: 4,
      borderLeftColor: theme.primary,
    },
    verseNum: {
      color: theme.primary,
      fontWeight: 'bold',
      fontSize: 14,
      minWidth: 26,
      textAlign: 'right',
      marginTop: 4,
      opacity: 0.7,
    },
    verseNumHighlight: { opacity: 1, scale: 1.1 },
    verseText: {
      flex: 1,
      color: theme.text,
      fontSize: 18,
      lineHeight: 30,
    },
    verseTextHighlight: { fontWeight: '600' },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.surface,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingHorizontal: 16,
      paddingVertical: 14,
      position: 'absolute',
      bottom: 0,
      width: '100%',
    },
    footerBtn: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: theme.surfaceVariant,
      borderWidth: 1,
      borderColor: theme.border,
    },
    footerBtnText: { color: theme.primary, fontWeight: '800', fontSize: 13 },
    footerCenter: { alignItems: 'center' },
    footerChapter: { color: theme.text, fontWeight: '700', fontSize: 15 },
    footerVersion: { color: theme.textSecondary, fontSize: 11, marginTop: 2, fontWeight: '600' },
  });
}