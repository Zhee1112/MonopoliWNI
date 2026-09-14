export interface EvidenceItem {
  id: string;
  name: string;
  description: string;
  bonusModifier: number;
  bonusType: 'persuasi' | 'pertahanan' | 'kelicinan';
  emoji: string;
}

export const EVIDENCE_CATALOG: Record<string, EvidenceItem> = {
  kwitansi_pajak: {
    id: 'kwitansi_pajak',
    name: 'Kwitansi Setoran Pajak Resmi',
    description: '+1 Pertahanan DC / Pembuktian Sah',
    bonusModifier: 1,
    bonusType: 'pertahanan',
    emoji: '🧾',
  },
  rekaman_oknum: {
    id: 'rekaman_oknum',
    name: 'Rekaman Obrolan Oknum',
    description: '+2 Persuasi (Membutuhkan Pengacara)',
    bonusModifier: 2,
    bonusType: 'persuasi',
    emoji: '🎙️',
  },
  mutasi_rekening: {
    id: 'mutasi_rekening',
    name: 'Mutasi Rekening Bersih',
    description: '+1 Skor Kelicinan',
    bonusModifier: 1,
    bonusType: 'kelicinan',
    emoji: '💳',
  },
  screenshot_viral: {
    id: 'screenshot_viral',
    name: 'Screenshot Viral',
    description: '+2 Pertahanan DC',
    bonusModifier: 2,
    bonusType: 'pertahanan',
    emoji: '📸',
  },
  saksi_mata: {
    id: 'saksi_mata',
    name: 'Saksi Mata Terpercaya',
    description: '+3 Persuasi',
    bonusModifier: 3,
    bonusType: 'persuasi',
    emoji: '👁️',
  },
  dokumen_resmi: {
    id: 'dokumen_resmi',
    name: 'Dokumen Resmi Terverifikasi',
    description: '+4 Pertahanan DC',
    bonusModifier: 4,
    bonusType: 'pertahanan',
    emoji: '📋',
  },
  rekening_koran: {
    id: 'rekening_koran',
    name: 'Rekening Koran Lengkap',
    description: '+5 Skor Kelicinan',
    bonusModifier: 5,
    bonusType: 'kelicinan',
    emoji: '🏦',
  },
  bukti_viral: {
    id: 'bukti_viral',
    name: 'Bukti Viral Media Sosial',
    description: '+3 Pertahanan DC / Pembuktian Sah',
    bonusModifier: 3,
    bonusType: 'pertahanan',
    emoji: '📱',
  },
};

export function calculateEvidenceBonus(evidence: { bonusModifier?: number }[]): number {
  return evidence.reduce((sum, e) => sum + (e.bonusModifier || 0), 0);
}

export function getEvidenceById(id: string): EvidenceItem | undefined {
  return EVIDENCE_CATALOG[id];
}
