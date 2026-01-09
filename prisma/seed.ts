import { PrismaClient, Prisma } from "../app/generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'
import * as bcrypt from 'bcrypt'
import 'dotenv/config'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  // 1. Buat Data Posyandu Dummay
  const posyandu = await prisma.posyandu.upsert({
    where: { id: 1 },
    update: {},
    create: {
      nama_posyandu: 'Posyandu Mawar 01',
      alamat: 'Jl. Melati No. 12, Cirebon',
    },
  })

  // 2. Hash Password (biar aman)
  const passwordAdmin = await bcrypt.hash('admin123', 10) // Password: admin123
  const passwordAhliGizi = await bcrypt.hash('gizi123', 10) // Password: gizi123

  // 3. Buat Akun Super Admin
  await prisma.user.upsert({
    where: { email: 'admin@posyandu.com' },
    update: {},
    create: {
      nama_lengkap: 'Super Admin',
      email: 'admin@posyandu.com',
      password: passwordAdmin,
      role: 'super_admin',
      posyandu_id: null, // Admin tidak terikat posyandu tertentu
    },
  })

  // 4. Buat Akun Ahli Gizi
  await prisma.user.upsert({
    where: { email: 'ahligizi@posyandu.com' },
    update: {},
    create: {
      nama_lengkap: 'Dr. Budi Santoso, S.Gz',
      email: 'ahligizi@posyandu.com',
      password: passwordAhliGizi,
      role: 'ahli_gizi',
      posyandu_id: null,
    },
  })
  
  // 5. Masukkan Sample Standar Antropometri (Contoh Sedikit Saja)
  // Data: Anak Laki-laki, Umur 0 Bulan, Indeks Berat/Umur
  await prisma.standarAntropometri.createMany({
    data: [
      {
        jenis_indeks: 'BB_U',
        jenis_kelamin: 'L',
        umur_bulan: 0,
        batas_min_3_sd: 2.1,
        batas_min_2_sd: 2.5,
        batas_min_1_sd: 2.9,
        median: 3.3,
        batas_plus_1_sd: 3.9,
        batas_plus_2_sd: 4.4,
        batas_plus_3_sd: 5.0
      },
      // ... Nanti kamu bisa tambahkan data lengkapnya di sini atau lewat import Excel
    ],
    skipDuplicates: true, 
  })

  console.log('Seeding berhasil! Akun Admin: admin@posyandu.com / admin123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })