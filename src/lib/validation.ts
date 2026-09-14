const PLAYER_NAME_REGEX = /^[\w\s\u00C0-\u024F\u0600-\u06FF\u0980-\u09FF\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF-]+$/;

export function sanitizeString(input: unknown, maxLen = 100): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLen);
}

export function validatePlayerName(name: unknown): { valid: boolean; error?: string } {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Nama pemain wajib diisi' };
  }
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Nama pemain tidak boleh kosong' };
  }
  if (trimmed.length > 20) {
    return { valid: false, error: 'Nama pemain maksimal 20 karakter' };
  }
  if (!PLAYER_NAME_REGEX.test(trimmed)) {
    return { valid: false, error: 'Nama pemain mengandung karakter tidak valid' };
  }
  return { valid: true };
}

export function validateBoardIndex(idx: unknown): { valid: boolean; error?: string } {
  if (typeof idx !== 'number' || !Number.isInteger(idx)) {
    return { valid: false, error: 'boardIndex harus angka bulat' };
  }
  if (idx < 0 || idx > 39) {
    return { valid: false, error: 'boardIndex harus antara 0-39' };
  }
  return { valid: true };
}

export function validateRoomCode(code: unknown): { valid: boolean; error?: string } {
  if (!code || typeof code !== 'string') {
    return { valid: false, error: 'Kode room wajib diisi' };
  }
  const trimmed = code.trim().toUpperCase();
  if (!/^[A-Z0-9]{4,8}$/.test(trimmed)) {
    return { valid: false, error: 'Kode room harus 4-8 karakter alphanumeric' };
  }
  return { valid: true };
}

export function validateGameMode(mode: unknown): { valid: boolean; error?: string } {
  const allowed = ['bundir', 'sultan', 'kilat'];
  if (!mode || typeof mode !== 'string' || !allowed.includes(mode)) {
    return { valid: false, error: 'Mode game tidak valid' };
  }
  return { valid: true };
}

export function validateId(id: unknown, fieldName = 'id'): { valid: boolean; error?: string } {
  if (!id || typeof id !== 'string') {
    return { valid: false, error: `${fieldName} wajib diisi` };
  }
  if (id.length > 100) {
    return { valid: false, error: `${fieldName} tidak valid` };
  }
  return { valid: true };
}

export function validateUserId(userId: unknown): { valid: boolean; error?: string } {
  if (!userId || typeof userId !== 'string') {
    return { valid: false, error: 'User ID wajib diisi' };
  }
  if (userId.length > 100) {
    return { valid: false, error: 'User ID tidak valid' };
  }
  return { valid: true };
}

export function sanitizeChatMessage(text: unknown): string {
  if (typeof text !== 'string') return '';
  // Remove HTML tags, limit length
  return text
    .replace(/<[^>]*>/g, '')
    .trim()
    .slice(0, 500);
}

export function sanitizeSenderName(name: unknown): string {
  if (typeof name !== 'string') return 'Anonymous';
  return name.trim().slice(0, 20).replace(/[<>]/g, '');
}

export const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
