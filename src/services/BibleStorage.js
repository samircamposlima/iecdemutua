/**
 * BibleStorage.js
 * Equivalente a:
 *   - BibleReadingPreferencesRepository (DataStore → AsyncStorage)
 *   - BibleVersionRepository (SharedPreferences → AsyncStorage)
 *
 * Persiste: versão selecionada + última posição de leitura
 */

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

// ─── Versão selecionada ───────────────────────────────────────────────────────

export async function getSelectedVersion() {
  try {
    return (await AsyncStorage.getItem(KEYS.SELECTED_VERSION)) ?? DEFAULT_VERSION;
  } catch {
    return DEFAULT_VERSION;
  }
}

export async function saveSelectedVersion(versionId) {
  try {
    await AsyncStorage.setItem(KEYS.SELECTED_VERSION, versionId);
  } catch (_) {}
}

// ─── Posição de leitura ───────────────────────────────────────────────────────
// Equivalente: BibleReadingPreferencesRepository.ReadingPosition

export async function saveReadingPosition({ bookId, bookName, shortName, chapter, verse = 0 }) {
  try {
    await AsyncStorage.multiSet([
      [KEYS.LAST_BOOK_ID,    String(bookId)],
      [KEYS.LAST_BOOK_NAME,  bookName],
      [KEYS.LAST_SHORT_NAME, shortName],
      [KEYS.LAST_CHAPTER,    String(chapter)],
      [KEYS.LAST_VERSE,      String(verse)],
    ]);
  } catch (_) {}
}

export async function getReadingPosition() {
  try {
    const pairs = await AsyncStorage.multiGet([
      KEYS.LAST_BOOK_ID,
      KEYS.LAST_BOOK_NAME,
      KEYS.LAST_SHORT_NAME,
      KEYS.LAST_CHAPTER,
      KEYS.LAST_VERSE,
    ]);
    const map = Object.fromEntries(pairs);
    const bookId  = parseInt(map[KEYS.LAST_BOOK_ID]  ?? '0', 10);
    const chapter = parseInt(map[KEYS.LAST_CHAPTER]   ?? '0', 10);

    if (!bookId || !chapter) return null; // isValid() === false

    return {
      bookId,
      bookName:  map[KEYS.LAST_BOOK_NAME]  ?? '',
      shortName: map[KEYS.LAST_SHORT_NAME] ?? '',
      chapter,
      verse: parseInt(map[KEYS.LAST_VERSE] ?? '0', 10),
    };
  } catch {
    return null;
  }
}

export async function clearReadingPosition() {
  try {
    await AsyncStorage.multiRemove([
      KEYS.LAST_BOOK_ID,
      KEYS.LAST_BOOK_NAME,
      KEYS.LAST_SHORT_NAME,
      KEYS.LAST_CHAPTER,
      KEYS.LAST_VERSE,
    ]);
  } catch (_) {}
}