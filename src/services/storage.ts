import {
  AuditLog,
  DesaSettings,
  Dusun,
  RT,
  RW,
  TerritoryRelationCheck,
  TPS,
  TpsRelationCheck,
  User,
  Voter,
} from '../types';
import {
  evaluateVoterEligibility,
  normalizeDateToISO,
  validateNik,
  validateKk,
} from '../utils/dateUtils';

export const STORAGE_KEYS = {
  VOTERS: 'pilkades_dpt_voters',
  DUSUNS: 'pilkades_dpt_dusuns',
  RWS: 'pilkades_dpt_rws',
  RTS: 'pilkades_dpt_rts',
  TPS: 'pilkades_dpt_tps',
  SETTINGS: 'pilkades_dpt_settings',
  USERS: 'pilkades_dpt_users',
  LOGS: 'pilkades_dpt_logs',
  ACTIVE_USER: 'pilkades_dpt_active_user_id',
  FIREBASE_CONFIG: 'pilkades_dpt_firebase_cfg',
};

// Initial default settings for Desa Padanaan, Paseh, Sumedang
export const DEFAULT_SETTINGS: DesaSettings = {
  namaDesa: 'Desa Padanaan',
  kecamatan: 'Kecamatan Paseh',
  kabupaten: 'Kabupaten Sumedang',
  provinsi: 'Jawa Barat',
  periodePilkades: '2026 - 2032',
  tanggalPelaksanaan: '2026-11-15', // Format: YYYY-MM-DD (15 November 2026)
  namaKetuaPanitia: 'Drs. H. Mulyadi, M.Si',
  namaSekretaris: 'Anisa Wulandari, S.Pd',
  alamatKantor: 'Jl. Raya Desa Padanaan No. 01 Kec. Paseh Kab. Sumedang',
  kontakSekretariat: 'panitia.pilkades@padanaan.desa.id / 0812-3456-7890',
};

// Initial default TPS (Tempat Pemungutan Suara)
export const DEFAULT_TPS: TPS[] = [
  {
    id: 'tps-1',
    nomor: '01',
    nama: 'TPS 01 - Dusun Padanaan I',
    namaTempat: 'SDN Padanaan I',
    dusunId: 'dusun-1',
    dusunNama: 'Dusun Krajan',
    rw: '001',
    rt: '001, 002',
    alamat: 'Jl. Raya Desa Padanaan No. 15 RT 01 / RW 01',
    latitude: -6.89241,
    longitude: 107.98523,
    kapasitas: 300,
    aksesibilitas: 'Akses datar, ramah kursi roda dan lansia',
    status: 'ditetapkan',
    kontakPetugas: '0812-9876-1101',
    namaKetuaKpks: 'Asep Saepudin',
    keterangan: 'Ruang Kelas 1 & 2 SDN Padanaan I',
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'tps-2',
    nomor: '02',
    nama: 'TPS 02 - Dusun Padanaan I',
    namaTempat: 'Balai Pertemuan Dusun',
    dusunId: 'dusun-1',
    dusunNama: 'Dusun Krajan',
    rw: '001',
    rt: '003',
    alamat: 'Gg. Cempaka RT 03 / RW 01',
    latitude: -6.89312,
    longitude: 107.98645,
    kapasitas: 300,
    aksesibilitas: 'Aula tertutup dengan ventilasi terbuka lebar',
    status: 'ditetapkan',
    kontakPetugas: '0813-8899-2202',
    namaKetuaKpks: 'Dadan Ramdani',
    keterangan: 'Dekat dengan posyandu mawar',
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'tps-3',
    nomor: '03',
    nama: 'TPS 03 - Dusun Mekarsari',
    namaTempat: 'Gedung Serbaguna Mekarsari',
    dusunId: 'dusun-2',
    dusunNama: 'Dusun Mekarsari',
    rw: '002',
    rt: '001, 002',
    alamat: 'Jl. Mekarsari Raya RT 01 / RW 02',
    latitude: -6.89550,
    longitude: 107.98920,
    kapasitas: 300,
    aksesibilitas: 'Halaman parkir luas, dekat jalan lingkar desa',
    status: 'ditetapkan',
    kontakPetugas: '0812-7766-3303',
    namaKetuaKpks: 'Maman Suratman',
    keterangan: 'Gedung serbaguna masyarakat RW 02',
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'tps-4',
    nomor: '04',
    nama: 'TPS 04 - Dusun Mekarsari',
    namaTempat: 'Madrasah Diniyah Mekarsari',
    dusunId: 'dusun-2',
    dusunNama: 'Dusun Mekarsari',
    rw: '002',
    rt: '003',
    alamat: 'Jl. Mawar RT 03 / RW 02',
    latitude: -6.89710,
    longitude: 107.99150,
    kapasitas: 300,
    aksesibilitas: 'Akses jalan beraspal, ramah penyandang disabilitas',
    status: 'ditetapkan',
    kontakPetugas: '0813-4455-4404',
    namaKetuaKpks: 'Cecep Hidayat',
    keterangan: 'Aula serbaguna madrasah diniyah',
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-15T08:00:00.000Z',
  },
];

// Initial default dusuns
export const DEFAULT_DUSUNS: Dusun[] = [
  {
    id: 'dusun-1',
    nama: 'Dusun Krajan',
    keterangan: 'Wilayah pusat desa dan perkantoran',
    isActive: true,
    createdAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'dusun-2',
    nama: 'Dusun Mekarsari',
    keterangan: 'Wilayah perbukitan dan perkebunan',
    isActive: true,
    createdAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'dusun-3',
    nama: 'Dusun Sukasari',
    keterangan: 'Wilayah pemekaran (sementara nonaktif)',
    isActive: false,
    createdAt: '2026-01-01T08:00:00.000Z',
  },
];

// Initial default RWs
export const DEFAULT_RWS: RW[] = [
  {
    id: 'rw-1',
    nomor: '001',
    nama: 'RW 001 - Dusun Krajan',
    dusunId: 'dusun-1',
    dusunNama: 'Dusun Krajan',
    isActive: true,
    keterangan: 'Wilayah pusat desa dan perkantoran',
  },
  {
    id: 'rw-2',
    nomor: '002',
    nama: 'RW 002 - Dusun Mekarsari',
    dusunId: 'dusun-2',
    dusunNama: 'Dusun Mekarsari',
    isActive: true,
    keterangan: 'Wilayah perbukitan dan perkebunan',
  },
  {
    id: 'rw-3',
    nomor: '003',
    nama: 'RW 003 - Dusun Sukasari',
    dusunId: 'dusun-3',
    dusunNama: 'Dusun Sukasari',
    isActive: false,
    keterangan: 'Wilayah pemekaran (sementara nonaktif)',
  },
];

// Initial default RTs
export const DEFAULT_RTS: RT[] = [
  {
    id: 'rt-1',
    nomor: '001',
    rwNomor: '001',
    rwId: 'rw-1',
    dusunId: 'dusun-1',
    nama: 'RT 001 / RW 001',
    isActive: true,
    keterangan: 'Dusun Krajan Utara',
  },
  {
    id: 'rt-2',
    nomor: '002',
    rwNomor: '001',
    rwId: 'rw-1',
    dusunId: 'dusun-1',
    nama: 'RT 002 / RW 001',
    isActive: true,
    keterangan: 'Dusun Krajan Selatan',
  },
  {
    id: 'rt-3',
    nomor: '003',
    rwNomor: '001',
    rwId: 'rw-1',
    dusunId: 'dusun-1',
    nama: 'RT 003 / RW 001',
    isActive: true,
    keterangan: 'Dusun Krajan Timur',
  },
  {
    id: 'rt-4',
    nomor: '001',
    rwNomor: '002',
    rwId: 'rw-2',
    dusunId: 'dusun-2',
    nama: 'RT 001 / RW 002',
    isActive: true,
    keterangan: 'Dusun Mekarsari Barat',
  },
  {
    id: 'rt-5',
    nomor: '002',
    rwNomor: '002',
    rwId: 'rw-2',
    dusunId: 'dusun-2',
    nama: 'RT 002 / RW 002',
    isActive: true,
    keterangan: 'Dusun Mekarsari Tengah',
  },
  {
    id: 'rt-6',
    nomor: '003',
    rwNomor: '002',
    rwId: 'rw-2',
    dusunId: 'dusun-2',
    nama: 'RT 003 / RW 002',
    isActive: true,
    keterangan: 'Dusun Mekarsari Hilir',
  },
];

// Initial default Users
export const DEFAULT_USERS: User[] = [
  {
    id: 'user-admin',
    username: 'admin',
    nama: 'Administrator Desa',
    role: 'admin',
    isActive: true,
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'user-operator',
    username: 'operator',
    nama: 'Operator KPPS / DPT',
    role: 'operator',
    isActive: true,
    createdAt: '2026-01-15T09:30:00.000Z',
  },
];

// Initial default Voters (12 real data records with full demographics)
export const DEFAULT_VOTERS: Voter[] = [
  {
    id: 'voter-1',
    nik: '3211011508820001',
    noKk: '3211011002080005',
    namaLengkap: 'Budi Santoso',
    tempatLahir: 'Sumedang',
    tanggalLahir: '1982-08-15',
    jenisKelamin: 'L',
    statusPerkawinan: 'S',
    alamat: 'Jl. Merpati No. 12',
    dusunId: 'dusun-1',
    dusunNama: 'Dusun Krajan',
    rt: '001',
    rw: '001',
    statusVerifikasi: 'sudah_diverifikasi',
    nomorIdentifikasiInternal: 'DPT-2026-001',
    keterangan: 'Warga asli, berdomisili tetap',
    catatanVerifikasi: 'Kesesuaian administrasi RT sudah diverifikasi langsung oleh Ketua RT 001.',
    verifiedBy: 'Administrator Desa',
    verifiedAt: '2026-02-01T10:00:00.000Z',
    createdAt: '2026-01-20T08:15:00.000Z',
    updatedAt: '2026-02-01T10:00:00.000Z',
    createdBy: 'Operator KPPS / DPT',
  },
  {
    id: 'voter-2',
    nik: '3211015204880002',
    noKk: '3211011002080005',
    namaLengkap: 'Siti Aminah',
    tempatLahir: 'Bandung',
    tanggalLahir: '1988-04-12',
    jenisKelamin: 'P',
    statusPerkawinan: 'S',
    alamat: 'Jl. Kenanga No. 04',
    dusunId: 'dusun-1',
    dusunNama: 'Dusun Krajan',
    rt: '001',
    rw: '001',
    statusVerifikasi: 'sudah_diverifikasi',
    nomorIdentifikasiInternal: 'DPT-2026-002',
    keterangan: 'Tinggal bersama keluarga',
    catatanVerifikasi: 'Berkas lengkap dan sesuai kependudukan desa.',
    verifiedBy: 'Administrator Desa',
    verifiedAt: '2026-02-01T10:15:00.000Z',
    createdAt: '2026-01-20T08:20:00.000Z',
    updatedAt: '2026-02-01T10:15:00.000Z',
    createdBy: 'Operator KPPS / DPT',
  },
  {
    id: 'voter-3',
    nik: '3211012010950003',
    noKk: '3211011405150009',
    namaLengkap: 'Agus Setiawan',
    tempatLahir: 'Sumedang',
    tanggalLahir: '1995-10-20',
    jenisKelamin: 'L',
    statusPerkawinan: 'B',
    alamat: 'Gg. Cempaka No. 09',
    dusunId: 'dusun-1',
    dusunNama: 'Dusun Krajan',
    rt: '002',
    rw: '001',
    statusVerifikasi: 'belum_diverifikasi',
    nomorIdentifikasiInternal: 'DPT-2026-003',
    keterangan: 'Pindah datang tahun 2025',
    createdAt: '2026-01-22T09:00:00.000Z',
    updatedAt: '2026-01-22T09:00:00.000Z',
    createdBy: 'Operator KPPS / DPT',
  },
  {
    id: 'voter-4',
    nik: '3211014506000004',
    noKk: '3211012208180012',
    namaLengkap: 'Dewi Lestari',
    tempatLahir: 'Majalengka',
    tanggalLahir: '2000-06-05',
    jenisKelamin: 'P',
    statusPerkawinan: 'S',
    alamat: 'Jl. Melati No. 17',
    dusunId: 'dusun-1',
    dusunNama: 'Dusun Krajan',
    rt: '002',
    rw: '001',
    statusVerifikasi: 'sudah_diverifikasi',
    nomorIdentifikasiInternal: 'DPT-2026-004',
    catatanVerifikasi: 'Data telah diverifikasi bersama pengurus RT 002.',
    verifiedBy: 'Administrator Desa',
    verifiedAt: '2026-02-03T11:00:00.000Z',
    createdAt: '2026-01-22T09:10:00.000Z',
    updatedAt: '2026-02-03T11:00:00.000Z',
    createdBy: 'Operator KPPS / DPT',
  },
  {
    id: 'voter-5',
    nik: '3211011103980005',
    noKk: '3211010309190015',
    namaLengkap: 'Hendra Wijaya',
    tempatLahir: 'Sumedang',
    tanggalLahir: '1998-03-11',
    jenisKelamin: 'L',
    statusPerkawinan: 'B',
    alamat: 'Jl. Flamboyan No. 25',
    dusunId: 'dusun-1',
    dusunNama: 'Dusun Krajan',
    rt: '003',
    rw: '001',
    statusVerifikasi: 'perlu_perbaikan',
    nomorIdentifikasiInternal: 'DPT-2026-005',
    keterangan: 'Ada perbedaan penulisan nomor rumah',
    catatanVerifikasi: 'Perlu konfirmasi nomor rumah dan RT ke pengurus wilayah.',
    verifiedBy: 'Administrator Desa',
    verifiedAt: '2026-02-05T14:20:00.000Z',
    createdAt: '2026-01-23T11:00:00.000Z',
    updatedAt: '2026-02-05T14:20:00.000Z',
    createdBy: 'Operator KPPS / DPT',
  },
  {
    id: 'voter-6',
    nik: '3211016809030006',
    noKk: '3211011211210020',
    namaLengkap: 'Rina Kusuma',
    tempatLahir: 'Sumedang',
    tanggalLahir: '2003-09-28',
    jenisKelamin: 'P',
    statusPerkawinan: 'B',
    alamat: 'Jl. Mawar Indah No. 02',
    dusunId: 'dusun-1',
    dusunNama: 'Dusun Krajan',
    rt: '003',
    rw: '001',
    statusVerifikasi: 'sudah_diverifikasi',
    nomorIdentifikasiInternal: 'DPT-2026-006',
    verifiedBy: 'Administrator Desa',
    verifiedAt: '2026-02-06T09:00:00.000Z',
    createdAt: '2026-01-24T13:40:00.000Z',
    updatedAt: '2026-02-06T09:00:00.000Z',
    createdBy: 'Operator KPPS / DPT',
  },
  {
    id: 'voter-7',
    nik: '3211011707900007',
    noKk: '3211010101150022',
    namaLengkap: 'Joko Pratama',
    tempatLahir: 'Cirebon',
    tanggalLahir: '1990-07-17',
    jenisKelamin: 'L',
    statusPerkawinan: 'S',
    alamat: 'Dusun Mekarsari RT 01 RW 02',
    dusunId: 'dusun-2',
    dusunNama: 'Dusun Mekarsari',
    rt: '001',
    rw: '002',
    statusVerifikasi: 'sudah_diverifikasi',
    nomorIdentifikasiInternal: 'DPT-2026-007',
    verifiedBy: 'Administrator Desa',
    verifiedAt: '2026-02-07T10:00:00.000Z',
    createdAt: '2026-01-25T14:00:00.000Z',
    updatedAt: '2026-02-07T10:00:00.000Z',
    createdBy: 'Operator KPPS / DPT',
  },
  {
    id: 'voter-8',
    nik: '3211014902920008',
    noKk: '3211010101150022',
    namaLengkap: 'Sri Wahyuni',
    tempatLahir: 'Sumedang',
    tanggalLahir: '1992-02-09',
    jenisKelamin: 'P',
    statusPerkawinan: 'S',
    alamat: 'Dusun Mekarsari Blok B No. 08',
    dusunId: 'dusun-2',
    dusunNama: 'Dusun Mekarsari',
    rt: '001',
    rw: '002',
    statusVerifikasi: 'belum_diverifikasi',
    nomorIdentifikasiInternal: 'DPT-2026-008',
    createdAt: '2026-01-26T15:20:00.000Z',
    updatedAt: '2026-01-26T15:20:00.000Z',
    createdBy: 'Operator KPPS / DPT',
  },
  {
    id: 'voter-9',
    nik: '3211010411850009',
    noKk: '3211011812100035',
    namaLengkap: 'Eko Prasetyo',
    tempatLahir: 'Sumedang',
    tanggalLahir: '1985-11-04',
    jenisKelamin: 'L',
    statusPerkawinan: 'S',
    alamat: 'Jl. Bukit Hijau No. 19',
    dusunId: 'dusun-2',
    dusunNama: 'Dusun Mekarsari',
    rt: '002',
    rw: '002',
    statusVerifikasi: 'sudah_diverifikasi',
    nomorIdentifikasiInternal: 'DPT-2026-009',
    verifiedBy: 'Administrator Desa',
    verifiedAt: '2026-02-08T11:30:00.000Z',
    createdAt: '2026-01-27T08:00:00.000Z',
    updatedAt: '2026-02-08T11:30:00.000Z',
    createdBy: 'Operator KPPS / DPT',
  },
  {
    id: 'voter-10',
    nik: '3211015505870010',
    noKk: '3211011812100035',
    namaLengkap: 'Nur Hidayah',
    tempatLahir: 'Garut',
    tanggalLahir: '1987-05-15',
    jenisKelamin: 'P',
    statusPerkawinan: 'S',
    alamat: 'Jl. Bukit Hijau No. 22',
    dusunId: 'dusun-2',
    dusunNama: 'Dusun Mekarsari',
    rt: '002',
    rw: '002',
    statusVerifikasi: 'perlu_perbaikan',
    nomorIdentifikasiInternal: 'DPT-2026-010',
    catatanVerifikasi: 'Alamat tinggal terdaftar ganda di RT tetangga, menunggu konfirmasi.',
    verifiedBy: 'Administrator Desa',
    verifiedAt: '2026-02-09T13:10:00.000Z',
    createdAt: '2026-01-27T09:15:00.000Z',
    updatedAt: '2026-02-09T13:10:00.000Z',
    createdBy: 'Operator KPPS / DPT',
  },
  {
    id: 'voter-11',
    nik: '3211012801750011',
    noKk: '3211010506990042',
    namaLengkap: 'Bambang Hermanto',
    tempatLahir: 'Sumedang',
    tanggalLahir: '1975-01-28',
    jenisKelamin: 'L',
    statusPerkawinan: 'S',
    alamat: 'Gg. Kamboja No. 05',
    dusunId: 'dusun-2',
    dusunNama: 'Dusun Mekarsari',
    rt: '003',
    rw: '002',
    statusVerifikasi: 'sudah_diverifikasi',
    nomorIdentifikasiInternal: 'DPT-2026-011',
    verifiedBy: 'Administrator Desa',
    verifiedAt: '2026-02-10T14:00:00.000Z',
    createdAt: '2026-01-28T10:00:00.000Z',
    updatedAt: '2026-02-10T14:00:00.000Z',
    createdBy: 'Operator KPPS / DPT',
  },
  {
    id: 'voter-12',
    nik: '3211016010090012',
    noKk: '3211010506990042',
    namaLengkap: 'Tri Utami',
    tempatLahir: 'Sumedang',
    tanggalLahir: '2009-10-20',
    jenisKelamin: 'P',
    statusPerkawinan: 'B',
    alamat: 'Gg. Kamboja No. 07',
    dusunId: 'dusun-2',
    dusunNama: 'Dusun Mekarsari',
    rt: '003',
    rw: '002',
    statusVerifikasi: 'belum_diverifikasi',
    nomorIdentifikasiInternal: 'DPT-2026-012',
    keterangan: 'Pemilih pemula (genap 17 tahun sebelum pelaksanaan Pilkades)',
    createdAt: '2026-01-28T10:30:00.000Z',
    updatedAt: '2026-01-28T10:30:00.000Z',
    createdBy: 'Operator KPPS / DPT',
  },
];

// Initial default logs
export const DEFAULT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-01-20T08:15:00.000Z',
    userId: 'user-operator',
    userName: 'Operator KPPS / DPT',
    userRole: 'operator',
    action: 'tambah_warga',
    description: 'Menambahkan data warga baru: Budi Santoso (RT 001 / RW 001)',
  },
  {
    id: 'log-2',
    timestamp: '2026-02-01T10:00:00.000Z',
    userId: 'user-admin',
    userName: 'Administrator Desa',
    userRole: 'admin',
    action: 'verifikasi_warga',
    description: 'Mengubah status verifikasi Budi Santoso menjadi Sudah Diverifikasi',
  },
  {
    id: 'log-3',
    timestamp: '2026-02-05T14:20:00.000Z',
    userId: 'user-admin',
    userName: 'Administrator Desa',
    userRole: 'admin',
    action: 'verifikasi_warga',
    description: 'Mengubah status verifikasi Hendra Wijaya menjadi Perlu Perbaikan',
  },
];

// Subscriber listeners
const listeners = new Set<() => void>();
const notifySubscribers = () => {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Error in storage subscriber listener:', e);
    }
  });
};

function readItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

function writeItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifySubscribers();
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
    throw new Error(`Gagal menyimpan data ke penyimpanan lokal.`);
  }
}

// Normalization utilities
export function normalizeName(name: string): string {
  return name.replace(/\s+/g, ' ').trim();
}

export function normalizeCode(code: string | number): string {
  const str = String(code).trim();
  if (!str) return '001';
  return /^\d+$/.test(str) ? str.padStart(3, '0') : str;
}

export const StorageService = {
  subscribeToStorage(callback: () => void): () => void {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },

  // ==================== DUSUN OPERATIONS ====================
  getDusuns(): Dusun[] {
    const saved = readItem<Dusun[]>(STORAGE_KEYS.DUSUNS, []);
    if (saved && saved.length > 0) {
      return saved;
    }
    // Backward compatibility: If no Dusun in storage, check RWs or initialize default
    const rws = this.getRWs();
    const dusunsFromRW: Dusun[] = [];
    const seenNames = new Set<string>();

    rws.forEach((rw, idx) => {
      // If RW has dusunNama or "Dusun X" in nama
      let dusunNama = rw.dusunNama;
      if (!dusunNama && rw.nama.includes('Dusun')) {
        const parts = rw.nama.split('-');
        dusunNama = parts.length > 1 ? parts[1].trim() : rw.nama;
      }
      if (dusunNama && !seenNames.has(dusunNama.toLowerCase())) {
        seenNames.add(dusunNama.toLowerCase());
        dusunsFromRW.push({
          id: rw.dusunId || `dusun-${idx + 1}`,
          nama: dusunNama,
          keterangan: rw.keterangan || `Wilayah ${dusunNama}`,
          isActive: rw.isActive,
          createdAt: new Date().toISOString(),
        });
      }
    });

    const finalDusuns = dusunsFromRW.length > 0 ? dusunsFromRW : DEFAULT_DUSUNS;
    writeItem(STORAGE_KEYS.DUSUNS, finalDusuns);
    return finalDusuns;
  },

  saveDusuns(dusuns: Dusun[]): void {
    writeItem(STORAGE_KEYS.DUSUNS, dusuns);
  },

  addDusun(data: { nama: string; keterangan?: string }, user: User): Dusun {
    if (!user || user.role !== 'admin') {
      throw new Error('Hanya Administrator yang memiliki hak akses untuk menambah wilayah dusun.');
    }

    const cleanNama = normalizeName(data.nama);
    if (!cleanNama) {
      throw new Error('Nama dusun tidak boleh kosong atau hanya berisi spasi.');
    }

    const dusuns = this.getDusuns();
    const duplicate = dusuns.find(
      (d) => d.nama.toLowerCase() === cleanNama.toLowerCase()
    );
    if (duplicate) {
      throw new Error(`Dusun dengan nama "${cleanNama}" sudah terdaftar.`);
    }

    const newDusun: Dusun = {
      id: `dusun-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      nama: cleanNama,
      keterangan: data.keterangan ? normalizeName(data.keterangan) : '',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.saveDusuns([...dusuns, newDusun]);
    this.addAuditLog({
      userId: user.id,
      userName: user.nama,
      userRole: user.role,
      action: 'kelola_wilayah',
      description: `Menambahkan wilayah dusun baru: ${cleanNama}`,
    });

    return newDusun;
  },

  updateDusun(
    id: string,
    data: { nama: string; keterangan?: string },
    user: User
  ): Dusun {
    if (!user || user.role !== 'admin') {
      throw new Error('Hanya Administrator yang memiliki hak akses untuk mengubah wilayah dusun.');
    }

    const cleanNama = normalizeName(data.nama);
    if (!cleanNama) {
      throw new Error('Nama dusun tidak boleh kosong atau hanya berisi spasi.');
    }

    const dusuns = this.getDusuns();
    const targetIdx = dusuns.findIndex((d) => d.id === id);
    if (targetIdx === -1) {
      throw new Error('Data dusun tidak ditemukan.');
    }

    // Check duplicate name with other dusuns
    const duplicate = dusuns.find(
      (d) => d.id !== id && d.nama.toLowerCase() === cleanNama.toLowerCase()
    );
    if (duplicate) {
      throw new Error(`Dusun dengan nama "${cleanNama}" sudah digunakan oleh wilayah lain.`);
    }

    const currentDusun = dusuns[targetIdx];
    const oldNama = currentDusun.nama;

    const updatedDusun: Dusun = {
      ...currentDusun,
      nama: cleanNama,
      keterangan: data.keterangan !== undefined ? normalizeName(data.keterangan) : currentDusun.keterangan,
      updatedAt: new Date().toISOString(),
    };

    dusuns[targetIdx] = updatedDusun;
    this.saveDusuns(dusuns);

    // Update child RWs that reference this dusun so names stay consistent
    const rws = this.getRWs();
    let rwUpdated = false;
    const updatedRWs = rws.map((rw) => {
      if (rw.dusunId === id || rw.dusunNama === oldNama) {
        rwUpdated = true;
        return {
          ...rw,
          dusunId: id,
          dusunNama: cleanNama,
          // If name contains the old dusun name, update gracefully
          nama: rw.nama.replace(oldNama, cleanNama),
        };
      }
      return rw;
    });

    if (rwUpdated) {
      this.saveRWs(updatedRWs);
    }

    this.addAuditLog({
      userId: user.id,
      userName: user.nama,
      userRole: user.role,
      action: 'kelola_wilayah',
      description: `Mengubah nama dusun dari "${oldNama}" menjadi "${cleanNama}". Seluruh relasi RW, RT, dan pemilih dipertahankan aman.`,
    });

    return updatedDusun;
  },

  canDeleteDusun(id: string): TerritoryRelationCheck {
    const dusuns = this.getDusuns();
    const dusun = dusuns.find((d) => d.id === id);
    if (!dusun) {
      return {
        canDelete: false,
        childRWCount: 0,
        childRTCount: 0,
        voterCount: 0,
        reason: 'Data dusun tidak ditemukan.',
      };
    }

    const rws = this.getRWs().filter(
      (rw) => rw.dusunId === id || rw.dusunNama === dusun.nama
    );
    const rwNomors = new Set(rws.map((rw) => rw.nomor));

    const rts = this.getRTs().filter(
      (rt) => rt.dusunId === id || rwNomors.has(rt.rwNomor)
    );
    const rtNomors = new Set(rts.map((rt) => `${rt.rwNomor}-${rt.nomor}`));

    const voters = this.getVoters().filter(
      (v) =>
        rwNomors.has(v.rw) ||
        rtNomors.has(`${v.rw}-${v.rt}`) ||
        (v.alamat && v.alamat.toLowerCase().includes(dusun.nama.toLowerCase()))
    );

    const childRWCount = rws.length;
    const childRTCount = rts.length;
    const voterCount = voters.length;

    if (childRWCount > 0 || childRTCount > 0 || voterCount > 0) {
      const parts: string[] = [];
      if (childRWCount > 0) parts.push(`${childRWCount} RW`);
      if (childRTCount > 0) parts.push(`${childRTCount} RT`);
      if (voterCount > 0) parts.push(`${voterCount} data pemilih`);

      return {
        canDelete: false,
        childRWCount,
        childRTCount,
        voterCount,
        reason: `Dusun "${dusun.nama}" tidak dapat dihapus karena masih memiliki relasi aktif: ${parts.join(', ')}. Data pemilih dilindungi undang-undang dan tidak boleh dihapus atau dipindahkan secara otomatis.`,
        details: { rws, rts, votersSample: voters.slice(0, 5) },
      };
    }

    return {
      canDelete: true,
      childRWCount: 0,
      childRTCount: 0,
      voterCount: 0,
      reason: 'Aman untuk dihapus. Tidak ada RW, RT, atau data pemilih yang terhubung.',
    };
  },

  deleteDusun(id: string, user: User): boolean {
    if (!user || user.role !== 'admin') {
      throw new Error('Hanya Administrator yang memiliki hak akses untuk menghapus wilayah dusun.');
    }

    const check = this.canDeleteDusun(id);
    if (!check.canDelete) {
      throw new Error(check.reason);
    }

    const dusuns = this.getDusuns();
    const dusun = dusuns.find((d) => d.id === id);
    if (!dusun) {
      throw new Error('Data dusun tidak ditemukan.');
    }

    const filtered = dusuns.filter((d) => d.id !== id);
    this.saveDusuns(filtered);

    this.addAuditLog({
      userId: user.id,
      userName: user.nama,
      userRole: user.role,
      action: 'kelola_wilayah',
      description: `Menghapus wilayah dusun "${dusun.nama}" (ID: ${dusun.id}). Pemeriksaan relasi aman (0 RW, 0 RT, 0 pemilih).`,
    });

    return true;
  },

  toggleDusunActive(id: string, user: User): void {
    if (!user || user.role !== 'admin') {
      throw new Error('Hanya Administrator yang memiliki hak akses untuk mengubah status wilayah.');
    }
    const dusuns = this.getDusuns();
    const d = dusuns.find((item) => item.id === id);
    if (d) {
      d.isActive = !d.isActive;
      this.saveDusuns([...dusuns]);
      this.addAuditLog({
        userId: user.id,
        userName: user.nama,
        userRole: user.role,
        action: 'kelola_wilayah',
        description: `Mengubah status dusun "${d.nama}" menjadi ${d.isActive ? 'Aktif' : 'Nonaktif'}`,
      });
    }
  },

  // ==================== RW OPERATIONS ====================
  getRWs(): RW[] {
    const rws = readItem<RW[]>(STORAGE_KEYS.RWS, DEFAULT_RWS);
    // Ensure every RW has dusunId attached
    const dusuns = readItem<Dusun[]>(STORAGE_KEYS.DUSUNS, DEFAULT_DUSUNS);
    let modified = false;
    const enriched = rws.map((rw) => {
      if (!rw.dusunId && dusuns.length > 0) {
        // try to match by dusun name inside rw.nama
        const matched = dusuns.find((d) =>
          rw.nama.toLowerCase().includes(d.nama.toLowerCase())
        );
        if (matched) {
          modified = true;
          return { ...rw, dusunId: matched.id, dusunNama: matched.nama };
        }
      }
      return rw;
    });

    if (modified) {
      writeItem(STORAGE_KEYS.RWS, enriched);
    }
    return enriched;
  },

  saveRWs(rws: RW[]): void {
    writeItem(STORAGE_KEYS.RWS, rws);
  },

  addRW(
    data: { nomor: string; nama?: string; dusunId?: string; keterangan?: string },
    user: User
  ): RW {
    if (!user || user.role !== 'admin') {
      throw new Error('Hanya Administrator yang memiliki hak akses untuk menambah RW.');
    }

    const nomor = normalizeCode(data.nomor);
    const rws = this.getRWs();

    if (rws.some((rw) => rw.nomor === nomor)) {
      throw new Error(`RW ${nomor} sudah terdaftar sebelumnya.`);
    }

    const dusuns = this.getDusuns();
    const parentDusun = data.dusunId
      ? dusuns.find((d) => d.id === data.dusunId)
      : dusuns[0];

    const cleanNama = data.nama ? normalizeName(data.nama) : `RW ${nomor}`;

    const newRW: RW = {
      id: `rw-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      nomor,
      nama: cleanNama,
      dusunId: parentDusun?.id,
      dusunNama: parentDusun?.nama,
      isActive: true,
      keterangan: data.keterangan ? normalizeName(data.keterangan) : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.saveRWs([...rws, newRW]);
    this.addAuditLog({
      userId: user.id,
      userName: user.nama,
      userRole: user.role,
      action: 'kelola_wilayah',
      description: `Menambahkan wilayah RW baru: ${newRW.nama} (Dusun: ${parentDusun?.nama || '-'})`,
    });

    return newRW;
  },

  updateRW(
    id: string,
    data: { nomor: string; nama: string; dusunId?: string; keterangan?: string },
    user: User
  ): RW {
    if (!user || user.role !== 'admin') {
      throw new Error('Hanya Administrator yang memiliki hak akses untuk mengubah RW.');
    }

    const cleanNama = normalizeName(data.nama);
    if (!cleanNama) {
      throw new Error('Nama RW tidak boleh kosong atau hanya berisi spasi.');
    }

    const newNomor = normalizeCode(data.nomor);
    if (!newNomor) {
      throw new Error('Nomor RW wajib diisi.');
    }

    const rws = this.getRWs();
    const targetIdx = rws.findIndex((r) => r.id === id);
    if (targetIdx === -1) {
      throw new Error('Data RW tidak ditemukan.');
    }

    // Duplicate check: nomor RW must be unique among RWs
    const duplicate = rws.find((r) => r.id !== id && r.nomor === newNomor);
    if (duplicate) {
      throw new Error(`Nomor RW ${newNomor} sudah digunakan oleh wilayah "${duplicate.nama}".`);
    }

    const currentRW = rws[targetIdx];
    const oldNomor = currentRW.nomor;
    const oldNama = currentRW.nama;

    const dusuns = this.getDusuns();
    const parentDusun = data.dusunId
      ? dusuns.find((d) => d.id === data.dusunId)
      : dusuns.find((d) => d.id === currentRW.dusunId) || dusuns[0];

    const updatedRW: RW = {
      ...currentRW,
      nomor: newNomor,
      nama: cleanNama,
      dusunId: parentDusun?.id,
      dusunNama: parentDusun?.nama,
      keterangan: data.keterangan !== undefined ? normalizeName(data.keterangan) : currentRW.keterangan,
      updatedAt: new Date().toISOString(),
    };

    rws[targetIdx] = updatedRW;
    this.saveRWs(rws);

    // If RW nomor was changed, atomic cascade update child RTs and Voters
    if (oldNomor !== newNomor) {
      const rts = this.getRTs();
      const updatedRTs = rts.map((rt) => {
        if (rt.rwNomor === oldNomor || rt.rwId === id) {
          return {
            ...rt,
            rwNomor: newNomor,
            rwId: id,
            dusunId: parentDusun?.id,
            nama: rt.nama.replace(`/ RW ${oldNomor}`, `/ RW ${newNomor}`),
          };
        }
        return rt;
      });
      this.saveRTs(updatedRTs);

      const voters = this.getVoters();
      let voterCount = 0;
      const updatedVoters = voters.map((v) => {
        if (v.rw === oldNomor) {
          voterCount++;
          return {
            ...v,
            rw: newNomor,
            updatedAt: new Date().toISOString(),
          };
        }
        return v;
      });
      if (voterCount > 0) {
        writeItem(STORAGE_KEYS.VOTERS, updatedVoters);
      }
    }

    this.addAuditLog({
      userId: user.id,
      userName: user.nama,
      userRole: user.role,
      action: 'kelola_wilayah',
      description: `Memperbarui data RW: "${oldNama}" (${oldNomor}) menjadi "${cleanNama}" (${newNomor}). Relasi RT dan pemilih tetap utuh.`,
    });

    return updatedRW;
  },

  canDeleteRW(id: string): TerritoryRelationCheck {
    const rws = this.getRWs();
    const rw = rws.find((r) => r.id === id);
    if (!rw) {
      return {
        canDelete: false,
        childRWCount: 0,
        childRTCount: 0,
        voterCount: 0,
        reason: 'Data RW tidak ditemukan.',
      };
    }

    const rts = this.getRTs().filter(
      (rt) => rt.rwNomor === rw.nomor || rt.rwId === rw.id
    );
    const voters = this.getVoters().filter((v) => v.rw === rw.nomor);

    const childRTCount = rts.length;
    const voterCount = voters.length;

    if (childRTCount > 0 || voterCount > 0) {
      const parts: string[] = [];
      if (childRTCount > 0) parts.push(`${childRTCount} RT`);
      if (voterCount > 0) parts.push(`${voterCount} data pemilih`);

      return {
        canDelete: false,
        childRWCount: 0,
        childRTCount,
        voterCount,
        reason: `RW ${rw.nomor} ("${rw.nama}") tidak dapat dihapus karena masih memiliki relasi aktif: ${parts.join(', ')}. Data pemilih dilindungi dan tidak boleh dihapus atau dipindahkan secara otomatis.`,
        details: { rts, votersSample: voters.slice(0, 5) },
      };
    }

    return {
      canDelete: true,
      childRWCount: 0,
      childRTCount: 0,
      voterCount: 0,
      reason: `Aman untuk dihapus. Tidak ada RT atau data pemilih yang terhubung ke RW ${rw.nomor}.`,
    };
  },

  deleteRW(id: string, user: User): boolean {
    if (!user || user.role !== 'admin') {
      throw new Error('Hanya Administrator yang memiliki hak akses untuk menghapus RW.');
    }

    const check = this.canDeleteRW(id);
    if (!check.canDelete) {
      throw new Error(check.reason);
    }

    const rws = this.getRWs();
    const rw = rws.find((r) => r.id === id);
    if (!rw) {
      throw new Error('Data RW tidak ditemukan.');
    }

    const filtered = rws.filter((r) => r.id !== id);
    this.saveRWs(filtered);

    this.addAuditLog({
      userId: user.id,
      userName: user.nama,
      userRole: user.role,
      action: 'kelola_wilayah',
      description: `Menghapus RW ${rw.nomor} ("${rw.nama}"). Relasi aman (0 RT, 0 data pemilih).`,
    });

    return true;
  },

  toggleRWActive(id: string, user: User): void {
    if (!user || user.role !== 'admin') {
      throw new Error('Hanya Administrator yang memiliki hak akses untuk mengubah status wilayah.');
    }
    const rws = this.getRWs();
    const r = rws.find((item) => item.id === id);
    if (r) {
      r.isActive = !r.isActive;
      this.saveRWs([...rws]);
      this.addAuditLog({
        userId: user.id,
        userName: user.nama,
        userRole: user.role,
        action: 'kelola_wilayah',
        description: `Mengubah status RW ${r.nomor} menjadi ${r.isActive ? 'Aktif' : 'Nonaktif'}`,
      });
    }
  },

  // ==================== RT OPERATIONS ====================
  getRTs(): RT[] {
    return readItem<RT[]>(STORAGE_KEYS.RTS, DEFAULT_RTS);
  },

  saveRTs(rts: RT[]): void {
    writeItem(STORAGE_KEYS.RTS, rts);
  },

  addRT(
    data: { nomor: string; rwNomor: string; nama?: string; keterangan?: string },
    user: User
  ): RT {
    if (!user || user.role !== 'admin') {
      throw new Error('Hanya Administrator yang memiliki hak akses untuk menambah RT.');
    }

    const nomor = normalizeCode(data.nomor);
    const rwNomor = normalizeCode(data.rwNomor);

    if (!nomor || !rwNomor) {
      throw new Error('Nomor RT dan RW induk wajib dipilih dan diisi.');
    }

    const rts = this.getRTs();
    if (rts.some((rt) => rt.nomor === nomor && rt.rwNomor === rwNomor)) {
      throw new Error(`RT ${nomor} pada RW ${rwNomor} sudah terdaftar.`);
    }

    const rws = this.getRWs();
    const parentRW = rws.find((rw) => rw.nomor === rwNomor);

    const cleanNama = data.nama ? normalizeName(data.nama) : `RT ${nomor} / RW ${rwNomor}`;

    const newRT: RT = {
      id: `rt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      nomor,
      rwNomor,
      rwId: parentRW?.id,
      dusunId: parentRW?.dusunId,
      nama: cleanNama,
      isActive: true,
      keterangan: data.keterangan ? normalizeName(data.keterangan) : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.saveRTs([...rts, newRT]);
    this.addAuditLog({
      userId: user.id,
      userName: user.nama,
      userRole: user.role,
      action: 'kelola_wilayah',
      description: `Menambahkan wilayah RT baru: RT ${nomor} pada RW ${rwNomor}`,
    });

    return newRT;
  },

  updateRT(
    id: string,
    data: { nomor: string; rwNomor: string; nama: string; keterangan?: string },
    user: User
  ): RT {
    if (!user || user.role !== 'admin') {
      throw new Error('Hanya Administrator yang memiliki hak akses untuk mengubah RT.');
    }

    const cleanNama = normalizeName(data.nama);
    if (!cleanNama) {
      throw new Error('Nama RT tidak boleh kosong atau hanya berisi spasi.');
    }

    const newNomor = normalizeCode(data.nomor);
    const newRwNomor = normalizeCode(data.rwNomor);

    if (!newNomor || !newRwNomor) {
      throw new Error('Nomor RT dan RW induk wajib diisi.');
    }

    const rts = this.getRTs();
    const targetIdx = rts.findIndex((rt) => rt.id === id);
    if (targetIdx === -1) {
      throw new Error('Data RT tidak ditemukan.');
    }

    // Duplicate check: within the same RW induk, RT nomor cannot be duplicated
    const duplicate = rts.find(
      (rt) => rt.id !== id && rt.nomor === newNomor && rt.rwNomor === newRwNomor
    );
    if (duplicate) {
      throw new Error(`RT ${newNomor} pada RW ${newRwNomor} sudah ada.`);
    }

    const currentRT = rts[targetIdx];
    const oldNomor = currentRT.nomor;
    const oldRwNomor = currentRT.rwNomor;
    const oldNama = currentRT.nama;

    const rws = this.getRWs();
    const parentRW = rws.find((rw) => rw.nomor === newRwNomor);

    const updatedRT: RT = {
      ...currentRT,
      nomor: newNomor,
      rwNomor: newRwNomor,
      rwId: parentRW?.id || currentRT.rwId,
      dusunId: parentRW?.dusunId || currentRT.dusunId,
      nama: cleanNama,
      keterangan: data.keterangan !== undefined ? normalizeName(data.keterangan) : currentRT.keterangan,
      updatedAt: new Date().toISOString(),
    };

    rts[targetIdx] = updatedRT;
    this.saveRTs(rts);

    // If nomor or rwNomor changed, cascade update voter records matching the old RT/RW
    if (oldNomor !== newNomor || oldRwNomor !== newRwNomor) {
      const voters = this.getVoters();
      let affected = 0;
      const updatedVoters = voters.map((v) => {
        if (v.rt === oldNomor && v.rw === oldRwNomor) {
          affected++;
          return {
            ...v,
            rt: newNomor,
            rw: newRwNomor,
            updatedAt: new Date().toISOString(),
          };
        }
        return v;
      });

      if (affected > 0) {
        writeItem(STORAGE_KEYS.VOTERS, updatedVoters);
      }
    }

    this.addAuditLog({
      userId: user.id,
      userName: user.nama,
      userRole: user.role,
      action: 'kelola_wilayah',
      description: `Memperbarui data RT: "${oldNama}" (${oldNomor}/RW ${oldRwNomor}) menjadi "${cleanNama}" (${newNomor}/RW ${newRwNomor}).`,
    });

    return updatedRT;
  },

  canDeleteRT(id: string): TerritoryRelationCheck {
    const rts = this.getRTs();
    const rt = rts.find((r) => r.id === id);
    if (!rt) {
      return {
        canDelete: false,
        childRWCount: 0,
        childRTCount: 0,
        voterCount: 0,
        reason: 'Data RT tidak ditemukan.',
      };
    }

    const voters = this.getVoters().filter(
      (v) => v.rt === rt.nomor && v.rw === rt.rwNomor
    );
    const voterCount = voters.length;

    if (voterCount > 0) {
      return {
        canDelete: false,
        childRWCount: 0,
        childRTCount: 0,
        voterCount,
        reason: `RT ${rt.nomor} (RW ${rt.rwNomor}) tidak dapat dihapus karena masih terdapat ${voterCount} data pemilih yang terdaftar di RT ini. Data pemilih dilindungi dan tidak boleh dihapus secara otomatis.`,
        details: { votersSample: voters.slice(0, 5) },
      };
    }

    return {
      canDelete: true,
      childRWCount: 0,
      childRTCount: 0,
      voterCount: 0,
      reason: `Aman untuk dihapus. Tidak ada data pemilih yang terdaftar di RT ${rt.nomor} (RW ${rt.rwNomor}).`,
    };
  },

  deleteRT(id: string, user: User): boolean {
    if (!user || user.role !== 'admin') {
      throw new Error('Hanya Administrator yang memiliki hak akses untuk menghapus RT.');
    }

    const check = this.canDeleteRT(id);
    if (!check.canDelete) {
      throw new Error(check.reason);
    }

    const rts = this.getRTs();
    const rt = rts.find((r) => r.id === id);
    if (!rt) {
      throw new Error('Data RT tidak ditemukan.');
    }

    const filtered = rts.filter((r) => r.id !== id);
    this.saveRTs(filtered);

    this.addAuditLog({
      userId: user.id,
      userName: user.nama,
      userRole: user.role,
      action: 'kelola_wilayah',
      description: `Menghapus RT ${rt.nomor} (RW ${rt.rwNomor}). Integritas relasi aman (0 pemilih).`,
    });

    return true;
  },

  toggleRTActive(id: string, user: User): void {
    if (!user || user.role !== 'admin') {
      throw new Error('Hanya Administrator yang memiliki hak akses untuk mengubah status wilayah.');
    }
    const rts = this.getRTs();
    const r = rts.find((item) => item.id === id);
    if (r) {
      r.isActive = !r.isActive;
      this.saveRTs([...rts]);
      this.addAuditLog({
        userId: user.id,
        userName: user.nama,
        userRole: user.role,
        action: 'kelola_wilayah',
        description: `Mengubah status RT ${r.nomor} (RW ${r.rwNomor}) menjadi ${r.isActive ? 'Aktif' : 'Nonaktif'}`,
      });
    }
  },

  // ==================== TPS (TEMPAT PEMUNGUTAN SUARA) OPERATIONS ====================
  getTPS(): TPS[] {
    const saved = readItem<TPS[]>(STORAGE_KEYS.TPS, []);
    if (saved && saved.length > 0) {
      return saved;
    }
    writeItem(STORAGE_KEYS.TPS, DEFAULT_TPS);
    return DEFAULT_TPS;
  },

  getTPSById(id: string): TPS | undefined {
    return this.getTPS().find((t) => t.id === id);
  },

  saveTPS(tpsList: TPS[]): void {
    writeItem(STORAGE_KEYS.TPS, tpsList);
  },

  checkDuplicateCoordinates(
    lat: number,
    lng: number,
    excludeTpsId?: string
  ): { isDuplicate: boolean; isTooClose: boolean; matchedTps?: TPS; distanceMeters?: number; message?: string } {
    const list = this.getTPS();
    for (const tps of list) {
      if (excludeTpsId && tps.id === excludeTpsId) continue;
      if (typeof tps.latitude !== 'number' || typeof tps.longitude !== 'number') continue;

      // Calculate haversine distance in meters
      const lat1 = (lat * Math.PI) / 180;
      const lat2 = (tps.latitude * Math.PI) / 180;
      const dLat = ((tps.latitude - lat) * Math.PI) / 180;
      const dLng = ((tps.longitude - lng) * Math.PI) / 180;

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = Math.round(6371000 * c);

      if (distance < 15) {
        return {
          isDuplicate: true,
          isTooClose: true,
          matchedTps: tps,
          distanceMeters: distance,
          message: `Koordinat hampir persis sama (${distance} m) dengan ${tps.nama} (${tps.nomor}). Periksa kembali apakah ini lokasi yang sama.`,
        };
      }
      if (distance < 60) {
        return {
          isDuplicate: false,
          isTooClose: true,
          matchedTps: tps,
          distanceMeters: distance,
          message: `Jarak sangat dekat (${distance} m) dengan ${tps.nama} (${tps.nomor}). Pastikan lokasi tidak tumpang tindih.`,
        };
      }
    }
    return { isDuplicate: false, isTooClose: false };
  },

  addTPS(
    data: Omit<TPS, 'id' | 'createdAt' | 'updatedAt'>,
    user: User
  ): TPS {
    if (!user || (user.role !== 'admin' && user.role !== 'operator')) {
      throw new Error('Hanya Administrator atau Operator yang dapat menambah TPS.');
    }

    const cleanNomor = normalizeCode(data.nomor);
    const cleanNama = normalizeName(data.nama);
    const cleanTempat = normalizeName(data.namaTempat || cleanNama);

    if (!cleanNomor) throw new Error('Nomor TPS wajib diisi.');
    if (!cleanNama) throw new Error('Nama TPS wajib diisi.');

    const allTPS = this.getTPS();
    const duplicate = allTPS.find(
      (t) => normalizeCode(t.nomor) === cleanNomor
    );
    if (duplicate) {
      throw new Error(`Nomor TPS ${cleanNomor} sudah ada ("${duplicate.nama}"). Gunakan nomor TPS lain.`);
    }

    const now = new Date().toISOString();
    const newTPS: TPS = {
      ...data,
      id: `tps-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      nomor: cleanNomor,
      nama: cleanNama,
      namaTempat: cleanTempat,
      alamat: normalizeName(data.alamat || ''),
      latitude: Number(data.latitude) || -6.8924,
      longitude: Number(data.longitude) || 107.9852,
      kapasitas: Number(data.kapasitas) || 300,
      aksesibilitas: normalizeName(data.aksesibilitas || 'Ramah disabilitas dan lansia'),
      status: data.status || 'ditetapkan',
      createdAt: now,
      updatedAt: now,
    };

    const updatedList = [...allTPS, newTPS];
    this.saveTPS(updatedList);

    this.addAuditLog({
      userId: user.id,
      userName: user.nama,
      userRole: user.role,
      action: 'tambah_tps',
      description: `Menambahkan TPS baru: ${newTPS.nomor} - "${newTPS.nama}" di ${newTPS.alamat} (${newTPS.latitude}, ${newTPS.longitude}).`,
    });

    return newTPS;
  },

  updateTPS(id: string, updates: Partial<TPS>, user: User): TPS {
    if (!user || (user.role !== 'admin' && user.role !== 'operator')) {
      throw new Error('Hanya Administrator atau Operator yang dapat memperbarui TPS.');
    }

    const allTPS = this.getTPS();
    const index = allTPS.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error('Data TPS tidak ditemukan.');
    }

    const existing = allTPS[index];
    const newNomor = updates.nomor ? normalizeCode(updates.nomor) : existing.nomor;

    // Duplicate number check if nomor changed
    if (newNomor !== existing.nomor) {
      const dup = allTPS.find((t) => t.id !== id && normalizeCode(t.nomor) === newNomor);
      if (dup) {
        throw new Error(`Nomor TPS ${newNomor} sudah digunakan oleh ${dup.nama}.`);
      }
    }

    const updatedTPS: TPS = {
      ...existing,
      ...updates,
      nomor: newNomor,
      nama: updates.nama ? normalizeName(updates.nama) : existing.nama,
      namaTempat: updates.namaTempat ? normalizeName(updates.namaTempat) : existing.namaTempat,
      alamat: updates.alamat ? normalizeName(updates.alamat) : existing.alamat,
      latitude: updates.latitude !== undefined ? Number(updates.latitude) : existing.latitude,
      longitude: updates.longitude !== undefined ? Number(updates.longitude) : existing.longitude,
      kapasitas: updates.kapasitas !== undefined ? Number(updates.kapasitas) : existing.kapasitas,
      aksesibilitas: updates.aksesibilitas ? normalizeName(updates.aksesibilitas) : existing.aksesibilitas,
      status: updates.status || existing.status,
      updatedAt: new Date().toISOString(),
    };

    allTPS[index] = updatedTPS;
    this.saveTPS(allTPS);

    // If nomor TPS changed, update related voters display
    if (newNomor !== existing.nomor) {
      const rawVoters = readItem<Voter[]>(STORAGE_KEYS.VOTERS, DEFAULT_VOTERS);
      let count = 0;
      const updatedVoters = rawVoters.map((v) => {
        if (v.tpsId === id) {
          count++;
          return { ...v, tpsNomor: newNomor };
        }
        return v;
      });
      if (count > 0) {
        writeItem(STORAGE_KEYS.VOTERS, updatedVoters);
      }
    }

    this.addAuditLog({
      userId: user.id,
      userName: user.nama,
      userRole: user.role,
      action: 'edit_tps',
      description: `Memperbarui data TPS ${updatedTPS.nomor} ("${updatedTPS.nama}").`,
    });

    return updatedTPS;
  },

  canDeleteTPS(id: string): TpsRelationCheck {
    const tps = this.getTPSById(id);
    if (!tps) {
      return { canDelete: false, voterCount: 0, reason: 'Data TPS tidak ditemukan.' };
    }

    const voters = this.getVoters().filter((v) => v.tpsId === id);
    if (voters.length > 0) {
      return {
        canDelete: false,
        voterCount: voters.length,
        reason: `TPS ${tps.nomor} ("${tps.nama}") tidak dapat dihapus karena masih ada ${voters.length} pemilih yang terdaftar di TPS ini. Harap pindahkan alokasi pemilih terlebih dahulu demi menjaga integritas data.`,
        sampleVoters: voters.slice(0, 5),
      };
    }

    return {
      canDelete: true,
      voterCount: 0,
      reason: `Aman untuk dihapus. Tidak ada pemilih yang terhubung ke TPS ${tps.nomor}.`,
    };
  },

  deleteTPS(id: string, user: User): boolean {
    if (!user || user.role !== 'admin') {
      throw new Error('Hanya Administrator yang memiliki wewenang untuk menghapus TPS.');
    }

    const check = this.canDeleteTPS(id);
    if (!check.canDelete) {
      throw new Error(check.reason);
    }

    const allTPS = this.getTPS();
    const tps = allTPS.find((t) => t.id === id);
    if (!tps) throw new Error('Data TPS tidak ditemukan.');

    const filtered = allTPS.filter((t) => t.id !== id);
    this.saveTPS(filtered);

    this.addAuditLog({
      userId: user.id,
      userName: user.nama,
      userRole: user.role,
      action: 'hapus_tps',
      description: `Menghapus TPS ${tps.nomor} - "${tps.nama}". Relasi data pemilih aman (0 pemilih).`,
    });

    return true;
  },

  assignVoterToTPS(voterId: string, tpsId: string | undefined, user: User): boolean {
    const rawVoters = readItem<Voter[]>(STORAGE_KEYS.VOTERS, DEFAULT_VOTERS);
    const voter = rawVoters.find((v) => v.id === voterId);
    if (!voter) throw new Error('Data pemilih tidak ditemukan.');

    let tpsNomor: string | undefined = undefined;
    let tpsNama = 'Belum Ditetapkan';

    if (tpsId) {
      const tps = this.getTPSById(tpsId);
      if (!tps) throw new Error('TPS tujuan tidak ditemukan.');
      tpsNomor = tps.nomor;
      tpsNama = `TPS ${tps.nomor} - ${tps.nama}`;
    }

    const updatedVoters = rawVoters.map((v) => {
      if (v.id === voterId) {
        return {
          ...v,
          tpsId: tpsId || undefined,
          tpsNomor,
          updatedAt: new Date().toISOString(),
          updatedBy: user.nama,
        };
      }
      return v;
    });

    writeItem(STORAGE_KEYS.VOTERS, updatedVoters);

    this.addAuditLog({
      userId: user.id,
      userName: user.nama,
      userRole: user.role,
      action: 'alokasi_tps',
      description: `Menetapkan pemilih "${voter.namaLengkap}" ke ${tpsNama}.`,
    });

    return true;
  },

  batchAssignVotersToTPS(voterIds: string[], tpsId: string | undefined, user: User): number {
    if (!voterIds.length) return 0;
    const rawVoters = readItem<Voter[]>(STORAGE_KEYS.VOTERS, DEFAULT_VOTERS);

    let tpsNomor: string | undefined = undefined;
    let tpsNama = 'Belum Ditetapkan';
    if (tpsId) {
      const tps = this.getTPSById(tpsId);
      if (tps) {
        tpsNomor = tps.nomor;
        tpsNama = `TPS ${tps.nomor} - ${tps.nama}`;
      }
    }

    const idSet = new Set(voterIds);
    let affectedCount = 0;
    const now = new Date().toISOString();

    const updated = rawVoters.map((v) => {
      if (idSet.has(v.id)) {
        affectedCount++;
        return {
          ...v,
          tpsId: tpsId || undefined,
          tpsNomor,
          updatedAt: now,
          updatedBy: user.nama,
        };
      }
      return v;
    });

    writeItem(STORAGE_KEYS.VOTERS, updated);

    this.addAuditLog({
      userId: user.id,
      userName: user.nama,
      userRole: user.role,
      action: 'alokasi_tps',
      description: `Penetapan massal ${affectedCount} pemilih ke ${tpsNama}.`,
    });

    return affectedCount;
  },

  autoAssignByTerritory(rw: string, rt: string | undefined, tpsId: string, user: User): number {
    const rawVoters = readItem<Voter[]>(STORAGE_KEYS.VOTERS, DEFAULT_VOTERS);
    const normRW = normalizeCode(rw);
    const normRT = rt ? normalizeCode(rt) : undefined;

    const targetVoters = rawVoters.filter((v) => {
      if (normalizeCode(v.rw) !== normRW) return false;
      if (normRT && normalizeCode(v.rt) !== normRT) return false;
      return true;
    });

    return this.batchAssignVotersToTPS(
      targetVoters.map((v) => v.id),
      tpsId,
      user
    );
  },

  // ==================== VOTER OPERATIONS ====================
  getVoters(): Voter[] {
    const rawVoters = readItem<Voter[]>(STORAGE_KEYS.VOTERS, DEFAULT_VOTERS);
    const settings = this.getSettings();
    const electionDate = settings.tanggalPelaksanaan;

    // Dynamically calculate age and preliminary eligibility status on election date
    // Without altering permanent core demographic data
    return rawVoters.map((v) => {
      const evalResult = evaluateVoterEligibility(v, electionDate);
      return {
        ...v,
        usiaPadaPilkades: evalResult.usiaPadaPilkades,
        kelayakanStatus: evalResult.status,
        alasanKelayakan: evalResult.alasan,
      };
    });
  },

  getVoterById(id: string): Voter | undefined {
    return this.getVoters().find((v) => v.id === id);
  },

  checkNikDuplicate(
    nik?: string,
    excludeVoterId?: string
  ): { isDuplicate: boolean; matchedVoter?: Voter; reason: string } {
    if (!nik || !nik.trim()) {
      return { isDuplicate: false, reason: '' };
    }
    const cleanNik = nik.trim();
    const rawVoters = readItem<Voter[]>(STORAGE_KEYS.VOTERS, DEFAULT_VOTERS);
    const matched = rawVoters.find(
      (v) => v.id !== excludeVoterId && v.nik && v.nik.trim() === cleanNik
    );

    if (matched) {
      return {
        isDuplicate: true,
        matchedVoter: matched,
        reason: `NIK ${cleanNik} sudah terdaftar atas nama "${matched.namaLengkap}" (RT ${matched.rt} / RW ${matched.rw}). NIK kependudukan harus bersifat tunggal/unik.`,
      };
    }

    return { isDuplicate: false, reason: '' };
  },

  checkPotentialDuplicate(data: {
    namaLengkap: string;
    alamat: string;
    rt: string;
    rw: string;
    excludeId?: string;
  }): { isDuplicate: boolean; matchedVoters: Voter[]; reason: string } {
    const voters = this.getVoters();
    const cleanName = data.namaLengkap.toLowerCase().replace(/[\s\-_.,/]+/g, ' ').trim();
    const cleanAddress = data.alamat.toLowerCase().replace(/[\s\-_.,/]+/g, ' ').trim();
    const normRT = normalizeCode(data.rt);
    const normRW = normalizeCode(data.rw);

    const matches = voters.filter((v) => {
      if (data.excludeId && v.id === data.excludeId) return false;
      const vName = v.namaLengkap.toLowerCase().replace(/[\s\-_.,/]+/g, ' ').trim();
      const vAddress = v.alamat.toLowerCase().replace(/[\s\-_.,/]+/g, ' ').trim();
      const vRT = normalizeCode(v.rt);
      const vRW = normalizeCode(v.rw);

      const sameTerritory = vRT === normRT && vRW === normRW;
      const sameName = vName === cleanName;
      const sameAddress =
        vAddress === cleanAddress ||
        vAddress.includes(cleanAddress) ||
        cleanAddress.includes(vAddress);

      return (sameName && sameTerritory) || (sameName && sameAddress);
    });

    if (matches.length > 0) {
      return {
        isDuplicate: true,
        matchedVoters: matches,
        reason: `Ditemukan ${matches.length} data dengan nama serupa di wilayah RT ${normRT} / RW ${normRW} atau alamat terkait.`,
      };
    }

    return {
      isDuplicate: false,
      matchedVoters: [],
      reason: '',
    };
  },

  addVoter(
    voterData: Omit<Voter, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'statusVerifikasi'>,
    user: User
  ): Voter {
    const rawVoters = readItem<Voter[]>(STORAGE_KEYS.VOTERS, DEFAULT_VOTERS);

    // Validate NIK if provided
    if (voterData.nik && voterData.nik.trim()) {
      const nikCheck = validateNik(voterData.nik);
      if (!nikCheck.isValid) {
        throw new Error(nikCheck.message);
      }
      const dupCheck = this.checkNikDuplicate(voterData.nik);
      if (dupCheck.isDuplicate) {
        throw new Error(dupCheck.reason);
      }
    }

    // Validate KK if provided
    if (voterData.noKk && voterData.noKk.trim()) {
      const kkCheck = validateKk(voterData.noKk);
      if (!kkCheck.isValid) {
        throw new Error(kkCheck.message);
      }
    }

    const cleanNama = normalizeName(voterData.namaLengkap);
    if (!cleanNama) {
      throw new Error('Nama lengkap pemilih wajib diisi.');
    }
    const cleanAlamat = normalizeName(voterData.alamat);
    if (!cleanAlamat) {
      throw new Error('Alamat domisili wajib diisi.');
    }

    const now = new Date().toISOString();
    const cleanTglLahir = voterData.tanggalLahir ? normalizeDateToISO(voterData.tanggalLahir) : undefined;

    const newVoter: Voter = {
      ...voterData,
      id: `voter-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      nik: voterData.nik ? voterData.nik.trim() : undefined,
      noKk: voterData.noKk ? voterData.noKk.trim() : undefined,
      namaLengkap: cleanNama,
      tempatLahir: voterData.tempatLahir ? normalizeName(voterData.tempatLahir) : undefined,
      tanggalLahir: cleanTglLahir,
      jenisKelamin: voterData.jenisKelamin,
      statusPerkawinan: voterData.statusPerkawinan,
      alamat: cleanAlamat,
      dusunId: voterData.dusunId,
      dusunNama: voterData.dusunNama,
      rt: normalizeCode(voterData.rt),
      rw: normalizeCode(voterData.rw),
      statusVerifikasi: 'belum_diverifikasi',
      createdAt: now,
      updatedAt: now,
      createdBy: user.nama,
    };

    const updated = [newVoter, ...rawVoters];
    writeItem(STORAGE_KEYS.VOTERS, updated);

    this.addAuditLog({
      userId: user.id,
      userName: user.nama,
      userRole: user.role,
      action: 'tambah_warga',
      description: `Menambahkan pemilih baru: ${newVoter.namaLengkap} ${newVoter.nik ? `(NIK: ${newVoter.nik})` : ''} di RT ${newVoter.rt}/RW ${newVoter.rw}`,
    });

    return newVoter;
  },

  addVotersBatch(
    newItems: Array<Omit<Voter, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>>,
    user: User
  ): number {
    const rawVoters = readItem<Voter[]>(STORAGE_KEYS.VOTERS, DEFAULT_VOTERS);
    const now = new Date().toISOString();

    const createdList: Voter[] = newItems.map((item, idx) => ({
      ...item,
      id: `voter-imp-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      nik: item.nik ? item.nik.trim() : undefined,
      noKk: item.noKk ? item.noKk.trim() : undefined,
      namaLengkap: normalizeName(item.namaLengkap),
      tempatLahir: item.tempatLahir ? normalizeName(item.tempatLahir) : undefined,
      tanggalLahir: item.tanggalLahir ? normalizeDateToISO(item.tanggalLahir) : undefined,
      jenisKelamin: item.jenisKelamin,
      statusPerkawinan: item.statusPerkawinan,
      alamat: normalizeName(item.alamat),
      dusunId: item.dusunId,
      dusunNama: item.dusunNama,
      rt: normalizeCode(item.rt),
      rw: normalizeCode(item.rw),
      statusVerifikasi: item.statusVerifikasi || 'belum_diverifikasi',
      createdAt: now,
      updatedAt: now,
      createdBy: user.nama,
    }));

    const combined = [...createdList, ...rawVoters];
    writeItem(STORAGE_KEYS.VOTERS, combined);

    this.addAuditLog({
      userId: user.id,
      userName: user.nama,
      userRole: user.role,
      action: 'impor_excel',
      description: `Mengimpor ${createdList.length} data pemilih melalui file Excel/CSV.`,
    });

    return createdList.length;
  },

  updateVoter(id: string, voterData: Partial<Voter>, user: User): Voter | null {
    const rawVoters = readItem<Voter[]>(STORAGE_KEYS.VOTERS, DEFAULT_VOTERS);
    const idx = rawVoters.findIndex((v) => v.id === id);
    if (idx === -1) return null;

    const existing = rawVoters[idx];

    // Check NIK uniqueness if changed
    if (voterData.nik && voterData.nik.trim() !== existing.nik) {
      const nikCheck = validateNik(voterData.nik);
      if (!nikCheck.isValid) {
        throw new Error(nikCheck.message);
      }
      const dupCheck = this.checkNikDuplicate(voterData.nik, id);
      if (dupCheck.isDuplicate) {
        throw new Error(dupCheck.reason);
      }
    }

    if (voterData.noKk && voterData.noKk.trim()) {
      const kkCheck = validateKk(voterData.noKk);
      if (!kkCheck.isValid) {
        throw new Error(kkCheck.message);
      }
    }

    const now = new Date().toISOString();
    const cleanTglLahir = voterData.tanggalLahir !== undefined
      ? normalizeDateToISO(voterData.tanggalLahir)
      : existing.tanggalLahir;

    const updated: Voter = {
      ...existing,
      ...voterData,
      nik: voterData.nik !== undefined ? voterData.nik.trim() || undefined : existing.nik,
      noKk: voterData.noKk !== undefined ? voterData.noKk.trim() || undefined : existing.noKk,
      namaLengkap: voterData.namaLengkap ? normalizeName(voterData.namaLengkap) : existing.namaLengkap,
      tempatLahir: voterData.tempatLahir !== undefined ? normalizeName(voterData.tempatLahir) : existing.tempatLahir,
      tanggalLahir: cleanTglLahir,
      jenisKelamin: voterData.jenisKelamin !== undefined ? voterData.jenisKelamin : existing.jenisKelamin,
      statusPerkawinan: voterData.statusPerkawinan !== undefined ? voterData.statusPerkawinan : existing.statusPerkawinan,
      dusunId: voterData.dusunId !== undefined ? voterData.dusunId : existing.dusunId,
      dusunNama: voterData.dusunNama !== undefined ? voterData.dusunNama : existing.dusunNama,
      alamat: voterData.alamat ? normalizeName(voterData.alamat) : existing.alamat,
      rt: voterData.rt ? normalizeCode(voterData.rt) : existing.rt,
      rw: voterData.rw ? normalizeCode(voterData.rw) : existing.rw,
      updatedAt: now,
      updatedBy: user.nama,
    };

    rawVoters[idx] = updated;
    writeItem(STORAGE_KEYS.VOTERS, rawVoters);

    this.addAuditLog({
      userId: user.id,
      userName: user.nama,
      userRole: user.role,
      action: 'edit_warga',
      description: `Memperbarui data warga: ${updated.namaLengkap} (ID: ${updated.id})`,
    });

    return updated;
  },

  updateVerification(
    id: string,
    status: Voter['statusVerifikasi'],
    catatan: string | undefined,
    user: User
  ): Voter | null {
    const voters = this.getVoters();
    const idx = voters.findIndex((v) => v.id === id);
    if (idx === -1) return null;

    const existing = voters[idx];
    const now = new Date().toISOString();

    const updated: Voter = {
      ...existing,
      statusVerifikasi: status,
      catatanVerifikasi: catatan ? normalizeName(catatan) : '',
      verifiedBy: user.nama,
      verifiedAt: now,
      updatedAt: now,
      updatedBy: user.nama,
    };

    voters[idx] = updated;
    writeItem(STORAGE_KEYS.VOTERS, voters);

    const statusLabel =
      status === 'sudah_diverifikasi'
        ? 'Sudah Diverifikasi'
        : status === 'perlu_perbaikan'
        ? 'Perlu Perbaikan'
        : 'Belum Diverifikasi';

    this.addAuditLog({
      userId: user.id,
      userName: user.nama,
      userRole: user.role,
      action: 'verifikasi_warga',
      description: `Mengubah status verifikasi ${updated.namaLengkap} menjadi "${statusLabel}"`,
    });

    return updated;
  },

  deleteVoter(id: string, user: User): boolean {
    const voters = this.getVoters();
    const target = voters.find((v) => v.id === id);
    if (!target) return false;

    const remaining = voters.filter((v) => v.id !== id);
    writeItem(STORAGE_KEYS.VOTERS, remaining);

    this.addAuditLog({
      userId: user.id,
      userName: user.nama,
      userRole: user.role,
      action: 'hapus_warga',
      description: `Menghapus data pemilih: ${target.namaLengkap} (RT ${target.rt}/RW ${target.rw})`,
    });

    return true;
  },

  // ==================== SETTINGS OPERATIONS ====================
  getSettings(): DesaSettings {
    return readItem<DesaSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },

  updateSettings(settings: DesaSettings, user: User): void {
    writeItem(STORAGE_KEYS.SETTINGS, settings);
    this.addAuditLog({
      userId: user.id,
      userName: user.nama,
      userRole: user.role,
      action: 'pengaturan_desa',
      description: 'Memperbarui data identitas desa dan kepanitiaan Pilkades.',
    });
  },

  // ==================== USER OPERATIONS ====================
  getUsers(): User[] {
    return readItem<User[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  },

  addUser(userData: { username: string; nama: string; role: 'admin' | 'operator' }, user: User): User {
    const users = this.getUsers();
    const newUser: User = {
      id: `user-${Date.now()}`,
      username: userData.username.toLowerCase().trim(),
      nama: normalizeName(userData.nama),
      role: userData.role,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const updated = [...users, newUser];
    writeItem(STORAGE_KEYS.USERS, updated);

    this.addAuditLog({
      userId: user.id,
      userName: user.nama,
      userRole: user.role,
      action: 'backup_restore',
      description: `Menambahkan akun pengguna baru: ${newUser.nama} (${newUser.role})`,
    });

    return newUser;
  },

  toggleUserActive(id: string): void {
    const users = this.getUsers();
    const target = users.find((u) => u.id === id);
    if (target) {
      target.isActive = !target.isActive;
      writeItem(STORAGE_KEYS.USERS, [...users]);
    }
  },

  // ==================== AUDIT LOGS ====================
  getAuditLogs(): AuditLog[] {
    return readItem<AuditLog[]>(STORAGE_KEYS.LOGS, DEFAULT_LOGS);
  },

  addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    const sliced = [newLog, ...logs].slice(0, 300);
    writeItem(STORAGE_KEYS.LOGS, sliced);
  },

  // ==================== BACKUP & RESTORE ====================
  exportFullBackup(): string {
    const backup = {
      version: '1.3.0',
      exportedAt: new Date().toISOString(),
      appName: 'Sistem Informasi DPT Pilkades Desa Padanaan',
      data: {
        settings: this.getSettings(),
        dusuns: this.getDusuns(),
        rws: this.getRWs(),
        rts: this.getRTs(),
        tps: this.getTPS(),
        users: this.getUsers(),
        voters: this.getVoters(),
        logs: this.getAuditLogs(),
      },
    };
    return JSON.stringify(backup, null, 2);
  },

  restoreBackup(
    jsonString: string,
    user: User
  ): { success: boolean; message: string; count?: number } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data || !Array.isArray(parsed.data.voters)) {
        return {
          success: false,
          message: 'Format berkas cadangan tidak valid atau tidak memiliki data pemilih.',
        };
      }

      if (parsed.data.settings) writeItem(STORAGE_KEYS.SETTINGS, parsed.data.settings);
      if (Array.isArray(parsed.data.dusuns)) writeItem(STORAGE_KEYS.DUSUNS, parsed.data.dusuns);
      if (Array.isArray(parsed.data.rws)) writeItem(STORAGE_KEYS.RWS, parsed.data.rws);
      if (Array.isArray(parsed.data.rts)) writeItem(STORAGE_KEYS.RTS, parsed.data.rts);
      if (Array.isArray(parsed.data.tps)) writeItem(STORAGE_KEYS.TPS, parsed.data.tps);
      if (Array.isArray(parsed.data.users)) writeItem(STORAGE_KEYS.USERS, parsed.data.users);
      if (Array.isArray(parsed.data.voters)) writeItem(STORAGE_KEYS.VOTERS, parsed.data.voters);

      this.addAuditLog({
        userId: user.id,
        userName: user.nama,
        userRole: user.role,
        action: 'backup_restore',
        description: `Melakukan pemulihan data (Restore Backup) berisi ${parsed.data.voters.length} warga dan ${Array.isArray(parsed.data.tps) ? parsed.data.tps.length : 0} TPS.`,
      });

      return {
        success: true,
        message: `Pemulihan data berhasil! ${parsed.data.voters.length} data pemilih berhasil dimuat.`,
        count: parsed.data.voters.length,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: `Gagal memproses file cadangan: ${msg}`,
      };
    }
  },

  resetToDefault(user: User): void {
    writeItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    writeItem(STORAGE_KEYS.DUSUNS, DEFAULT_DUSUNS);
    writeItem(STORAGE_KEYS.RWS, DEFAULT_RWS);
    writeItem(STORAGE_KEYS.RTS, DEFAULT_RTS);
    writeItem(STORAGE_KEYS.TPS, DEFAULT_TPS);
    writeItem(STORAGE_KEYS.USERS, DEFAULT_USERS);
    writeItem(STORAGE_KEYS.VOTERS, DEFAULT_VOTERS);
    writeItem(STORAGE_KEYS.LOGS, DEFAULT_LOGS);

    this.addAuditLog({
      userId: user.id,
      userName: user.nama,
      userRole: user.role,
      action: 'backup_restore',
      description: 'Mereset seluruh data aplikasi ke contoh data bawaan Desa Padanaan.',
    });
  },
};

// Firebase Cloud Sync Configuration Helper
export const FirebaseConfigService = {
  getSavedConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.FIREBASE_CONFIG);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  saveConfig(cfg: Record<string, unknown>) {
    localStorage.setItem(STORAGE_KEYS.FIREBASE_CONFIG, JSON.stringify(cfg));
  },
  clearConfig() {
    localStorage.removeItem(STORAGE_KEYS.FIREBASE_CONFIG);
  },
  isConfigured(): boolean {
    const cfg = this.getSavedConfig();
    return !!(cfg && cfg.apiKey && cfg.projectId);
  },
  getStatus() {
    if (this.isConfigured()) {
      return {
        isConnected: true,
        mode: 'firebase',
        description: 'Terhubung ke Google Cloud Firestore (Database Online Aktif)',
      };
    }
    return {
      isConnected: false,
      mode: 'local',
      description: 'Mode Lokal Terproteksi (Data tersimpan aman di peramban, siap dikoneksikan ke Firebase)',
    };
  },
};
