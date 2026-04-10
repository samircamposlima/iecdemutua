// ─── TEMA — IEC de Mutua ───────────────────────────────────────────────────
// Paleta: Preto + Branco + Dourado
// Uso: import { useAppTheme } from '../themes';
//      const theme = useAppTheme();
//      <Text style={{ color: theme.text }}>
// ──────────────────────────────────────────────────────────────────────────

import { useColorScheme } from 'react-native';

// Tokens fixos — iguais no claro e no escuro
const gold = {
  primary:   '#C9A84C',   // dourado principal — botões, ícones ativos, destaques
  light:     '#E8D48B',   // dourado claro — hover, bordas suaves
  dark:      '#9A7B2F',   // dourado escuro — texto sobre fundo claro
};

const light = {
  // Fundos
  background:        '#F5F5F5',   // fundo de telas
  surface:           '#FFFFFF',   // cards, modais, drawers
  surfaceVariant:    '#EFEFEF',   // inputs, linhas alternadas

  // Textos
  text:              '#1A1A1A',   // texto principal
  textSecondary:     '#555555',   // subtítulos, labels
  textDisabled:      '#AAAAAA',   // placeholder, desabilitado
  textOnGold:        '#1A1A1A',   // texto sobre fundo dourado

  // Dourado
  ...gold,

  // Bordas e divisores
  border:            '#DDDDDD',
  divider:           '#E8E8E8',

  // Feedback
  error:             '#C0392B',
  success:           '#27AE60',
  warning:           '#F39C12',

  // Drawer / Header
  drawerBackground:  '#1A1A1A',   // gaveta sempre escura (contraste com o dourado)
  drawerText:        '#FFFFFF',
  drawerActive:      '#C9A84C',
  headerBackground:  '#1A1A1A',
  headerText:        '#FFFFFF',
};

const dark = {
  // Fundos
  background:        '#121212',
  surface:           '#1E1E1E',
  surfaceVariant:    '#2A2A2A',

  // Textos
  text:              '#F0F0F0',
  textSecondary:     '#AAAAAA',
  textDisabled:      '#555555',
  textOnGold:        '#1A1A1A',

  // Dourado (igual — é um token de marca, não muda com o tema)
  ...gold,

  // Bordas e divisores
  border:            '#333333',
  divider:           '#2A2A2A',

  // Feedback
  error:             '#E74C3C',
  success:           '#2ECC71',
  warning:           '#F1C40F',

  // Drawer / Header — mantém escuro nos dois modos
  drawerBackground:  '#0D0D0D',
  drawerText:        '#FFFFFF',
  drawerActive:      '#C9A84C',
  headerBackground:  '#0D0D0D',
  headerText:        '#FFFFFF',
};

// Hook — use em qualquer componente
export function useAppTheme() {
  const scheme = useColorScheme(); // 'light' | 'dark' | null
  return scheme === 'dark' ? dark : light;
}

// Exporta os objetos puros caso precise fora de componente
export const themes = { light, dark };

// Exporta o dourado separado — útil para StyleSheet estático
export { gold };