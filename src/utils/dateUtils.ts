/**
 * Date and Voter Eligibility Utilities for Pilkades DPT System
 * Sesuai ketentuan perundang-undangan dan Perbup tentang Pemilihan Kepala Desa
 */

import { GenderType, MaritalStatusType, Voter, VoterEligibilityStatus } from '../types';

/**
 * Normalizes input date to YYYY-MM-DD format
 * Accepts YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY
 */
export function normalizeDateToISO(inputDate?: string): string | undefined {
  if (!inputDate || !inputDate.trim()) return undefined;
  const trimmed = inputDate.trim();

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split('-').map(Number);
    if (isValidDate(y, m, d)) return trimmed;
  }

  // DD-MM-YYYY or DD/MM/YYYY
  const ddmmyyyyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (ddmmyyyyMatch) {
    const d = Number(ddmmyyyyMatch[1]);
    const m = Number(ddmmyyyyMatch[2]);
    const y = Number(ddmmyyyyMatch[3]);
    if (isValidDate(y, m, d)) {
      return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }

  return undefined;
}

/**
 * Formats YYYY-MM-DD to Indonesian display DD-MM-YYYY
 */
export function formatDateToDisplay(isoDate?: string): string {
  if (!isoDate || !isoDate.trim()) return '-';
  const iso = normalizeDateToISO(isoDate);
  if (!iso) return isoDate;
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y}`;
}

/**
 * Formats YYYY-MM-DD to long Indonesian date (e.g. 15 November 2026)
 */
export function formatDateToLong(isoDate?: string): string {
  if (!isoDate || !isoDate.trim()) return '-';
  const iso = normalizeDateToISO(isoDate);
  if (!iso) return isoDate;
  const [y, m, d] = iso.split('-').map(Number);
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  return `${d} ${months[m - 1] || ''} ${y}`;
}

function isValidDate(year: number, month: number, day: number): boolean {
  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  const daysInMonth = new Date(year, month, 0).getDate();
  return day >= 1 && day <= daysInMonth;
}

/**
 * Calculates exact age in completed years as of a reference date (Pilkades election date)
 */
export function calculateAge(
  birthDateIso?: string,
  electionDateIso?: string
): { years: number; months: number; days: number; text: string } | null {
  if (!birthDateIso || !electionDateIso) return null;

  const bIso = normalizeDateToISO(birthDateIso);
  const eIso = normalizeDateToISO(electionDateIso);
  if (!bIso || !eIso) return null;

  const [bY, bM, bD] = bIso.split('-').map(Number);
  const [eY, eM, eD] = eIso.split('-').map(Number);

  let years = eY - bY;
  let months = eM - bM;
  let days = eD - bD;

  if (days < 0) {
    months -= 1;
    // Days in previous month of election date
    const prevMonthDays = new Date(eY, eM - 1, 0).getDate();
    days += prevMonthDays;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years < 0) {
    return { years: 0, months: 0, days: 0, text: '0 Tahun (Tanggal lahir di masa depan)' };
  }

  const text = `${years} Tahun ${months > 0 ? `${months} Bln` : ''}`.trim();
  return { years, months, days, text };
}

export interface EligibilityResult {
  status: VoterEligibilityStatus;
  statusLabel: string;
  badgeColor: string;
  usiaPadaPilkades?: number;
  usiaText?: string;
  alasan: string;
  isCompliant: boolean;
  needsReview: boolean;
}

/**
 * Evaluates voter preliminary eligibility according to Pilkades regulations (e.g. Perbup Sumedang)
 * Syarat:
 * 1. Usia genap 17 tahun pada hari H pemungutan suara, ATAU
 * 2. Belum berusia 17 tahun tetapi sudah / pernah kawin (Status Perkawinan 'S' atau 'P').
 * Jika tanggal lahir atau tanggal pilkades tidak ada -> Belum Dapat Dinilai.
 * Catatan: Hasil adalah indikasi awal sistem; keputusan sah tetap berada pada Panitia Pilkades.
 */
export function evaluateVoterEligibility(
  voter: Partial<Voter>,
  electionDateIso?: string
): EligibilityResult {
  // If voter already verified by panitia and explicitly set
  const isVerifiedByCommittee = voter.statusVerifikasi === 'sudah_diverifikasi';
  const isNeedsCorrection = voter.statusVerifikasi === 'perlu_perbaikan';

  if (!electionDateIso || !electionDateIso.trim()) {
    return {
      status: 'belum_dapat_dinilai',
      statusLabel: 'Belum Dapat Dinilai',
      badgeColor: 'slate',
      alasan: 'Tanggal pelaksanaan Pilkades belum ditentukan di menu Pengaturan Desa.',
      isCompliant: false,
      needsReview: true,
    };
  }

  if (!voter.tanggalLahir || !voter.tanggalLahir.trim()) {
    return {
      status: 'belum_dapat_dinilai',
      statusLabel: 'Belum Dapat Dinilai',
      badgeColor: 'slate',
      alasan: 'Tanggal lahir belum diisi. Lengkapi data tanggal lahir untuk kalkulasi usia.',
      isCompliant: false,
      needsReview: true,
    };
  }

  const ageData = calculateAge(voter.tanggalLahir, electionDateIso);
  if (!ageData) {
    return {
      status: 'belum_dapat_dinilai',
      statusLabel: 'Belum Dapat Dinilai',
      badgeColor: 'slate',
      alasan: 'Format tanggal lahir tidak valid.',
      isCompliant: false,
      needsReview: true,
    };
  }

  const { years, text } = ageData;
  const isMarriedOrEver = voter.statusPerkawinan === 'S' || voter.statusPerkawinan === 'P';

  // Condition 1: Age >= 17 years old
  if (years >= 17) {
    if (isNeedsCorrection) {
      return {
        status: 'perlu_perbaikan',
        statusLabel: 'Perlu Perbaikan Data',
        badgeColor: 'rose',
        usiaPadaPilkades: years,
        usiaText: text,
        alasan: 'Usia memenuhi syarat (≥ 17 thn), namun berkas/data kependudukan ditandai perlu perbaikan oleh Panitia.',
        isCompliant: false,
        needsReview: true,
      };
    }

    if (isVerifiedByCommittee) {
      return {
        status: 'terverifikasi',
        statusLabel: 'Terverifikasi (Sah)',
        badgeColor: 'emerald',
        usiaPadaPilkades: years,
        usiaText: text,
        alasan: `Usia ${years} tahun pada hari H dan telah diverifikasi memenuhi syarat oleh Panitia Pilkades.`,
        isCompliant: true,
        needsReview: false,
      };
    }

    return {
      status: 'memenuhi_syarat_usia',
      statusLabel: 'Memenuhi Indikasi Persyaratan Usia',
      badgeColor: 'emerald',
      usiaPadaPilkades: years,
      usiaText: text,
      alasan: `Usia mencapai ${years} tahun pada hari pelaksanaan Pilkades (${formatDateToLong(electionDateIso)}). Memenuhi indikasi syarat usia pemilih.`,
      isCompliant: true,
      needsReview: false,
    };
  }

  // Condition 2: Age < 17 but married or previously married
  if (isMarriedOrEver) {
    const maritalLabel = voter.statusPerkawinan === 'S' ? 'Sudah Kawin' : 'Pernah Kawin';
    if (isVerifiedByCommittee) {
      return {
        status: 'terverifikasi',
        statusLabel: 'Terverifikasi (Sah - Kawin)',
        badgeColor: 'emerald',
        usiaPadaPilkades: years,
        usiaText: text,
        alasan: `Usia ${years} thn (< 17 thn), namun berstatus ${maritalLabel} dan telah diverifikasi sah oleh Panitia sesuai ketentuan Pilkades.`,
        isCompliant: true,
        needsReview: false,
      };
    }

    return {
      status: 'memenuhi_syarat_usia',
      statusLabel: 'Memenuhi Syarat (Status Kawin)',
      badgeColor: 'teal',
      usiaPadaPilkades: years,
      usiaText: text,
      alasan: `Usia ${years} thn (< 17 thn), namun memiliki status perkawinan "${maritalLabel}". Berhak menggunakan hak pilih sesuai regulasi Pilkades.`,
      isCompliant: true,
      needsReview: false,
    };
  }

  // Condition 3: Under 17 and not married -> Needs thorough review by committee
  return {
    status: 'perlu_pemeriksaan',
    statusLabel: 'Perlu Pemeriksaan Kelayakan',
    badgeColor: 'amber',
    usiaPadaPilkades: years,
    usiaText: text,
    alasan: `Usia pada hari H baru mencapai ${years} tahun (< 17 tahun) dan berstatus Belum Kawin. Perlu verifikasi keabsahan dokumen kependudukan oleh Panitia sebelum penetapan DPT.`,
    isCompliant: false,
    needsReview: true,
  };
}

/**
 * Validates Indonesian NIK (Nomor Induk Kependudukan)
 * Standard: exactly 16 digits numeric
 */
export function validateNik(nik?: string): { isValid: boolean; message: string } {
  if (!nik || !nik.trim()) {
    return { isValid: false, message: 'NIK wajib diisi.' };
  }
  const clean = nik.trim();
  if (!/^\d{16}$/.test(clean)) {
    return { isValid: false, message: 'NIK harus terdiri dari 16 digit angka kependudukan.' };
  }
  return { isValid: true, message: '' };
}

/**
 * Validates Indonesian KK (Kartu Keluarga)
 * Standard: exactly 16 digits numeric (optional if empty)
 */
export function validateKk(noKk?: string): { isValid: boolean; message: string } {
  if (!noKk || !noKk.trim()) {
    return { isValid: true, message: '' }; // Optional
  }
  const clean = noKk.trim();
  if (!/^\d{16}$/.test(clean)) {
    return { isValid: false, message: 'Nomor Kartu Keluarga (KK) harus berupa 16 digit angka.' };
  }
  return { isValid: true, message: '' };
}

export const GENDER_OPTIONS: { value: GenderType; label: string }[] = [
  { value: 'L', label: 'Laki-Laki' },
  { value: 'P', label: 'Perempuan' },
];

export const MARITAL_STATUS_OPTIONS: { value: MaritalStatusType; label: string; description: string }[] = [
  { value: 'B', label: 'Belum Kawin (B)', description: 'Belum pernah menikah secara hukum/agama' },
  { value: 'S', label: 'Kawin (S)', description: 'Telah terikat pernikahan sah' },
  { value: 'P', label: 'Pernah Kawin (P)', description: 'Cerai hidup atau cerai mati' },
];

/**
 * Mask Indonesian NIK for personal data protection (UU PDP)
 * Example: 3211011508820001 -> 321101******0001
 */
export function maskNik(nik?: string): string {
  if (!nik || !nik.trim()) return '-';
  const clean = nik.trim();
  if (clean.length < 10) return clean;
  const prefix = clean.substring(0, 6);
  const suffix = clean.substring(clean.length - 4);
  const maskedCount = Math.max(2, clean.length - 10);
  return `${prefix}${'*'.repeat(maskedCount)}${suffix}`;
}

/**
 * Mask Indonesian KK for personal data protection
 * Example: 3211011002080005 -> 321101******0005
 */
export function maskKk(kk?: string): string {
  if (!kk || !kk.trim()) return '-';
  const clean = kk.trim();
  if (clean.length < 10) return clean;
  const prefix = clean.substring(0, 6);
  const suffix = clean.substring(clean.length - 4);
  const maskedCount = Math.max(2, clean.length - 10);
  return `${prefix}${'*'.repeat(maskedCount)}${suffix}`;
}

/**
 * Mask voter full name for public view if needed
 * Example: Budi Santoso -> B**i S*****o
 */
export function maskName(name?: string): string {
  if (!name || !name.trim()) return '-';
  const parts = name.trim().split(/\s+/);
  return parts
    .map((part) => {
      if (part.length <= 2) return part;
      return part[0] + '*'.repeat(part.length - 2) + part[part.length - 1];
    })
    .join(' ');
}

