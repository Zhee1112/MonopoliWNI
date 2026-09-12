# MonopoliWNI - Spesifikasi Lengkap

## Tech Stack
- **Frontend**: Next.js 14+ (App Router) + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Realtime + Auth)
- **Deploy**: Vercel (Frontend) + Supabase (Backend)

---

## 1. BOARD LAYOUT (40 Petak)

### Sisi 1: Kampung/Kosan (Petak 0-9)
| # | Nama | Tipe | Harga | Sewa | Grup |
|---|---|---|---|---|---|
| 0 | Tanggal Muda (Start) | Corner | - | +Rp200rb saat lewat | - |
| 1 | Kontrakan Petak | Properti | Rp100rb | Rp20rb | Coklat |
| 2 | Takdir Netizen | Draw Takdir | - | - | - |
| 3 | Warkop Sebelah Kosan | Properti | Rp120rb | Rp25rb | Coklat |
| 4 | Pajak Pendapatan | Pajak | - | Bayar 10% saldo | - |
| 5 | Kegiatan Seru | Draw Kegiatan | - | - | - |
| 6 | Angkringan | Properti | Rp140rb | Rp28rb | Cyan |
| 7 | Kantor Polisi | Corner | - | Skip 1 giliran | - |
| 8 | Takdir Netizen | Draw Takdir | - | - | - |
| 9 | Warnet Jadul | Properti | Rp160rb | Rp32rb | Cyan |

### Sisi 2: Perkotaan (Petak 10-19)
| # | Nama | Tipe | Harga | Sewa | Grup |
|---|---|---|---|---|---|
| 10 | THR Bonus | Corner | - | Ambil dari pot | - |
| 11 | Kontrakan 3 Pintu | Properti | Rp200rb | Rp40rb | Pink |
| 12 | Kegiatan Seru | Draw Kegiatan | - | - | - |
| 13 | Franchise Es Teh | Properti | Rp220rb | Rp45rb | Pink |
| 14 | Minimarket 24 Jam | Properti | Rp250rb | Rp50rb | Pink |
| 15 | Takdir Netizen | Draw Takdir | - | - | - |
| 16 | Pajak PPN | Pajak | - | Bayar 15% saldo | - |
| 17 | Lampu Merah 300 Detik | Properti | Rp230rb | Rp46rb | Orange |
| 18 | Kegiatan Seru | Draw Kegiatan | - | - | - |
| 19 | Rumah Kos Eksklusif | Properti | Rp280rb | Rp55rb | Orange |

### Sisi 3: Zona Gengsi (Petak 20-29)
| # | Nama | Tipe | Harga | Sewa | Grup |
|---|---|---|---|---|---|
| 20 | Takdir Netizen (Center) | Corner | - | Narik kartu Takdir | - |
| 21 | Apartemen Sultan | Properti | Rp500rb | Rp100rb | Merah |
| 22 | Kegiatan Seru | Draw Kegiatan | - | - | - |
| 23 | Coworking Space Aesthetic | Properti | Rp450rb | Rs90rb | Merah |
| 24 | Takdir Netizen | Draw Takdir | - | - | - |
| 25 | Mall Mewah | Properti | Rp600rb | Rs120rb | Kuning |
| 26 | Kegiatan Seru | Draw Kegiatan | - | - | - |
| 27 | Restoran Viral TikTok | Properti | Rp550rb | Rs110rb | Kuning |
| 28 | Takdir Netizen | Draw Takdir | - | - | - |
| 29 | Barbershop Kekinian | Properti | Rp400rb | Rs80rb | Kuning |

### Sisi 4: Zona Abu-abu (Petak 30-39)
| # | Nama | Tipe | Harga | Sewa | Grup |
|---|---|---|---|---|---|
| 30 | THR Bonus | Corner | - | Ambil dari pot | - |
| 31 | Pinjol Legal | Properti | Rp300rb | Rp60rb | Hijau |
| 32 | Kegiatan Seru | Draw Kegiatan | - | - | - |
| 33 | Pinjol Ilegal | Event/Khusus | - | Bayar 20% atau skip 2 | - |
| 34 | Takdir Netizen | Draw Takdir | - | - | - |
| 35 | Kripto Corner | Properti | Rp350rb | Rp70rb | Hijau |
| 36 | Kegiatan Seru | Draw Kegiatan | - | - | - |
| 37 | Investasi Bodong Corner | Event | - | Efek acak besar | - |
| 38 | Takdir Netizen | Draw Takdir | - | - | - |
| 39 | Tax Audit | Pajak | - | Bayar 25% saldo | - |

### Grup Warna & Bonus
| Grup | Warna | Petak | Bonus Sewa |
|---|---|---|---|
| Kampung Timur | Coklat | 1, 3 | 2x jika 2/2 |
| Kosan Raya | Cyan | 6, 9 | 2x jika 2/2 |
| Perkotaan Pusat | Pink | 11, 13, 14 | 2x jika 3/3 |
| Jalan Utama | Orange | 17, 19 | 2x jika 2/2 |
| Elite Squad | Merah | 21, 23 | 2x jika 2/2 |
| Lifestyle Zone | Kuning | 25, 27, 29 | 2x jika 3/3 |
| Spekulasi Zone | Hijau | 31, 35 | 2x jika 2/2 |

---

## 2. ROLE SYSTEM

### Role Normal (Pilihan di Awal)
| Role | Income | Luck | Negotiation | Investigation | Persuasion | Street Smart | Charm |
|---|---|---|---|---|---|---|---|
| Magang | +Rp50rb | 45 | 3 | 2 | 4 | 2 | 5 |
| Ojol Driver | +Rp75rb/3 langkah | 55 | 5 | 3 | 4 | 6 | 3 |
| Bartender | +Rp60rb+tips | 50 | 7 | 3 | 6 | 5 | 7 |
| Freelancer | +Rp40rb | 40 | 5 | 4 | 5 | 4 | 4 |
| Content Creator | +Rp30rb | 60 | 4 | 3 | 6 | 3 | 8 |
| Tukang Parkir | +Rp55rb | 50 | 4 | 5 | 3 | 7 | 3 |
| Pedagang Kaki Lima | +Rp45rb | 45 | 6 | 3 | 5 | 6 | 4 |
| Security | +Rp50rb | 55 | 3 | 6 | 3 | 5 | 3 |

### Role Meme (Buff dari Kartu Legendaris)
| # | Nama | Effect | Side Effect | Luck |
|---|---|---|---|---|
| 1 | Anak Sultan | Properti diskon 30% | Pemain lain +Rp100rb/giliranmu | -20 |
| 2 | Presiden Gorong-Gorong | 1 properti GRATIS | Bisa di-impeach | -30 |
| 3 | Emak-emak Power | 25% double dadu | 10% skip giliran | -10 |
| 4 | Bocah TikTok | 20% x5 income | 15% -Rp500rb | -15 |
| 5 | Bapak Nongkrong | 30% skip sewa | 20% bayar 2x | -10 |
| 6 | Tukang Gosek | Minta Rp50rb/giliran | Properti 2x harga | -25 |
| 7 | PNS TikTok | Income nggak bisa dikurangin | Nggak bisa beli properti | -5 |
| 8 | Ojol Legendary | Jarak jauh x3 | Bayar bensin Rp100rb/3 giliran | -15 |
| 9 | Warrior WFH | 20% skip bayar | 10% bayar 3x | -10 |
| 10 | Drama Queen | Paksa bayar Rp100rb | 25% skip 1 giliran | -15 |

---

## 3. LUCK SYSTEM

### Random Fluctuation
| Roll (d100) | Effect |
|---|---|
| 1-10 | Luck -10 |
| 11-25 | Luck -5 |
| 26-40 | Luck -2 |
| 41-60 | Luck 0 |
| 61-75 | Luck +2 |
| 76-90 | Luck +5 |
| 91-100 | Luck +10 |

---

## 4. STATS SYSTEM

| Stat | Fungsi |
|---|---|
| Negotiation | Suap, transaksi, tawar-menawar |
| Investigation | Lapor, cari bukti, audit |
| Persuasion | Defense, debat, membujuk |
| Street Smart | Cuci uang, hindari audit |
| Luck | Random fluctuation |
| Charm | Bonus dari role |

---

## 5. EVIDENCE SYSTEM

| Jenis | Bonus |
|---|---|
| Screenshot | +2 |
| Saksi Mata | +3 |
| Dokumen | +4 |
| Rekening Koran | +5 |
| Viral | +6 |

---

## 6. ROLL SYSTEM

Formula: Roll Dice + Stat + Evidence Bonus vs DC

| Aksi | DC | Stat |
|---|---|---|
| Beli properti kosong | 10 | Negotiation |
| Beli properti milik orang | 15 | Negotiation + Luck |
| Jual properti | 12 | Negotiation |
| Transfer uang | 8 | Negotiation |
| Minta uang | 12 | Persuasion |
| Cuci uang | 15 | Street Smart |
| Mencuri uang | 22 | Street Smart + Luck |
| Mencuri properti | 25 | Investigation + Street Smart |
| Lapor ke KPK | 25 | Investigation |
| Lapor ke polisi | 20 | Investigation |
| Sogok audit | 18 | Negotiation + Money |
| Pakai lawyer | 20 | Persuasion + Money |
| Buang bukti | 15 | Street Smart |
| Kambing hitam | 22 | Persuasion + Luck |

---

## 7. CARD DISTRIBUTION

### Kartu Takdir (102 kartu)
| Kategori | Jumlah | Chance |
|---|---|---|
| Event Normal | 27 | 35% |
| Event Meme | 20 | 20% |
| Interaksi | 32 | 25% |
| Koruptor | 8 | 8% |
| Audit | 5 | 5% |
| Legendaris | 10 | 5% |
| **Total** | **102** | **100%** |

### Kartu Kegiatan (100 kartu)
| Kategori | Jumlah |
|---|---|
| Usaha/Startup | 20 |
| Kerja Sampingan | 20 |
| Investasi Spekulatif | 20 |
| Kegiatan Sosial | 20 |
| Tantangan & Chance | 20 |
| **Total** | **100** |

### GRAND TOTAL: 202 Kartu

---

## 8. MONEY SYSTEM

| Tipe | Sumber | Bisa Dipakai |
|---|---|---|
| Duit Bersih | Income, sewa, kegiatan normal | Semua |
| Duit Kotor | Koruptor, ilegal | Pajak, denda, kas bersama |

Cuci Uang: Fee 40%, proses 1 giliran

---

## 9. DEFENSE SYSTEM

| Opsi | Cost | Hasil |
|---|---|---|
| Terima Audit | Sesuai kartu | Duit kotor disita |
| Sogok Audit | Rp500rb-Rp2jt | Audit batal |
| Pakai Lawyer | Rp1jt | Penalty -50% |
| Buang Bukti | 40% fee | Uang bersih |
| Kambing Hitam | Rp300rb | Audit dialihkan |

---

## 10. MULTIPLAYER

- Max 2-8 pemain
- Server-authoritative (anti cheat)
- Supabase Realtime untuk sync
- Pop-up kartu muncul di SEMUA pemain + react
