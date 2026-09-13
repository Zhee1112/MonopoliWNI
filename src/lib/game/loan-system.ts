// ============================================================
// LOAN SYSTEM - Bank BUMN & Pinjol Ilegal
// ============================================================

export interface Loan {
  id: string;
  lender: 'bank' | 'pinjol';
  amount: number;
  interestRate: number;
  interestAmount: number;
  totalOwed: number;
  collateralPropertyId?: string;
  turnBorrowed: number;
  turnsRemaining: number;
  isOverdue: boolean;
  isActive: boolean;
}

export interface LoanResult {
  success: boolean;
  loan?: Loan;
  error?: string;
}

export interface RepaymentResult {
  success: boolean;
  paidAmount: number;
  remainingDebt: number;
  isFullyPaid: boolean;
  error?: string;
}

// ============================================================
// CONSTANTS
// ============================================================

export const BANK_LOAN_CONFIG = {
  lender: 'bank' as const,
  interestRate: 0.10, // 10%
  maxLoanRatio: 0.50, // Max 50% of total assets
  minLoan: 50000,
  maxTurnsToRepay: 10,
  requiresCollateral: true,
  name: 'Bank BUMN',
  icon: '🏦',
  description: 'Pinjaman resmi dengan bunga rendah. Perlu jaminan properti.',
  requirements: [
    'Butuh jaminan properti',
    'Bunga rendah (10%)',
    'Batas waktu 10 giliran',
    'Denda keterlambatan: +5% per giliran',
  ],
};

export const PINJOL_LOAN_CONFIG = {
  lender: 'pinjol' as const,
  interestRate: 0.25, // 25%
  maxLoanRatio: 0.30, // Max 30% of total assets
  minLoan: 25000,
  seizureChance: 0.15, // 15% chance of property seizure
  maxTurnsToRepay: 5,
  requiresCollateral: false,
  name: 'Pinjol Ilegal',
  icon: '📱',
  description: 'Cair instan tanpa jaminan. Tapi hati-hati, bisa disita propertinya!',
  requirements: [
    'Tanpa jaminan',
    'Bunga tinggi (25%)',
    'Batas waktu 5 giliran',
    '15% risiko aset disita',
  ],
};

// ============================================================
// LOAN CALCULATIONS
// ============================================================

export function calculateTotalAssets(
  cleanMoney: number,
  properties: Array<{ price?: number }> = []
): number {
  const propertyValue = properties.reduce((sum, p) => sum + (p.price || 0), 0);
  return cleanMoney + propertyValue;
}

export function calculateMaxLoanAmount(
  lender: 'bank' | 'pinjol',
  totalAssets: number,
  existingLoans: Loan[] = []
): number {
  const config = lender === 'bank' ? BANK_LOAN_CONFIG : PINJOL_LOAN_CONFIG;
  const activeLoanTotal = existingLoans
    .filter((l) => l.isActive)
    .reduce((sum, l) => sum + l.totalOwed, 0);

  const maxLoan = Math.floor(totalAssets * config.maxLoanRatio) - activeLoanTotal;
  return Math.max(0, maxLoan);
}

export function calculateLoanInterest(
  lender: 'bank' | 'pinjol',
  amount: number
): { interestRate: number; interestAmount: number; totalOwed: number } {
  const config = lender === 'bank' ? BANK_LOAN_CONFIG : PINJOL_LOAN_CONFIG;
  const interestAmount = Math.floor(amount * config.interestRate);
  return {
    interestRate: config.interestRate,
    interestAmount,
    totalOwed: amount + interestAmount,
  };
}

export function calculateEarlyPaymentDiscount(
  loan: Loan,
  turnsEarly: number
): number {
  if (loan.lender === 'pinjol') return 0; // No discount for pinjol
  const discountRate = 0.02 * turnsEarly; // 2% per turn early
  return Math.floor(loan.interestAmount * Math.min(discountRate, 0.20));
}

// ============================================================
// LOAN ACTIONS
// ============================================================

export function createLoan(
  lender: 'bank' | 'pinjol',
  amount: number,
  playerId: string,
  currentTurn: number,
  properties: Array<{ id: string; price?: number }> = [],
  existingLoans: Loan[] = [],
  cleanMoney: number = 0
): LoanResult {
  const config = lender === 'bank' ? BANK_LOAN_CONFIG : PINJOL_LOAN_CONFIG;

  // Validate minimum amount
  if (amount < config.minLoan) {
    return { success: false, error: `Minimal pinjaman Rp ${config.minLoan.toLocaleString('id-ID')}` };
  }

  // Calculate total assets
  const totalAssets = calculateTotalAssets(cleanMoney, properties);

  // Calculate max loan
  const maxLoan = calculateMaxLoanAmount(lender, totalAssets, existingLoans);

  if (amount > maxLoan) {
    return {
      success: false,
      error: `Maksimal pinjaman Rp ${maxLoan.toLocaleString('id-ID')} (50% total aset)`,
    };
  }

  // Check collateral requirement for bank
  if (lender === 'bank' && properties.length === 0) {
    return { success: false, error: 'Bank BUMN membutuhkan jaminan properti!' };
  }

  // Calculate interest
  const { interestRate, interestAmount, totalOwed } = calculateLoanInterest(lender, amount);

  // Create loan
  const loan: Loan = {
    id: `loan_${playerId}_${Date.now()}`,
    lender,
    amount,
    interestRate,
    interestAmount,
    totalOwed,
    collateralPropertyId: lender === 'bank' ? properties[0]?.id : undefined,
    turnBorrowed: currentTurn,
    turnsRemaining: config.maxTurnsToRepay,
    isOverdue: false,
    isActive: true,
  };

  return { success: true, loan };
}

export function processLoanPayment(
  loan: Loan,
  paymentAmount: number,
  currentTurn: number
): RepaymentResult {
  if (!loan.isActive) {
    return { success: false, paidAmount: 0, remainingDebt: 0, isFullyPaid: false, error: 'Pinjaman tidak aktif' };
  }

  // Calculate overdue penalty
  const turnsOverdue = Math.max(0, currentTurn - loan.turnBorrowed - (loan.lender === 'bank' ? 10 : 5));
  const penaltyRate = 0.05 * turnsOverdue;
  const penalty = Math.floor(loan.amount * penaltyRate);

  const totalDebt = loan.totalOwed + penalty;
  const paidAmount = Math.min(paymentAmount, totalDebt);
  const remainingDebt = totalDebt - paidAmount;
  const isFullyPaid = remainingDebt <= 0;

  return {
    success: true,
    paidAmount,
    remainingDebt,
    isFullyPaid,
  };
}

export function processPinjolSeizure(
  loan: Loan,
  properties: Array<{ id: string; price?: number }>
): { seized: boolean; seizedPropertyId?: string; message: string } {
  if (loan.lender !== 'pinjol' || !loan.isActive) {
    return { seized: false, message: 'Tidak ada pinjol aktif' };
  }

  // 15% chance of seizure
  const roll = Math.random();
  if (roll > PINJOL_LOAN_CONFIG.seizureChance) {
    return { seized: false, message: 'Berhasil menghindari sita aset!' };
  }

  // Seize the most expensive property
  if (properties.length === 0) {
    return { seized: false, message: 'Tidak ada properti untuk disita' };
  }

  const sortedProperties = [...properties].sort((a, b) => (b.price || 0) - (a.price || 0));
  const seizedProperty = sortedProperties[0];

  return {
    seized: true,
    seizedPropertyId: seizedProperty.id,
    message: `⚠️ PINJOL MENYITA properti ${seizedProperty.id}!`,
  };
}

export function processBankSeizure(
  loan: Loan,
  properties: Array<{ id: string; price?: number }>
): { seized: boolean; seizedPropertyId?: string; message: string } {
  if (loan.lender !== 'bank' || !loan.isActive) {
    return { seized: false, message: 'Tidak ada pinjaman bank aktif' };
  }

  // Bank always seizes collateral if overdue
  const collateralProperty = properties.find((p) => p.id === loan.collateralPropertyId);
  if (!collateralProperty) {
    return { seized: false, message: 'Properti jaminan tidak ditemukan' };
  }

  return {
    seized: true,
    seizedPropertyId: collateralProperty.id,
    message: `🏦 BANK MENYITA jaminan: ${collateralProperty.id}`,
  };
}

export function checkLoanOverdue(
  loan: Loan,
  currentTurn: number
): { isOverdue: boolean; turnsOverdue: number; penalty: number } {
  if (!loan.isActive) {
    return { isOverdue: false, turnsOverdue: 0, penalty: 0 };
  }

  const maxTurns = loan.lender === 'bank' ? 10 : 5;
  const turnsOverdue = Math.max(0, currentTurn - loan.turnBorrowed - maxTurns);
  const penaltyRate = 0.05 * turnsOverdue;
  const penalty = Math.floor(loan.amount * penaltyRate);

  return {
    isOverdue: turnsOverdue > 0,
    turnsOverdue,
    penalty,
  };
}

export function formatLoanStatus(loan: Loan, currentTurn: number): string {
  const { isOverdue, turnsOverdue, penalty } = checkLoanOverdue(loan, currentTurn);
  const maxTurns = loan.lender === 'bank' ? 10 : 5;
  const turnsLeft = Math.max(0, maxTurns - (currentTurn - loan.turnBorrowed));

  if (isOverdue) {
    return `⚠️ TERLAMBAT ${turnsOverdue} giliran! Denda: +Rp ${penalty.toLocaleString('id-ID')}`;
  }

  return `Sisa ${turnsLeft} giliran • Total hutang: Rp ${loan.totalOwed.toLocaleString('id-ID')}`;
}
