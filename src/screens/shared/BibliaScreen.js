/**
 * BibliaScreen.js — atualizado para BibleService assíncrono
 * Picker de versão sempre visível + livros → capítulos → versículos
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, StatusBar, Platform,
  ActivityIndicator, BackHandler,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAppTheme } from '../../themes';
import {
  useBible,
  //BIBLE_VERSIONS,
  TESTAMENT_FILTER,
} from '../../hooks/useBible';
import { getVerses } from '../../services/BibleService';
import { BIBLE_VERSIONS } from '../../constants/Bibles';

const VIEW = { BOOKS: 'books', CHAPTERS: 'chapters', VERSES: 'verses' };

export default function BibliaScreen() {
  const theme      = useAppTheme();
  const s          = makeStyles(theme);
  const navigation = useNavigation();

  const {
    version, selectVersion, metadata,
    books, loadingBooks, testamentFilter, setTestamentFilter,
    selectedBook, selectBook, chapters, loadingChapters,
    lastPosition, clearPosition,
  } = useBible();

  const [view, setView]                       = useState(VIEW.BOOKS);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [verses, setVerses]                   = useState([]);
  const [loadingVerses, setLoadingVerses]     = useState(false);

  // ─── Botão físico de voltar ───────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (view === VIEW.VERSES)   { setView(VIEW.CHAPTERS); return true; }
        if (view === VIEW.CHAPTERS) { setView(VIEW.BOOKS);    return true; }
        return false;
      });
      return () => sub.remove();
    }, [view])
  );

  // ─── Selecionar capítulo → carrega versículos ─────────────────────────────
  const handleSelectChapter = useCallback(async (chapter) => {
    setSelectedChapter(chapter);
    setLoadingVerses(true);
    try {
      const vss = await getVerses(version.file, selectedBook.id, chapter);
      setVerses(vss);
      setView(VIEW.VERSES);
    } catch (e) {
      console.error('handleSelectChapter:', e);
    } finally {
      setLoadingVerses(false);
    }
  }, [version, selectedBook]);

  // ─── Toca versículo → navega para ReadingScreen ───────────────────────────
  const handleSelectVerse = useCallback((verse) => {
    navigation.navigate('ReadingScreen', {
      versionFile: version.file,
      versionId:   version.id,
      bookId:      selectedBook.id,
      bookName:    selectedBook.name,
      shortName:   selectedBook.short_name,
      chapter:     selectedChapter,
      verse:       verse.verse,
    });
  }, [version, selectedBook, selectedChapter, navigation]);

  // ─── Continuar leitura ────────────────────────────────────────────────────
  const handleContinueReading = useCallback(() => {
    if (!lastPosition || !version) return;
    navigation.navigate('ReadingScreen', {
      versionFile: version.file,
      versionId:   version.id,
      bookId:      lastPosition.bookId,
      bookName:    lastPosition.bookName,
      shortName:   lastPosition.shortName,
      chapter:     lastPosition.chapter,
      verse:       lastPosition.verse,
    });
  }, [lastPosition, version, navigation]);

  function handleSelectBook(book) {
    selectBook(book);
    setView(VIEW.CHAPTERS);
  }

  function goBack() {
    if (view === VIEW.VERSES)   { setView(VIEW.CHAPTERS); return; }
    if (view === VIEW.CHAPTERS) { setView(VIEW.BOOKS);    return; }
  }

  function getHeaderTitle() {
    if (view === VIEW.CHAPTERS) return selectedBook?.name ?? '';
    if (view === VIEW.VERSES)   return `${selectedBook?.short_name} ${selectedChapter}`;
    return metadata?.name ?? version?.label ?? 'Bíblia';
  }

  // ─── Picker de versão ─────────────────────────────────────────────────────
  function renderVersionPicker() {
    return (
      <View style={s.pickerWrapper}>
        <Picker
          selectedValue={version?.id ?? 'NVI'}
          onValueChange={(val) => {
            const found = BIBLE_VERSIONS.find(v => v.id === val);
            if (found) selectVersion(found);
          }}
          style={s.picker}
          dropdownIconColor={theme.primary}
          mode="dropdown"
        >
          {BIBLE_VERSIONS.map(v => (
            <Picker.Item
              key={v.id}
              label={`${v.id} — ${v.label}`}
              value={v.id}
              color={theme.text}
              style={{ backgroundColor: theme.surface }}
            />
          ))}
        </Picker>
      </View>
    );
  }

  // ─── Filtro AT / NT / Todos ───────────────────────────────────────────────
  function renderTestamentFilter() {
    const filters = [
      { key: TESTAMENT_FILTER.ALL, label: 'Todos' },
      { key: TESTAMENT_FILTER.OLD, label: 'AT' },
      { key: TESTAMENT_FILTER.NEW, label: 'NT' },
    ];
    return (
      <View style={s.filterRow}>
        {filters.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[s.filterBtn, testamentFilter === f.key && s.filterBtnActive]}
            onPress={() => setTestamentFilter(f.key)}
          >
            <Text style={[s.filterLabel, testamentFilter === f.key && s.filterLabelActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  // ─── Banner continuar leitura ─────────────────────────────────────────────
  function renderContinueBanner() {
    if (!lastPosition || view !== VIEW.BOOKS) return null;
    return (
      <TouchableOpacity style={s.continueBanner} onPress={handleContinueReading}>
        <Text style={s.continueText}>
          📖 Continuar: {lastPosition.shortName} {lastPosition.chapter}
          {lastPosition.verse > 0 ? `:${lastPosition.verse}` : ''}
        </Text>
        <TouchableOpacity onPress={clearPosition} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={s.continueClear}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  // ─── Conteúdo principal ───────────────────────────────────────────────────
  function renderContent() {
    if (loadingBooks || loadingChapters || loadingVerses || !version) {
      return (
        <View style={s.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      );
    }

    if (view === VIEW.BOOKS) {
      return (
        <FlatList
          data={books}
          keyExtractor={item => String(item.id)}
          numColumns={3}
          contentContainerStyle={s.gridPad}
          columnWrapperStyle={s.columnGap}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.bookCard}
              onPress={() => handleSelectBook(item)}
              activeOpacity={0.75}
            >
              <Text style={s.bookShort}>{item.short_name}</Text>
              <Text style={s.bookName} numberOfLines={2}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      );
    }

    if (view === VIEW.CHAPTERS) {
      return (
        <FlatList
          data={chapters}
          keyExtractor={item => String(item)}
          numColumns={3}
          contentContainerStyle={s.gridPad}
          columnWrapperStyle={s.columnGap}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.chapterCard}
              onPress={() => handleSelectChapter(item)}
              activeOpacity={0.75}
            >
              <Text style={s.chapterNum}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      );
    }

    if (view === VIEW.VERSES) {
      return (
        <FlatList
          data={verses}
          keyExtractor={item => String(item.verse)}
          numColumns={3}
          contentContainerStyle={s.gridPad}
          columnWrapperStyle={s.columnGap}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.verseNumCard}
              onPress={() => handleSelectVerse(item)}
              activeOpacity={0.75}
            >
              <Text style={s.verseNumText}>{item.verse}</Text>
            </TouchableOpacity>
          )}
        />
      );
    }

    return null;
  }

  return (
    <View style={s.container}>
      <StatusBar backgroundColor={theme.headerBackground} barStyle="light-content" />

      <View style={s.header}>
        {view !== VIEW.BOOKS ? (
          <TouchableOpacity onPress={goBack} style={s.backBtn}>
            <Text style={s.backIcon}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={s.backBtn} />
        )}
        <Text style={s.headerTitle} numberOfLines={1}>{getHeaderTitle()}</Text>
      </View>

      {renderVersionPicker()}
      {view === VIEW.BOOKS && renderTestamentFilter()}
      {renderContinueBanner()}
      {renderContent()}
    </View>
  );
}

function makeStyles(theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: {
      flexDirection:     'row',
      alignItems:        'center',
      backgroundColor:   theme.headerBackground,
      paddingTop:        Platform.OS === 'android' ? StatusBar.currentHeight : 44,
      paddingHorizontal: 12,
      paddingBottom:     12,
      gap: 8,
    },
    backBtn:     { width: 32, alignItems: 'flex-start' },
    backIcon:    { color: theme.primary, fontSize: 22, fontWeight: 'bold' },
    headerTitle: { flex: 1, color: theme.headerText, fontSize: 18, fontWeight: '600' },
    pickerWrapper: {
      backgroundColor:   theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    picker: { color: theme.text, backgroundColor: theme.surface },
    filterRow: {
      flexDirection:     'row',
      paddingHorizontal: 12,
      paddingVertical:   8,
      gap: 8,
    },
    filterBtn: {
      flex: 1, paddingVertical: 8, borderRadius: 8,
      borderWidth: 1, borderColor: theme.border,
      alignItems: 'center', backgroundColor: theme.surface,
    },
    filterBtnActive:   { backgroundColor: theme.primary, borderColor: theme.primary },
    filterLabel:       { color: theme.textSecondary, fontWeight: '600', fontSize: 13 },
    filterLabelActive: { color: theme.textOnGold },
    continueBanner: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      marginHorizontal: 12, marginBottom: 8, padding: 12,
      borderRadius: 10, backgroundColor: theme.surfaceVariant,
      borderLeftWidth: 3, borderLeftColor: theme.primary,
    },
    continueText:  { color: theme.text, fontSize: 13, flex: 1 },
    continueClear: { color: theme.textSecondary, fontSize: 16, paddingLeft: 8 },
    center:        { flex: 1, justifyContent: 'center', alignItems: 'center' },
    gridPad:       { padding: 8 },
    columnGap:     { gap: 8 },
    bookCard: {
      flex: 1, backgroundColor: theme.surface, borderRadius: 10,
      borderWidth: 1, borderColor: theme.border, padding: 10,
      marginBottom: 8, alignItems: 'center', minHeight: 64, justifyContent: 'center',
    },
    bookShort:    { color: theme.primary, fontWeight: '700', fontSize: 14, marginBottom: 2 },
    bookName:     { color: theme.textSecondary, fontSize: 10, textAlign: 'center' },
    chapterCard: {
      flex: 1, aspectRatio: 1, backgroundColor: theme.surface,
      borderRadius: 8, borderWidth: 1, borderColor: theme.border,
      justifyContent: 'center', alignItems: 'center', marginBottom: 8,
    },
    chapterNum:   { color: theme.text, fontSize: 16, fontWeight: '600' },
    verseNumCard: {
      flex: 1, aspectRatio: 1, backgroundColor: theme.surface,
      borderRadius: 8, borderWidth: 1, borderColor: theme.border,
      justifyContent: 'center', alignItems: 'center', marginBottom: 8,
    },
    verseNumText: { color: theme.primary, fontSize: 15, fontWeight: '700' },
  });
}