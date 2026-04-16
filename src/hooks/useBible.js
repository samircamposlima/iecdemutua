/**
 * useBible.js — atualizado para BibleService assíncrono
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getBooks,
  getBooksByTestament,
  getChapters,
  getBibleMetadata,
} from '../services/BibleService';
import {
  getSelectedVersion,
  saveSelectedVersion,
  getReadingPosition,
  saveReadingPosition,
  clearReadingPosition,
} from '../services/BibleStorage';
import { BIBLE_VERSIONS } from '../constants/Bibles';

export const TESTAMENT_FILTER = { ALL: 'all', OLD: 'old', NEW: 'new' };

export function useBible() {
  const [version, setVersionState]         = useState(null); // null até carregar do storage
  const [metadata, setMetadata]            = useState(null);
  const [books, setBooks]                  = useState([]);
  const [testamentFilter, setTestamentFilter] = useState(TESTAMENT_FILTER.ALL);
  const [loadingBooks, setLoadingBooks]    = useState(false);
  const [chapters, setChapters]            = useState([]);
  const [selectedBook, setSelectedBook]    = useState(null);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [lastPosition, setLastPosition]    = useState(null);

  // ─── Init: carrega versão salva + posição ─────────────────────────────────
  useEffect(() => {
    async function init() {
      const savedId = await getSelectedVersion();
      const found = BIBLE_VERSIONS.find(v => v.id === savedId) ?? BIBLE_VERSIONS[0];
      setVersionState(found);

      const pos = await getReadingPosition();
      setLastPosition(pos);
    }
    init();
  }, []);

  // ─── Carrega livros quando versão ou filtro muda ──────────────────────────
 useEffect(() => {
  if (!version) return;

  async function load() {
    setLoadingBooks(true);
    try {
      let list;
      if (testamentFilter === TESTAMENT_FILTER.OLD) {
        list = await getBooksByTestament(version.file, 1);
      } else if (testamentFilter === TESTAMENT_FILTER.NEW) {
        list = await getBooksByTestament(version.file, 2);
      } else {
        list = await getBooks(version.file);
      }
      const meta = await getBibleMetadata(version.file);
      setMetadata(meta);
      setBooks(list);
    } catch (e) {
      console.error('useBible.loadBooks:', e);
      setBooks([]);
    } finally {
      setLoadingBooks(false);
    }
  }

  load();
}, [version, testamentFilter]); // sem dependência de loadBooks

  const selectVersion = useCallback(async (v) => {
    setVersionState(v);
    setBooks([]); // limpa lista enquanto carrega nova versão
    await saveSelectedVersion(v.id);
  }, []);

  const selectBook = useCallback(async (book) => {
    setSelectedBook(book);
    setLoadingChapters(true);
    try {
      const chaps = await getChapters(version.file, book.id);
      setChapters(chaps);
    } catch (e) {
      console.error('useBible.selectBook:', e);
      setChapters([]);
    } finally {
      setLoadingChapters(false);
    }
  }, [version]);

  const persistPosition = useCallback(async (pos) => {
    await saveReadingPosition(pos);
    setLastPosition(pos);
  }, []);

  const clearPosition = useCallback(async () => {
    await clearReadingPosition();
    setLastPosition(null);
  }, []);

  return {
    version,
    selectVersion,
    metadata,
    books,
    loadingBooks,
    testamentFilter,
    setTestamentFilter,
    selectedBook,
    selectBook,
    chapters,
    loadingChapters,
    lastPosition,
    persistPosition,
    clearPosition,
  };
}