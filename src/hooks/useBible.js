/**
 * useBible.js
 * Hook customizado para encapsular a lógica de negócio da Bíblia.
 * Gerencia o estado da versão selecionada, navegação de livros e persistência de leitura.
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
import { BIBLE_VERSIONS } from '../utils/constants/Bibles';

// Filtros de testamento para abstrair IDs mágicos do banco de dados
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

  /**
   * Inicialização: Recupera a preferência do usuário e a última posição de leitura
   * armazenadas no AsyncStorage ao montar o componente.
   */
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

  /**
   * Efeito de Carregamento: Disparado sempre que a versão da bíblia ou o filtro
   * de testamento é alterado. Sincroniza o estado local com o SQLite.
   */
 useEffect(() => {
  if (!version) return;

  async function load() {
    setLoadingBooks(true);
    try {
      let list;
        // Lógica de filtragem delegada à camada de serviço (SQLite)
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

  /**
   * Altera a versão ativa e persiste a escolha para futuras sessões.
   */
  const selectVersion = useCallback(async (v) => {
    setVersionState(v);
    setBooks([]); // limpa lista enquanto carrega nova versão
    await saveSelectedVersion(v.id);
  }, []);

  /**
   * Seleciona um livro e busca seus respectivos capítulos no SQLite.
   */
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

  /**
   * Persiste a posição exata da leitura (Livro, Capítulo, Versículo).
   */
  const persistPosition = useCallback(async (pos) => {
    await saveReadingPosition(pos);
    setLastPosition(pos);
  }, []);

  /**
   * Remove o marcador de última leitura.
   */
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