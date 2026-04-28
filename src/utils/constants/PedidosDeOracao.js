/**
 * CONFIGURAÇÕES GLOBAIS - IEC DE MUTUÁ
 * Centralização de regras de negócio, contatos e metadados.
 */

// 1. Dados Institucionais
export const CHURCH_DATA = {
  name: 'Igreja Evangélica Congregacional de Mutuá',
  email: 'iecdemutua@gmail.com',
  phone: '5521999999999', 
  phoneFormatted: '(21) 99999-9999',
  address: 'Rua Exemplo, 123 - Mutuá, São Gonçalo - RJ',
  zipCode: '24460-000',
  pixKey: 'iecdemutua@gmail.com',
};

// 2. Canais de Comunicação Específicos
export const CONTACT_CHANNELS = {
  WHATSAPP_NUMBER: '5521999999999', // Ajustado para o DDD 21 conforme CHURCH_DATA
  PRAYER_EMAIL: 'oracao@iecdemutua.org.br',
};

// 3. Regras para Pedidos de Oração (Dicionários Matemáticos)
export const PRAYER_CATEGORIES = [
  'Saúde',
  'Família',
  'Finanças',
  'Relacionamento',
  'Trabalho / Emprego',
  'Crianças / Filhos',
  'Cura de Vícios',
  'Vida Espiritual',
  'Outros'
];

export const PRAYER_STATUS = {
  PENDING: 'pending',  // Aguardando processamento
  SENT: 'sent',        // Enviado para a equipe de intercessão
  ARCHIVED: 'archived' // Finalizado/Arquivado
};