import { useColorScheme } from 'react-native';

/**
 * Tokens de Marca (Fixos)
 * O dourado é a identidade visual e não sofre inversão de cor.
 */
const gold = {
  primary:   '#C9A84C',   // Dourado institucional
  light:     '#E8D48B',   // Destaques sutis / Bordas
  dark:      '#9A7B2F',   // Variável para melhor legibilidade sobre claros
  goldTransparent: 'rgba(201, 168, 76, 0.15)', // Para highlights de versículos
};

const light = {
  // Fundos
  background:      '#F5F5F5',
  surface:         '#FFFFFF',
  surfaceVariant:  '#EFEFEF',

  // Textos
  text:            '#1A1A1A',
  textSecondary:   '#555555',
  textDisabled:    '#AAAAAA',
  textOnGold:      '#000000',

  // Paleta de Marca
  ...gold,

  // Estrutura
  border:          '#DDDDDD',
  divider:         '#E8E8E8',

  // Feedback (Ajustado para contraste em fundo claro)
  error:             '#C0392B',
  success:           '#27AE60',
  warning:           '#F39C12',

  // Layout — Gaveta e Topo mantêm identidade sóbria
  drawerBackground:  '#1A1A1A',
  drawerText:        '#FFFFFF',
  drawerActive:      '#C9A84C',
  headerBackground:  '#1A1A1A',
  headerText:        '#FFFFFF',
};

const dark = {
  // Fundos
  background:      '#121212',
  surface:         '#1E1E1E',
  surfaceVariant:  '#2A2A2A',

  // Textos
  text:            '#F0F0F0',
  textSecondary:   '#AAAAAA',
  textDisabled:    '#555555',
  textOnGold:      '#000000',

  // Paleta de Marca
  ...gold,

  // Estrutura
  border:          '#333333',
  divider:         '#2A2A2A',

  // Feedback (Ajustado para brilho em fundo escuro)
  error:             '#E74C3C',
  success:           '#2ECC71',
  warning:           '#F1C40F',

  // Layout — Intensifica o preto para profundidade (OLED)
  drawerBackground:  '#0D0D0D',
  drawerText:        '#FFFFFF',
  drawerActive:      '#C9A84C',
  headerBackground:  '#0D0D0D',
  headerText:        '#FFFFFF',
};

/**
 * Hook customizado para acesso dinâmico ao tema.
 * Implementa a lógica matemática de seleção baseada no esquema do sistema.
 */
export function useAppTheme() {
  const scheme = useColorScheme(); 
  return scheme === 'dark' ? dark : light;
}

export const themes = { light, dark };
export { gold };