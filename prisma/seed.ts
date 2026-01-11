import {
  Gender,
  JenisIndeks,
  StatusGizi,
  StatusPublikasi, 
  PrismaClient,
} from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcrypt";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Mulai Seeding Database (3 Pemeriksaan per Anak)...");

  // 1. CLEANUP
  await prisma.rekomendasiItem.deleteMany();
  await prisma.rekomendasiGizi.deleteMany();
  await prisma.pemeriksaan.deleteMany();
  await prisma.anak.deleteMany();
  await prisma.standarAntropometri.deleteMany();
  await prisma.user.deleteMany();
  await prisma.posyandu.deleteMany();

  const passwordUmum = await bcrypt.hash("123123", 10);

  // 2. POSYANDU & USERS
  const posyanduMawar = await prisma.posyandu.create({ data: { nama_posyandu: "Posyandu Mawar", alamat: "Jl. Mawar" } });
  const posyanduMelati = await prisma.posyandu.create({ data: { nama_posyandu: "Posyandu Melati", alamat: "Jl. Melati" } });

  await prisma.user.create({ data: { nama_lengkap: "Super Admin", username: "admin", password: passwordUmum, role: "super_admin" } });
  const ahliGizi1 = await prisma.user.create({ data: { nama_lengkap: "Dr. Sarah Gizi", username: "ahligizi1", password: passwordUmum, role: "ahli_gizi" } });
  const petugas1 = await prisma.user.create({ data: { nama_lengkap: "Siti Petugas", username: "petugas1", password: passwordUmum, role: "petugas", posyandu_id: posyanduMawar.id } });

  // IBU (10 Orang)
  const listIbu = [];
  for (let i = 1; i <= 10; i++) {
    const ibu = await prisma.user.create({
      data: {
        nama_lengkap: `Ibu Peserta ${i}`,
        username: `ibu${i}`,
        password: passwordUmum,
        role: "ibu",
        posyandu_id: i <= 5 ? posyanduMawar.id : posyanduMelati.id,
        no_telepon: `0812000000${i}`,
      },
    });
    listIbu.push(ibu);
  }

  // 3. ANAK (15 Orang)
  const listAnak = [];
  for (let i = 1; i <= 15; i++) {
    const ibuIndex = (i - 1) % listIbu.length;
    const ibu = listIbu[ibuIndex];
    const gender: Gender = i % 2 === 0 ? "P" : "L";
    
    // Lahir random antara 6 - 24 bulan yang lalu
    const umurBulanSaatIni = 6 + (i % 18); 
    const tglLahir = new Date();
    tglLahir.setMonth(tglLahir.getMonth() - umurBulanSaatIni);

    const anak = await prisma.anak.create({
      data: {
        ibu_id: ibu.id,
        posyandu_id: ibu.posyandu_id!,
        rfid_tag: `RFID-${1000 + i}`,
        nik: `3201012024000${i}`,
        nama_anak: `Anak Ke-${i} (${umurBulanSaatIni} Bulan)`,
        tanggal_lahir: tglLahir,
        jenis_kelamin: gender,
        bb_lahir: 3.0 + (Math.random() * 0.5),
        tb_lahir: 48.0 + (Math.random() * 2),
      },
    });
    listAnak.push(anak);
  }

  // 4. REKOMENDASI GIZI
  await buatRekomendasi(ahliGizi1.id, "ASI Eksklusif", "Maksimalkan ASI.", 0, 6, "TB_U", "sangat_pendek", ["ASI On Demand"]);
  await buatRekomendasi(ahliGizi1.id, "Protein Hewani Kuat", "Cegah stunting dengan telur.", 6, 24, "TB_U", "pendek", ["Telur Rebus", "Ikan Kembung"]);
  await buatRekomendasi(ahliGizi1.id, "Kurangi Gula", "Cegah obesitas.", 6, 24, "BB_U", "risiko_bb_lebih", ["Buah Potong"]);
  await buatRekomendasi(ahliGizi1.id, "Gizi Seimbang", "Pertahankan status normal.", 6, 60, "BB_U", "bb_normal", ["Nasi", "Sayur Sop", "Tempe"]);

  // 5. PEMERIKSAAN (3 DATA PER ANAK) 🔥
  console.log("🏥 Membuat Historis Pemeriksaan...");

  for (const [index, anak] of listAnak.entries()) {
    
    // TENTUKAN PROFIL KESEHATAN ANAK
    // Index 0-2: Kasus Stunting (Pendek)
    // Index 3-4: Kasus Obesitas (Gemuk)
    // Index 5++: Kasus Normal
    let profil = "normal";
    if (index < 3) profil = "stunting";
    else if (index < 5) profil = "obesitas";

    // LOOP 3 KALI (Mundur 3 bulan ke belakang)
    // j=2 (2 bulan lalu), j=1 (1 bulan lalu), j=0 (bulan ini)
    for (let j = 2; j >= 0; j--) {
      
      // Hitung Tanggal Ukur
      const tglUkur = new Date();
      tglUkur.setMonth(tglUkur.getMonth() - j);
      
      // Hitung Usia saat tanggal ukur tsb
      // Rumus simple: beda bulan antara tglUkur dan tglLahir
      const usiaBulan = Math.floor((tglUkur.getTime() - anak.tanggal_lahir.getTime()) / (1000 * 60 * 60 * 24 * 30));

      // Simulasi Data Pertumbuhan
      // Base: Berat 3kg + (0.4 kg/bulan)
      // Base: Tinggi 50cm + (0.8 cm/bulan)
      let bb = 3.0 + (usiaBulan * 0.4); 
      let tb = 50.0 + (usiaBulan * 0.8);
      
      let statusBB: StatusGizi = "bb_normal";
      let statusTB: StatusGizi = "normal";
      let note = "Tumbuh kembang baik";

      // Manipulasi Data sesuai Profil
      if (profil === "stunting") {
        tb = tb * 0.85; // Tinggi disunat 15% biar pendek
        statusTB = "pendek";
        note = "Tinggi badan stagnan, perlu intervensi gizi.";
        
        // Agar history terlihat, bulan lalu mungkin "sangat_pendek", sekarang "pendek"
        if (j === 2) statusTB = "sangat_pendek"; 
      } 
      else if (profil === "obesitas") {
        bb = bb * 1.3; // Berat ditambah 30% biar gemuk
        statusBB = "risiko_bb_lebih";
        note = "Berat badan naik terlalu drastis.";
      }

      // Randomize dikit biar gak kaku angkanya
      bb += (Math.random() * 0.2); 
      tb += (Math.random() * 0.3);

      await prisma.pemeriksaan.create({
        data: {
          anak_id: anak.id,
          petugas_id: petugas1.id,
          tanggal_ukur: tglUkur,
          usia_bulan: usiaBulan > 0 ? usiaBulan : 0, // Safety check
          berat_badan: parseFloat(bb.toFixed(2)),
          tinggi_badan: parseFloat(tb.toFixed(1)),
          
          status_bb_u: statusBB,
          status_tb_u: statusTB,
          
          catatan: note
        }
      });
    }
  }

  // 6. STANDAR ANTROPOMETRI (Reference Data)
  const standarData = [];
  for (let u = 0; u <= 24; u++) {
    standarData.push({
      jenis_indeks: JenisIndeks.BB_U,
      jenis_kelamin: Gender.L,
      umur_bulan: u,
      batas_min_3_sd: 2.0 + (u*0.3),
      batas_min_2_sd: 2.5 + (u*0.4),
      batas_min_1_sd: 3.0 + (u*0.5),
      median: 3.5 + (u*0.6),
      batas_plus_1_sd: 4.0 + (u*0.6),
      batas_plus_2_sd: 4.5 + (u*0.7),
      batas_plus_3_sd: 5.0 + (u*0.8),
    });
  }
  await prisma.standarAntropometri.createMany({ data: standarData });

  console.log("🎉 SEEDING SELESAI! (Total 45 Data Pemeriksaan)");
}

// Helper Function
async function buatRekomendasi(
  uid: string, judul: string, desk: string, 
  min: number, max: number, 
  idx: string, status: string, 
  items: string[]
) {
  const rek = await prisma.rekomendasiGizi.create({
    data: {
      ahli_gizi_id: uid,
      judul, deskripsi: desk,
      usia_min: min, usia_max: max,
      jenis_indeks: idx as JenisIndeks,
      target_status: status as StatusGizi,
      status: StatusPublikasi.published,
      icon_url: "https://via.placeholder.com/150",
    }
  });
  const itemData = items.map(m => ({ rekomendasi_id: rek.id, nama_makanan: m }));
  await prisma.rekomendasiItem.createMany({ data: itemData });
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });