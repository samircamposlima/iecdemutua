import { open, moveAssetsDatabase } from '@op-engineering/op-sqlite';
import { Platform } from 'react-native';

const connections = {}; // Cache de conexões abertas
const pending = {};     // Controle de Promises de abertura concorrente

/**
 * 1. Gerenciamento de Conexão
 * Garante que múltiplos componentes chamando a mesma versão não criem múltiplas cópias/conexões.
 */
export const openBible = async (versionFile) => {
  if (connections[versionFile]) return connections[versionFile];
  if (pending[versionFile]) return pending[versionFile];

  pending[versionFile] = (async () => {
    try {
      if (Platform.OS === 'android') {
        // Garante que o banco está no lugar certo antes de abrir
        await moveAssetsDatabase({
          filename: versionFile,
          path: 'bibles',
          overwrite: false,
        });
      }

      const dbConnection = open({ name: versionFile });
      connections[versionFile] = dbConnection;
      return dbConnection;
    } catch (error) {
      throw error;
    } finally {
      delete pending[versionFile];
    }
  })();

  return pending[versionFile];
};

export function closeBible(versionFile) {
  if (versionFile && connections[versionFile]) {
    try {
      connections[versionFile].close();
    } catch (_) {}
    delete connections[versionFile];
  }
}

/**
 * Helper para extração segura de linhas (op-sqlite)
 */
const getRows = (result) => result?.rows?._array ?? result?.rows ?? [];

/**
 * 2. Consultas de Metadados e Estrutura
 */
export async function getBibleMetadata(versionFile) {
  try {
    const db = await openBible(versionFile);
    const result = await db.execute('SELECT key, value FROM metadata');
    const meta = {};
    
    getRows(result).forEach(row => {
      meta[row.key] = row.value;
    });
    return meta;
  } catch (e) {
    return { name: 'Bíblia', version: versionFile };
  }
}

export async function getBooks(versionFile) {
  try {
    const db = await openBible(versionFile);
    const result = await db.execute(
      'SELECT id, book_reference_id, testament_reference_id, name, short_name FROM book ORDER BY book_reference_id'
    );
    return getRows(result);
  } catch (e) {
    return [];
  }
}

export async function getBookById(versionFile, bookId) {
  try {
    const db = await openBible(versionFile);
    const result = await db.execute(
      'SELECT id, book_reference_id, testament_reference_id, name, short_name FROM book WHERE id = ?',
      [bookId]
    );
    return getRows(result)[0] ?? null;
  } catch (e) {
    return null;
  }
}

/**
 * 3. Lógica de Capítulos e Versículos
 */
export async function getMaxChapter(versionFile, bookId) {
  try {
    const db = await openBible(versionFile);
    const result = await db.execute(
      'SELECT MAX(chapter) as total FROM verse WHERE book_id = ?',
      [bookId]
    );
    return getRows(result)[0]?.total ?? 1;
  } catch (e) {
    return 1;
  }
}

export async function getVerses(versionFile, bookId, chapter) {
  try {
    const db = await openBible(versionFile);
    const result = await db.execute(
      'SELECT id, verse, text FROM verse WHERE book_id = ? AND chapter = ? ORDER BY verse',
      [bookId, chapter]
    );
    return getRows(result);
  } catch (e) {
    return [];
  }
}

/**
 * 4. Navegação Matemática (Pulo de Livros/Capítulos)
 */
export async function getPreviousChapter(versionFile, bookId, currentChapter) {
  if (currentChapter > 1) {
    const book = await getBookById(versionFile, bookId);
    return book ? { 
      bookId, 
      bookName: book.name, 
      shortName: book.short_name, 
      chapter: currentChapter - 1 
    } : null;
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
    return book ? { 
      bookId, 
      bookName: book.name, 
      shortName: book.short_name, 
      chapter: currentChapter + 1 
    } : null;
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
export async function getChapters(versionFile, bookId) {
  try {
    const db = await openBible(versionFile);
    const result = await db.execute(
      'SELECT DISTINCT chapter FROM verse WHERE book_id = ? ORDER BY chapter',
      [bookId]
    );
    return getRows(result).map(row => row.chapter);
  } catch (e) {
    return [];
  }
}

export async function getBooksByTestament(versionFile, testamentId) {
  try {
    const db = await openBible(versionFile);
    const result = await db.execute(
      'SELECT id, book_reference_id, testament_reference_id, name, short_name FROM book WHERE testament_reference_id = ? ORDER BY book_reference_id',
      [testamentId]
    );
    return getRows(result);
  } catch (e) {
    return [];
  }
}
