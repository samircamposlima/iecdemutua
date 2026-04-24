import { open, moveAssetsDatabase } from '@op-engineering/op-sqlite';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

const connections = {}; // { versionFile: db }
const pending = {};     // { versionFile: Promise }

let db = null;
let currentVersion = null;
let openingPromise = null

/**
 * 1. Função de Abertura (O Pulo do Gato)
 * Gerencia a cópia dos assets e a conexão com o SQLite
 */
export const openBible = async (versionFile) => {
  // Já tem conexão aberta
  if (connections[versionFile]) return connections[versionFile];

  // Já tem abertura em curso para essa versão
  if (pending[versionFile]) return pending[versionFile];

  // Cria a Promise e registra antes de qualquer await
  pending[versionFile] = (async () => {
    try {
      if (Platform.OS === 'android') {
        await moveAssetsDatabase({
          filename: versionFile,
          path: 'bibles',
          overwrite: false,
        });
      }

      const db = open({ name: versionFile });
      connections[versionFile] = db;

      // DEBUG
      try {
        const result =  await db.execute("SELECT name FROM sqlite_master WHERE type='table'");
        console.log('[DEBUG FULL]', JSON.stringify(result));
      } catch (e) {
        console.log('[DEBUG ERROR]', e.message);
      }

      return db;
    } catch (error) {
      console.error('[Database Erro]', error);
      throw error;
    } finally {
      delete pending[versionFile];
    }
  })();

  return pending[versionFile];
};

/**
 * 2. Fechamento
 */
export function closeBible(versionFile) {
  if (versionFile && connections[versionFile]) {
    try { connections[versionFile].close(); } catch (_) {}
    delete connections[versionFile];
  }
}

/**
 * 3. Consultas (Metadata, Livros, Capítulos e Versículos)
 */
export async function getBibleMetadata(versionFile) {
  try {
    const database = await openBible(versionFile);
    const result = await database.execute('SELECT key, value FROM metadata');
    const meta = {};
    const rows = result?.rows?._array || result?.rows || [];
    console.log(`[DEBUG] Itens encontrados: ${rows.length}`);
    rows.forEach(row => {
      meta[row.key] = row.value;
    });
    return meta;
  } catch (e) {
    console.error('getBibleMetadata:', e.message);
    return { name: 'Bíblia', version: versionFile };
  }
}

export async function getBooks(versionFile) {
  try {
    const database = await openBible(versionFile);
    const result =  await database.execute(
      'SELECT id, book_reference_id, testament_reference_id, name, short_name FROM book ORDER BY book_reference_id'
    );
    return result.rows?._array ?? result.rows ?? [];
  } catch (e) {
    console.error('getBooks:', e.message);
    return [];
  }
}

export async function getBooksByTestament(versionFile, testamentId) {
  try {
    const database = await openBible(versionFile);
    const result = await database.execute(
      'SELECT id, book_reference_id, testament_reference_id, name, short_name FROM book WHERE testament_reference_id = ? ORDER BY book_reference_id',
      [testamentId]
    );
    return result.rows?._array ?? result.rows ?? [];
  } catch (e) {
    console.error('getBooksByTestament:', e.message);
    return [];
  }
}

export async function getBookById(versionFile, bookId) {
  try {
    const database = await openBible(versionFile);
    const result = await database.execute(
      'SELECT id, book_reference_id, testament_reference_id, name, short_name FROM book WHERE id = ?',
      [bookId]
    );
    const rows = result?.rows?._array || result?.rows || [];
    console.log(`[DEBUG] Itens encontrados: ${rows.length}`);
    return rows[0] ?? null;
  } catch (e) {
    console.error('getBookById:', e.message);
    return null;
  }
}

export async function getMaxChapter(versionFile, bookId) {
  try {
    const database = await openBible(versionFile);
    const result = await database.execute(
      'SELECT MAX(chapter) as total FROM verse WHERE book_id = ?',
      [bookId]
    );
    const rows = result?.rows?._array || result?.rows || [];
    console.log(`[DEBUG] Itens encontrados: ${rows.length}`);
    return rows[0]?.total ?? 1;
  } catch (e) {
    console.error('getMaxChapter:', e.message);
    return 1;
  }
}

export async function getChapters(versionFile, bookId) {
  const total = await getMaxChapter(versionFile, bookId);
  return Array.from({ length: total }, (_, i) => i + 1);
}

export async function getVerses(versionFile, bookId, chapter) {
  try {
    const database = await openBible(versionFile);
    const result = await database.execute(
      'SELECT id, verse, text FROM verse WHERE book_id = ? AND chapter = ? ORDER BY verse',
      [bookId, chapter]
    );
    return result.rows?._array ?? result.rows ?? [];
  } catch (e) {
    console.error('getVerses:', e.message);
    return [];
  }
}

/**
 * 4. Navegação
 */
export async function getPreviousChapter(versionFile, bookId, currentChapter) {
  if (currentChapter > 1) {
    const book = await getBookById(versionFile, bookId);
    return book
      ? { bookId, bookName: book.name, shortName: book.short_name, chapter: currentChapter - 1 }
      : null;
  }

  const allBooks = await getBooks(versionFile);
  const currentIndex = allBooks.findIndex(b => b.id === bookId);
  if (currentIndex <= 0) return null;

  const prevBook = allBooks[currentIndex - 1];
  const lastChapter = await getMaxChapter(versionFile, prevBook.id);

  return {
    bookId: prevBook.id,
    bookName: prevBook.name,
    shortName: prevBook.short_name,
    chapter: lastChapter,
  };
}

export async function getNextChapter(versionFile, bookId, currentChapter) {
  const maxChapter = await getMaxChapter(versionFile, bookId);

  if (currentChapter < maxChapter) {
    const book = await getBookById(versionFile, bookId);
    return book
      ? { bookId, bookName: book.name, shortName: book.short_name, chapter: currentChapter + 1 }
      : null;
  }

  const allBooks = await getBooks(versionFile);
  const currentIndex = allBooks.findIndex(b => b.id === bookId);
  if (currentIndex < 0 || currentIndex >= allBooks.length - 1) return null;

  const nextBook = allBooks[currentIndex + 1];
  return {
    bookId: nextBook.id,
    bookName: nextBook.name,
    shortName: nextBook.short_name,
    chapter: 1,
  };
}