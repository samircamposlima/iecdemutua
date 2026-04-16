/**
 * ReadingScreen.js
 * Equivalente a: BiblicalTextFragment + BiblicalTextAdapter + BiblicalTextViewHolder
 *
 * Recebe via route.params:
 *   { versionFile, versionId, bookId, bookName, shortName, chapter, verse }
 *
 * Features:
 *   - Lista todos os versículos do capítulo
 *   - Versículo selecionado fica destacado em dourado (highlight temporário)
 *   - Scroll automático até o versículo ao abrir
 *   - Rodapé fixo: ← Capítulo anterior | Próximo →
 *   - Salva posição de leitura ao abrir (BibleReadingPreferencesRepository)
 *   - Título clicável → volta para BibliaScreen (popBackStack)
 */

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
  const theme      = useAppTheme();
  const s          = makeStyles(theme);
  const navigation = useNavigation();
  const route      = useRoute();

  const {
    versionFile,
    versionId,
    bookId,
    bookName,
    shortName,
    chapter,
    verse: initialVerse,
  } = route.params;

  const [verses,   setVerses]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [currentBookId,   setCurrentBookId]   = useState(bookId);
  const [currentBookName, setCurrentBookName] = useState(bookName);
  const [currentShortName, setCurrentShortName] = useState(shortName);
  const [currentChapter,  setCurrentChapter]  = useState(chapter);
  const [highlightVerse,  setHighlightVerse]  = useState(initialVerse);

  const listRef = useRef(null);

  // ─── Carrega versículos ───────────────────────────────────────────────────
  // Equivalente: BiblicalTextFragment.loadVerses()
const loadVerses = useCallback(async (bkId, ch) => { // Adicione async
  setLoading(true);
  try {
    // Adicione o AWAIT aqui, senão 'vss' será uma Promise pendente
    const vss = await getVerses(versionFile, bkId, ch); 
    setVerses(vss);
  } catch (e) {
    console.error('ReadingScreen.loadVerses:', e);
    setVerses([]);
  } finally {
    setLoading(false);
  }
}, [versionFile]);

  // ─── Init ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    loadVerses(currentBookId, currentChapter);

    // Salva posição ao abrir — BibleReadingPreferencesRepository.saveReadingPosition()
    saveReadingPosition({
      bookId:    currentBookId,
      bookName:  currentBookName,
      shortName: currentShortName,
      chapter:   currentChapter,
      verse:     highlightVerse ?? 0,
    });
  }, [currentBookId, currentChapter]);

  // ─── Scroll até o versículo destacado ────────────────────────────────────
  // Equivalente: BiblicalTextAdapter.scrollToVerseWithHighlight()
  useEffect(() => {
    if (!highlightVerse || verses.length === 0) return;

    const index = verses.findIndex(v => v.verse === highlightVerse);
    if (index < 0) return;

    // Pequeno delay para a FlatList renderizar
    const timer = setTimeout(() => {
      listRef.current?.scrollToIndex({ index, animated: true, viewOffset: 80 });
    }, 300);

    // Remove highlight após 2s (flashHighlight comentado no Kotlin, implementamos aqui)
    const clearTimer = setTimeout(() => setHighlightVerse(null), 2500);

    return () => { clearTimeout(timer); clearTimeout(clearTimer); };
  }, [verses, highlightVerse]);

  // ─── Navegação entre capítulos ────────────────────────────────────────────
  // Equivalente: navigateToPreviousChapter() / navigateToNextChapter()
  const goToPrevious = useCallback(async () => { // Adicione async
  const prev = await getPreviousChapter(versionFile, currentBookId, currentChapter);
    if (!prev) {
      ToastAndroid.show('Você está na primeira página da Bíblia', ToastAndroid.SHORT);
      return;
    }
    setCurrentBookId(prev.bookId);
    setCurrentBookName(prev.bookName);
    setCurrentShortName(prev.shortName);
    setCurrentChapter(prev.chapter);
    setHighlightVerse(null);

    saveReadingPosition({
      bookId:    prev.bookId,
      bookName:  prev.bookName,
      shortName: prev.shortName,
      chapter:   prev.chapter,
      verse:     0,
    });
  }, [versionFile, currentBookId, currentChapter]);

 const goToNext = useCallback(async () => { // Adicione async
  const next = await getNextChapter(versionFile, currentBookId, currentChapter);
    if (!next) {
      ToastAndroid.show('Você está na última página da Bíblia', ToastAndroid.SHORT);
      return;
    }
    setCurrentBookId(next.bookId);
    setCurrentBookName(next.bookName);
    setCurrentShortName(next.shortName);
    setCurrentChapter(next.chapter);
    setHighlightVerse(null);

    saveReadingPosition({
      bookId:    next.bookId,
      bookName:  next.bookName,
      shortName: next.shortName,
      chapter:   next.chapter,
      verse:     0,
    });
  }, [versionFile, currentBookId, currentChapter]);
  // ─── Título ───────────────────────────────────────────────────────────────
  // Equivalente: setupViews() — "Gênesis - Capítulo 1" ou "Gn 1:3"
  const title = highlightVerse
    ? `${currentShortName} ${currentChapter}:${highlightVerse}`
    : `${currentShortName} ${currentChapter}`;

  // ─── Cada versículo ───────────────────────────────────────────────────────
  // Equivalente: BiblicalTextViewHolder.bind()
  const renderVerse = useCallback(({ item }) => {
    const highlighted = item.verse === highlightVerse;
    return (
      <View style={[s.verseRow, highlighted && s.verseRowHighlight]}>
        {/* textViewNumVerse */}
        <Text style={[s.verseNum, highlighted && s.verseNumHighlight]}>
          {item.verse}
        </Text>
        {/* textViewVerse */}
        <Text style={[s.verseText, highlighted && s.verseTextHighlight]}>
          {item.text}
        </Text>
      </View>
    );
  }, [highlightVerse]);

  const keyExtractor = useCallback(item => String(item.verse), []);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <View style={s.container}>
      <StatusBar backgroundColor={theme.headerBackground} barStyle="light-content" />

      {/* Header — título clicável volta para BibliaScreen */}
      {/* Equivalente: setupTitleClickListener() → popBackStack */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backBtn}
        >
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.headerTitleBtn}
          onPress={() => navigation.navigate('Biblia')} // volta para a tab/drawer
        >
          <Text style={s.headerTitle} numberOfLines={1}>{title}</Text>
        </TouchableOpacity>
      </View>

      {/* Versículos */}
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={verses}
          keyExtractor={keyExtractor}
          renderItem={renderVerse}
          contentContainerStyle={s.listPad}
          onScrollToIndexFailed={(info) => {
            // Fallback se o índice ainda não foi renderizado
            setTimeout(() => {
              listRef.current?.scrollToIndex({
                index: info.index, animated: true, viewOffset: 80,
              });
            }, 500);
          }}
        />
      )}

      {/* Rodapé fixo — ← | → */}
      {/* Equivalente: buttonBack + buttonGo (setupNavigationButtons) */}
      <View style={s.footer}>
        <TouchableOpacity style={s.footerBtn} onPress={goToPrevious}>
          <Text style={s.footerBtnText}>← Anterior</Text>
        </TouchableOpacity>

        <View style={s.footerCenter}>
          <Text style={s.footerChapter}>
            {currentShortName} {currentChapter}
          </Text>
          <Text style={s.footerVersion}>{versionId}</Text>
        </View>

        <TouchableOpacity style={s.footerBtn} onPress={goToNext}>
          <Text style={s.footerBtnText}>Próximo →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
function makeStyles(theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },

    // Header
    header: {
      flexDirection:     'row',
      alignItems:        'center',
      backgroundColor:   theme.headerBackground,
      paddingTop:        Platform.OS === 'android' ? StatusBar.currentHeight : 44,
      paddingHorizontal: 12,
      paddingBottom:     12,
      gap: 8,
    },
    backBtn:       { padding: 4 },
    backIcon:      { color: theme.primary, fontSize: 22, fontWeight: 'bold' },
    headerTitleBtn:{ flex: 1 },
    headerTitle:   { color: theme.headerText, fontSize: 18, fontWeight: '600' },

    // Loading
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Lista de versículos
    listPad: { padding: 16, paddingBottom: 100 },

    // Linha de versículo — equivalente: item_layout_bible_text.xml
    verseRow: {
      flexDirection: 'row',
      marginBottom:  14,
      gap: 10,
      borderRadius:  6,
      padding:       4,
    },
    // Highlight — equivalente: flashHighlight() / applyHighlight()
    verseRowHighlight: {
      backgroundColor: theme.primary + '22', // 13% opacidade
      borderLeftWidth: 3,
      borderLeftColor: theme.primary,
      paddingLeft:     8,
    },
    verseNum: {
      color:      theme.primary,
      fontWeight: '700',
      fontSize:   13,
      minWidth:   24,
      paddingTop: 3,
      opacity:    0.8,
    },
    verseNumHighlight: {
      opacity: 1,
      fontSize: 14,
    },
    verseText: {
      flex:       1,
      color:      theme.text,
      fontSize:   17,       // equivalente: textSize = 20f (dp → sp ajustado)
      lineHeight: 28,       // equivalente: setLineSpacing(4f, 1.2f)
    },
    verseTextHighlight: {
      color:      theme.text,
      fontWeight: '500',
    },

    // Rodapé — equivalente: buttonBack + buttonGo
    footer: {
      flexDirection:     'row',
      alignItems:        'center',
      justifyContent:    'space-between',
      backgroundColor:   theme.surface,
      borderTopWidth:    1,
      borderTopColor:    theme.border,
      paddingHorizontal: 12,
      paddingVertical:   12,
      paddingBottom:     Platform.OS === 'android' ? 12 : 28,
    },
    footerBtn: {
      paddingHorizontal: 16,
      paddingVertical:   10,
      borderRadius:      8,
      backgroundColor:   theme.surfaceVariant,
      borderWidth:       1,
      borderColor:       theme.border,
    },
    footerBtnText: {
      color:      theme.primary,
      fontWeight: '700',
      fontSize:   14,
    },
    footerCenter: {
      alignItems: 'center',
    },
    footerChapter: {
      color:      theme.text,
      fontWeight: '700',
      fontSize:   15,
    },
    footerVersion: {
      color:    theme.textSecondary,
      fontSize: 11,
      marginTop: 2,
    },
  });
}