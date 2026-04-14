import { open } from '@op-engineering/op-sqlite';

// Cache de conexões abertas — evita reabrir o mesmo banco
const openDatabases = {};

/**
 * Abre (ou reutiliza) a conexão com o banco da versão selecionada.
 * Os arquivos ficam em android/app/src/main/assets/bibles/
 */
function getDb(version) {
  if (!openDatabases[version]) {
    openDatabases[version] = open({
      name: version,           // ex: "nvi.sqlite"
      location: 'bibles',     // subpasta dentro de assets/
    });
  }
  return openDatabases[version];
}

/** Lista os metadados da versão (nome, copyright) */
export async function getBibleMetadata(version) {
  const db = getDb(version);
  const result = db.execute('SELECT key, value FROM metadata');
  const meta = {};
  for (const row of result.rows._array) {
    meta[row.key] = row.value;
  }
  return meta;
}

/** Retorna os dois testamentos */
export async function getTestaments(version) {
  const db = getDb(version);
  const result = db.execute('SELECT id, name FROM testament ORDER BY id');
  return result.rows._array;
}

/** Retorna todos os 66 livros */
export async function getBooks(version) {
  const db = getDb(version);
  const result = db.execute(
    'SELECT id, name, short_name, testament_reference_id FROM book ORDER BY id'
  );
  return result.rows._array;
}

/** Retorna a lista de capítulos disponíveis para um livro */
export async function getChapters(version, bookId) {
  const db = getDb(version);
  const result = db.execute(
    'SELECT DISTINCT chapter FROM verse WHERE book_id = ? ORDER BY chapter',
    [bookId]
  );
  return result.rows._array.map(r => r.chapter);
}

/** Retorna todos os versículos de um capítulo */
export async function getVerses(version, bookId, chapter) {
  const db = getDb(version);
  const result = db.execute(
    'SELECT verse, text FROM verse WHERE book_id = ? AND chapter = ? ORDER BY verse',
    [bookId, chapter]
  );
  return result.rows._array;
}

/** Fecha todas as conexões (chama no unmount se necessário) */
export function closeAllDatabases() {
  for (const key of Object.keys(openDatabases)) {
    openDatabases[key].close();
    delete openDatabases[key];
  }
}