import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  SELECTED_VERSION: '@bible_selected_version',
  LAST_BOOK_ID:     '@bible_last_book_id',
  LAST_BOOK_NAME:   '@bible_last_book_name',
  LAST_SHORT_NAME:  '@bible_last_short_name',
  LAST_CHAPTER:     '@bible_last_chapter',
  LAST_VERSE:       '@bible_last_verse',
};

const DEFAULT_VERSION = 'NVI';

// ─── Versão Selecionada ──────────────────────────────────────────────────────

export async function getSelectedVersion() {
  try {
    const version = await AsyncStorage.getItem(KEYS.SELECTED_VERSION);
    return version ?? DEFAULT_VERSION;
  } catch {
    return DEFAULT_VERSION;
  }
}

export async function saveSelectedVersion(versionId) {
  if (!versionId) return;
  try {
    await AsyncStorage.setItem(KEYS.SELECTED_VERSION, String(versionId));
  } catch (_) {}
}

// ─── Posição de Leitura (Persistence Layer) ──────────────────────────────────

/**
 * Salva a posição atômica usando multiSet para garantir integridade.
 */
export async function saveReadingPosition({ bookId, bookName, shortName, chapter, verse = 0 }) {
  if (!bookId || !chapter) return;

  const data = [
    [KEYS.LAST_BOOK_ID,    String(bookId)],
    [KEYS.LAST_BOOK_NAME,  String(bookName)],
    [KEYS.LAST_SHORT_NAME, String(shortName)],
    [KEYS.LAST_CHAPTER,    String(chapter)],
    [KEYS.LAST_VERSE,      String(verse)],
  ];

  try {
    await AsyncStorage.multiSet(data);
  } catch (_) {}
}

/**
 * Recupera e valida a última posição. 
 * Retorna null se os dados essenciais (book/chapter) forem matematicamente inválidos.
 */
export async function getReadingPosition() {
  try {
    const keysToFetch = [
      KEYS.LAST_BOOK_ID,
      KEYS.LAST_BOOK_NAME,
      KEYS.LAST_SHORT_NAME,
      KEYS.LAST_CHAPTER,
      KEYS.LAST_VERSE,
    ];

    const pairs = await AsyncStorage.multiGet(keysToFetch);
    const map = Object.fromEntries(pairs);

    // Conversão e validação numérica direta
    const bookId  = Number(map[KEYS.LAST_BOOK_ID]);
    const chapter = Number(map[KEYS.LAST_CHAPTER]);
    const verse   = Number(map[KEYS.LAST_VERSE] || 0);

    // Validação de integridade: 0 ou NaN são considerados inválidos aqui
    if (!bookId || !chapter) {
      return null;
    }

    return {
      bookId,
      chapter,
      verse,
      bookName:  map[KEYS.LAST_BOOK_NAME]  || '',
      shortName: map[KEYS.LAST_SHORT_NAME] || '',
    };
  } catch {
    return null;
  }
}

export async function clearReadingPosition() {
  try {
    await AsyncStorage.multiRemove(Object.values(KEYS).filter(k => k !== KEYS.SELECTED_VERSION));
  } catch (_) {}
}