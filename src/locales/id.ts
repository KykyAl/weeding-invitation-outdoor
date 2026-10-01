/**
 * Guest-facing copy (Bahasa Indonesia). Every UI string lives here so scenes
 * stay free of hardcoded text; wedding content itself comes from the backend.
 */
export const copy = {
  meta: {
    title: (first: string, second: string) => `Pernikahan ${first} & ${second}`,
  },
  cover: {
    eyebrow: 'Undangan Pernikahan',
    dear: 'Kepada Yth.',
    guestFallback: 'Bapak/Ibu/Saudara/i',
    open: 'Buka Undangan',
  },
  opening: {
    eyebrow: 'Pernikahan',
    saveTheDate: 'Simpan Tanggalnya',
    scroll: 'Gulir',
  },
  couple: {
    eyebrow: 'Pernikahan',
  },
  story: {
    heading: 'Kisah Kami',
  },
  event: {
    heading: 'Rangkaian Acara',
    untilFinished: 'Selesai',
    viewMap: 'Lihat Lokasi',
  },
  venue: {
    heading: 'Lokasi Acara',
    openMap: 'Buka Peta',
    illustrationAlt: (name: string) => `Ilustrasi ruang pernikahan di ${name}`,
  },
  gallery: {
    heading: 'Momen Kami',
    hint: 'Ketuk foto untuk memperbesar',
    open: (n: number, total: number) => `Buka foto ${n} dari ${total}`,
    dialog: 'Galeri foto',
    close: 'Tutup galeri',
    prev: 'Foto sebelumnya',
    next: 'Foto berikutnya',
  },
  rsvp: {
    heading: 'Konfirmasi Kehadiran',
    intro: 'Merupakan kehormatan bagi kami atas kehadiran dan doa restu Anda.',
    deadline: (date: string) => `Mohon konfirmasi sebelum ${date}`,
    closed: 'Konfirmasi kehadiran telah ditutup. Terima kasih atas perhatian Anda.',
    name: 'Nama',
    namePlaceholder: 'Nama lengkap Anda',
    attendance: 'Kehadiran',
    attending: 'Hadir',
    notAttending: 'Tidak Hadir',
    guests: 'Jumlah Tamu',
    guestsValue: (n: number) => `${n} orang`,
    decrease: 'Kurangi jumlah tamu',
    increase: 'Tambah jumlah tamu',
    message: 'Ucapan & Doa',
    messagePlaceholder: 'Tuliskan ucapan dan doa untuk kedua mempelai',
    counter: (n: number, max: number) => `${n}/${max}`,
    submit: 'Kirim Konfirmasi',
    submitting: 'Mengirim…',
    nameRequired: 'Mohon isi nama Anda.',
    attendanceRequired: 'Mohon pilih status kehadiran.',
    failed: 'Konfirmasi belum terkirim. Silakan coba lagi.',
    thanks: (name: string) => `Terima kasih, ${name}`,
    attendingNote: 'Kehadiran Anda sangat berarti bagi kami. Sampai jumpa di hari bahagia kami.',
    notAttendingNote: 'Terima kasih atas doa dan ucapannya. Semoga kita dapat bertemu di lain kesempatan.',
    change: 'Ubah Jawaban',
  },
  closing: {
    thanks: 'Terima Kasih',
    seeYou: 'Sampai Jumpa di Hari Bahagia Kami',
    signature: 'Kami yang berbahagia,',
    credit: 'Dibuat oleh',
  },
  music: {
    /** Toggle button; on/off is conveyed by aria-pressed. */
    label: 'Musik latar',
  },
  skipToRsvp: 'Langsung ke Konfirmasi Kehadiran',
  scenes: {
    opening: 'Pembuka',
    hall: 'Ruang pernikahan',
    couple: 'Mempelai',
    story: 'Kisah kami',
    event: 'Rangkaian acara',
    venue: 'Lokasi acara',
    gallery: 'Galeri',
    rsvp: 'Konfirmasi kehadiran',
    closing: 'Penutup',
  },
  status: {
    loading: 'Menyiapkan undangan…',
    notFound: 'Undangan tidak ditemukan',
    notFoundHint: 'Periksa kembali tautan undangan yang Anda terima.',
    error: 'Terjadi kesalahan',
    offline: 'Koneksi terputus',
    retry: 'Coba Lagi',
    devSample: 'Buka undangan contoh',
    // Development-only hints (never shown in production builds).
    devHome: 'Mode development — alamat undangan berbentuk /wedding/<slug>.',
    devApiDown: 'Pastikan wedding-api berjalan (alamatnya di VITE_API_PROXY_TARGET).',
  },
  errors: {
    network: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
    timeout: 'Server terlalu lama merespons. Silakan coba lagi.',
    incompleteData: 'Data undangan belum lengkap. Silakan hubungi pengirim undangan.',
    invalidResponse: 'Respons server tidak valid.',
    requestFailed: (status: number) => `Permintaan gagal (${status}).`,
    unknown: 'Terjadi kesalahan.',
  },
} as const
