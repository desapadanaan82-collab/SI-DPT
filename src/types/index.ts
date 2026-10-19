export type UserRole = 'admin' | 'operator';

export interface User {
  id: string;
  username: string;
  nama: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface DesaSettings {
  namaDesa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  periodePilkades: string;
  tanggalPelaksanaan?: string; // Format: YYYY-MM-DD
  namaKetuaPanitia: string;
  namaSekretaris: string;
  alamatKantor: string;
  kontakSekretariat: string;
}

export interface Dusun {
  id: string;
  nama: string;
  keterangan: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RW {
  id: string;
  nomor: string;
  nama: string;
  dusunId?: string;
  dusunNama?: string;
  isActive: boolean;
  keterangan: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RT {
  id: string;
  nomor: string;
  rwNomor: string;
  rwId?: string;
  dusunId?: string;
  nama: string;
  isActive: boolean;
  keterangan: string;
  createdAt?: string;
  updatedAt?: string;
}

export type VerificationStatus = 'belum_diverifikasi' | 'sudah_diverifikasi' | 'perlu_perbaikan';

export type GenderType = 'L' | 'P';
export type MaritalStatusType = 'B' | 'S' | 'P'; // B: Belum Kawin, S: Kawin / Sudah Kawin, P: Pernah Kawin / Cerai

export type VoterEligibilityStatus =
  | 'terverifikasi'
  | 'perlu_perbaikan'
  | 'perlu_pemeriksaan'
  | 'memenuhi_syarat_usia'
  | 'belum_dapat_dinilai';

export interface Voter {
  id: string;
  nik?: string; // 16 digit NIK
  noKk?: string; // 16 digit KK
  namaLengkap: string;
  tempatLahir?: string;
  tanggalLahir?: string; // YYYY-MM-DD
  jenisKelamin?: GenderType;
  statusPerkawinan?: MaritalStatusType;
  alamat: string;
  dusunId?: string;
  dusunNama?: string;
  rt: string;
  rw: string;
  statusVerifikasi: VerificationStatus;
  kelayakanStatus?: VoterEligibilityStatus;
  alasanKelayakan?: string;
  usiaPadaPilkades?: number;
  nomorIdentifikasiInternal?: string;
  keterangan?: string;
  catatanVerifikasi?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}

export type AuditAction = 
  | 'tambah_warga'
  | 'edit_warga'
  | 'hapus_warga'
  | 'verifikasi_warga'
  | 'impor_excel'
  | 'kelola_wilayah'
  | 'pengaturan_desa'
  | 'backup_restore';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: AuditAction;
  description: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface TerritoryRelationCheck {
  canDelete: boolean;
  childRWCount: number;
  childRTCount: number;
  voterCount: number;
  reason: string;
  details?: {
    rws?: RW[];
    rts?: RT[];
    votersSample?: Voter[];
  };
}
