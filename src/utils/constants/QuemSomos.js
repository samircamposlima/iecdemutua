/**
 * CHURCH_DATA - Informações Institucionais (IEC de Mutua)
 * Centralização de dados para uso em: QuemSomosScreen, DoacaoScreen e Rodapés.
 */

export const CHURCH_DATA = {
  name: 'Igreja Evangélica Congregacional de Mutuá',
  email: 'iecdemutua@gmail.com',
  
  // Formato internacional para Linking.openURL(`tel:${phone}`)
  phone: '5521999999999', 
  
  // Formato amigável para exibição
  phoneFormatted: '(21) 99999-9999',
  
  // Endereço formatado para busca no Google Maps/Waze
  address: 'Rua Exemplo, 123 - Mutuá, São Gonçalo - RJ',
  zipCode: '24460-000',
  
  // Dados Financeiros / Doações
  pixKey: 'iecdemutua@gmail.com',
  pixType: 'E-mail',
  bankName: 'Banco Exemplo S.A.', // Opcional: Adicionar para facilitar transferências TED
};