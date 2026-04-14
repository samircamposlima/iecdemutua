import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet, StatusBar,
  Platform, BackHandler, TextInput,
} from 'react-native';
import { useAppTheme } from '../../themes'; // ajusta o caminho se necessário
import {
  getBooks, getChapters, getVerses, getBibleMetadata,
} from '../../services/BibleService';
import VersionSelector, { BIBLE_VERSIONS } from '../../components/bible/VersionSelector';

// Navegação interna: qual "tela" está ativa
const VIEW = { VERSION: 'version', BOOK: 'book', CHAPTER: 'chapter', READING: 'reading' };

export default function BibliaScreen() {
const theme = useAppTheme();
  const s = makeStyles(theme);

  // Estado de navegação
  const [view, setView]               = useState(VIEW.VERSION);
  const [version, setVersion]         = useState(null);
  const [versionMeta, setVersionMeta] = useState({});
  const [books, setBooks]             = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [chapters, setChapters]       = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [verses, setVerses]           = useState([]);
  const [loading, setLoading]         = useState(false);

  // Busca de versículos
  const [search, setSearch]           = useState('');

  // Botão voltar do Android
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (view === VIEW.READING)  { setView(VIEW.CHAPTER);  return true; }
      if (view === VIEW.CHAPTER)  { setView(VIEW.BOOK);     return true; }
      if (view === VIEW.BOOK)     { setView(VIEW.VERSION);  return true; }
      return false; // deixa o drawer/navigator tratar
    });
    return () => handler.remove();
  }, [view]);

  // ── Handlers de seleção ─────────────────────────────────────────────────

  const handleSelectVersion = useCallback(async (versionId) => {
    setLoading(true);
    setVersion(versionId);
    try {
      const [meta, bookList] = await Promise.all([
        getBibleMetadata(versionId),
        getBooks(versionId),
      ]);
      setVersionMeta(meta);
      setBooks(bookList);
      setView(VIEW.BOOK);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectBook = useCallback(async (book) => {
    setLoading(true);
    setSelectedBook(book);
    try {
      const chapterList = await getChapters(version, book.id);
      setChapters(chapterList);
      setView(VIEW.CHAPTER);
    } finally {
      setLoading(false);
    }
  }, [version]);

  const handleSelectChapter = useCallback(async (chapter) => {
    setLoading(true);
    setSelectedChapter(chapter);
    setSearch('');
    try {
      const verseList = await getVerses(version, selectedBook.id, chapter);
      setVerses(verseList);
      setView(VIEW.READING);
    } finally {
      setLoading(false);
    }
  }, [version, selectedBook]);

  // ── Cabeçalho de navegação ───────────────────────────────────────────────

  const renderHeader = () => {
    const crumbs = [];
    if (version) {
      const vLabel = BIBLE_VERSIONS.find(v => v.id === version)?.label ?? version;
      crumbs.push({ label: vLabel.split('—')[0].trim(), onPress: () => setView(VIEW.VERSION) });
    }
    if (selectedBook && view !== VIEW.BOOK) {
      crumbs.push({ label: selectedBook.short_name, onPress: () => setView(VIEW.BOOK) });
    }
    if (selectedChapter && view === VIEW.READING) {
      crumbs.push({ label: `Cap. ${selectedChapter}`, onPress: () => setView(VIEW.CHAPTER) });
    }

    return (
      <View style={s.header}>
        <Text style={s.headerTitle}>
          {view === VIEW.VERSION && 'Bíblia Sagrada'}
          {view === VIEW.BOOK    && 'Escolha o Livro'}
          {view === VIEW.CHAPTER && `${selectedBook?.name} — Capítulos`}
          {view === VIEW.READING && `${selectedBook?.short_name} ${selectedChapter}`}
        </Text>
        {crumbs.length > 0 && (
          <View style={s.breadcrumbs}>
            {crumbs.map((c, i) => (
              <React.Fragment key={i}>
                {i > 0 && <Text style={s.breadSep}>›</Text>}
                <TouchableOpacity onPress={c.onPress}>
                  <Text style={s.breadItem}>{c.label}</Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        )}
      </View>
    );
  };

  // ── Render das views ─────────────────────────────────────────────────────

  const renderVersionView = () => (
    <VersionSelector
      selectedVersion={version}
      onSelect={handleSelectVersion}
      theme={theme}
    />
  );

  const renderBookView = () => (
    <FlatList
      data={books}
      keyExtractor={b => String(b.id)}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[s.listItem, { borderBottomColor: theme.border }]}
          onPress={() => handleSelectBook(item)}
        >
          <Text style={[s.listItemText, { color: theme.text }]}>{item.name}</Text>
          <Text style={[s.listItemSub, { color: theme.textSecondary }]}>{item.short_name}</Text>
        </TouchableOpacity>
      )}
    />
  );

  const renderChapterView = () => (
    <FlatList
      data={chapters}
      keyExtractor={c => String(c)}
      numColumns={5}
      contentContainerStyle={s.chapterGrid}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[s.chapterBtn, { borderColor: theme.primary }]}
          onPress={() => handleSelectChapter(item)}
        >
          <Text style={[s.chapterNum, { color: theme.primary }]}>{item}</Text>
        </TouchableOpacity>
      )}
    />
  );

  const filteredVerses = search.trim()
    ? verses.filter(v => v.text.toLowerCase().includes(search.toLowerCase()))
    : verses;

  const renderReadingView = () => (
    <>
      <View style={[s.searchBar, { backgroundColor: theme.surface }]}>
        <TextInput
          style={[s.searchInput, { color: theme.text }]}
          placeholder="Buscar neste capítulo..."
          placeholderTextColor={theme.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: theme.textSecondary, fontSize: 18, paddingHorizontal: 8 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={filteredVerses}
        keyExtractor={v => String(v.verse)}
        contentContainerStyle={s.verseList}
        renderItem={({ item }) => (
          <View style={s.verseRow}>
            <Text style={[s.verseNum, { color: theme.primary }]}>{item.verse}</Text>
            <Text style={[s.verseText, { color: theme.text }]}>{item.text}</Text>
          </View>
        )}
      />
    </>
  );

  // ── Render principal ─────────────────────────────────────────────────────

  return (
    <View style={[s.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      {renderHeader()}
      {loading
        ? <ActivityIndicator size="large" color={theme.primary} style={s.loader} />
        : (
          <>
            {view === VIEW.VERSION && renderVersionView()}
            {view === VIEW.BOOK    && renderBookView()}
            {view === VIEW.CHAPTER && renderChapterView()}
            {view === VIEW.READING && renderReadingView()}
          </>
        )
      }
    </View>
  );
}

function makeStyles(theme) {
  return StyleSheet.create({
    container:    { flex: 1 },
    loader:       { flex: 1, justifyContent: 'center' },

    // Header
    header:       { paddingTop: Platform.OS === 'android' ? 12 : 48, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: theme.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
    headerTitle:  { fontSize: 20, fontWeight: '700', color: theme.text },
    breadcrumbs:  { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    breadItem:    { fontSize: 13, color: theme.primary },
    breadSep:     { fontSize: 13, color: theme.textSecondary, marginHorizontal: 4 },

    // Listas
    listItem:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth },
    listItemText: { fontSize: 16 },
    listItemSub:  { fontSize: 13 },

    // Grid de capítulos
    chapterGrid:  { padding: 12 },
    chapterBtn:   { flex: 1, margin: 6, aspectRatio: 1, borderWidth: 1, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    chapterNum:   { fontSize: 16, fontWeight: '600' },

    // Leitura
    searchBar:    { flexDirection: 'row', alignItems: 'center', marginHorizontal: 12, marginVertical: 8, borderRadius: 8, paddingHorizontal: 12 },
    searchInput:  { flex: 1, height: 40, fontSize: 15 },
    verseList:    { paddingHorizontal: 16, paddingBottom: 32 },
    verseRow:     { flexDirection: 'row', paddingVertical: 8 },
    verseNum:     { width: 32, fontSize: 12, fontWeight: '700', paddingTop: 3 },
    verseText:    { flex: 1, fontSize: 16, lineHeight: 26 },
  });
}