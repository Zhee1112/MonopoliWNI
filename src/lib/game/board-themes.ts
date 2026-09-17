// ============================================================
// BOARD THEMES - MonopoliWNI
// ============================================================

export type BoardThemeId = 'default' | 'colorful' | 'getrich';

export interface BoardTheme {
  id: BoardThemeId;
  name: string;
  description: string;
  preview: string; // emoji for preview
  
  // Board background
  boardBg: string;
  boardBorder: string;
  
  // Cell backgrounds
  cellBg: string;
  cellHoverBg: string;
  cellBorder: string;
  
  // Corner cells
  startBg: string;
  startBorder: string;
  startText: string;
  jailBg: string;
  jailBorder: string;
  freeParkingBg: string;
  freeParkingBorder: string;
  
  // Center
  centerBg: string;
  centerBorder: string;
  
  // Text colors
  titleText: string;
  subtitleText: string;
  nameText: string;
  priceText: string;
  
  // Property group colors (override groupColor)
  groupColors?: Record<string, string>;
  
  // Special elements
  cornerText: string;
}

export const BOARD_THEMES: Record<BoardThemeId, BoardTheme> = {
  default: {
    id: 'default',
    name: 'Default',
    description: 'Tema gelap klasik Monopoli WNI',
    preview: '\u{1F33F}',
    boardBg: '#001206',
    boardBorder: '#203a29',
    cellBg: '#052011',
    cellHoverBg: '#152f1f',
    cellBorder: '#203a29',
    startBg: '#152f1f',
    startBorder: '#ffd56d60',
    startText: '#ffd56d',
    jailBg: '#2b1013',
    jailBorder: '#ff6b6b50',
    freeParkingBg: '#152f1f',
    freeParkingBorder: '#203a29',
    centerBg: '#092515',
    centerBorder: '#203a2960',
    titleText: '#e4e4e7',
    subtitleText: '#d1c5af',
    nameText: '#cbead1',
    priceText: '#ffd56d',
    cornerText: '#cbead1',
  },
  colorful: {
    id: 'colorful',
    name: 'Colorful',
    description: 'Warna cerah seperti Monopoli tradisional',
    preview: '\u{1F3A8}',
    boardBg: '#1a1a2e',
    boardBorder: '#e94560',
    cellBg: '#16213e',
    cellHoverBg: '#1a1a2e',
    cellBorder: '#e9456040',
    startBg: '#0f3460',
    startBorder: '#e94560',
    startText: '#e94560',
    jailBg: '#533483',
    jailBorder: '#e94560',
    freeParkingBg: '#0f3460',
    freeParkingBorder: '#53d8fb',
    centerBg: '#16213e',
    centerBorder: '#e9456060',
    titleText: '#ffffff',
    subtitleText: '#b8c1ec',
    nameText: '#ffffff',
    priceText: '#ffd700',
    cornerText: '#ffffff',
    groupColors: {
      '#8B4513': '#A0522D',
      '#00CED1': '#00CED1',
      '#FFD700': '#FFD700',
      '#FF8C00': '#FF8C00',
      '#DC143C': '#DC143C',
      '#228B22': '#32CD32',
      '#800080': '#9932CC',
      '#4682B4': '#4169E1',
      '#ff6b6b': '#FF4444',
      '#4edea3': '#00FF88',
      '#0ea5e9': '#00BFFF',
      '#eab308': '#FFD700',
      '#f97316': '#FF6347',
      '#ef4444': '#FF0000',
      '#22c55e': '#00FF7F',
      '#6366f1': '#8A2BE2',
      '#ffcec9': '#FFB6C1',
      '#d1c5af': '#DEB887',
      '#ffd56d': '#FFD700',
    },
  },
  getrich: {
    id: 'getrich',
    name: 'GetRich',
    description: 'Minimalis ala LINE GetRich',
    preview: '\u{1F48E}',
    boardBg: '#0a0a1a',
    boardBorder: '#4a90d9',
    cellBg: '#12122a',
    cellHoverBg: '#1a1a3a',
    cellBorder: '#4a90d940',
    startBg: '#1a2a4a',
    startBorder: '#4a90d9',
    startText: '#4a90d9',
    jailBg: '#2a1a2a',
    jailBorder: '#d94a60',
    freeParkingBg: '#1a2a4a',
    freeParkingBorder: '#4ad9b0',
    centerBg: '#12122a',
    centerBorder: '#4a90d960',
    titleText: '#e8e8f0',
    subtitleText: '#8888aa',
    nameText: '#d0d0e8',
    priceText: '#ffd700',
    cornerText: '#d0d0e8',
    groupColors: {
      '#8B4513': '#a07040',
      '#00CED1': '#40d0d0',
      '#FFD700': '#d0c040',
      '#FF8C00': '#d08040',
      '#DC143C': '#d04050',
      '#228B22': '#40a060',
      '#800080': '#8040a0',
      '#4682B4': '#4080b0',
      '#ff6b6b': '#c05050',
      '#4edea3': '#50c090',
      '#0ea5e9': '#5090c0',
      '#eab308': '#c0b040',
      '#f97316': '#c07040',
      '#ef4444': '#c04040',
      '#22c55e': '#50a060',
      '#6366f1': '#7060b0',
      '#ffcec9': '#c0a0a0',
      '#d1c5af': '#a0a090',
      '#ffd56d': '#c0b060',
    },
  },
};
