-- CreateEnum
CREATE TYPE "Role" AS ENUM ('super_admin', 'petugas', 'ahli_gizi', 'ibu');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('L', 'P');

-- CreateEnum
CREATE TYPE "JenisIndeks" AS ENUM ('BB_U', 'TB_U', 'BB_TB', 'IMT_U');

-- CreateEnum
CREATE TYPE "KondisiTarget" AS ENUM ('stunting', 'berat_kurang', 'gizi_lebih', 'umum');

-- CreateEnum
CREATE TYPE "StatusPublikasi" AS ENUM ('pending', 'published', 'rejected');

-- CreateTable
CREATE TABLE "posyandu" (
    "id" SERIAL NOT NULL,
    "nama_posyandu" TEXT NOT NULL,
    "alamat" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "posyandu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "posyandu_id" INTEGER,
    "nama_lengkap" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "no_telepon" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anak" (
    "id" SERIAL NOT NULL,
    "ibu_id" INTEGER NOT NULL,
    "posyandu_id" INTEGER NOT NULL,
    "rfid_tag" TEXT NOT NULL,
    "nik" TEXT,
    "nama_anak" TEXT NOT NULL,
    "tempat_lahir" TEXT,
    "tanggal_lahir" DATE NOT NULL,
    "jenis_kelamin" "Gender" NOT NULL,
    "bb_lahir" DECIMAL(5,2),
    "tb_lahir" DECIMAL(5,1),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "standar_antropometri" (
    "id" SERIAL NOT NULL,
    "jenis_indeks" "JenisIndeks" NOT NULL,
    "jenis_kelamin" "Gender" NOT NULL,
    "umur_bulan" INTEGER NOT NULL,
    "batas_min_3_sd" DECIMAL(5,2),
    "batas_min_2_sd" DECIMAL(5,2),
    "batas_min_1_sd" DECIMAL(5,2),
    "median" DECIMAL(5,2),
    "batas_plus_1_sd" DECIMAL(5,2),
    "batas_plus_2_sd" DECIMAL(5,2),
    "batas_plus_3_sd" DECIMAL(5,2),

    CONSTRAINT "standar_antropometri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pemeriksaan" (
    "id" SERIAL NOT NULL,
    "anak_id" INTEGER NOT NULL,
    "petugas_id" INTEGER NOT NULL,
    "tanggal_ukur" DATE NOT NULL,
    "usia_bulan" INTEGER NOT NULL,
    "berat_badan" DECIMAL(5,2) NOT NULL,
    "tinggi_badan" DECIMAL(5,1) NOT NULL,
    "lingkar_kepala" DECIMAL(5,1),
    "status_bb_u" TEXT,
    "status_tb_u" TEXT,
    "status_bb_tb" TEXT,
    "status_imt_u" TEXT,
    "catatan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pemeriksaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rekomendasi_gizi" (
    "id" SERIAL NOT NULL,
    "ahli_gizi_id" INTEGER NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "rentang_usia" TEXT NOT NULL,
    "target_kondisi" "KondisiTarget" NOT NULL,
    "icon_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rekomendasi_gizi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rekomendasi_item" (
    "id" SERIAL NOT NULL,
    "rekomendasi_id" INTEGER NOT NULL,
    "nama_makanan" TEXT NOT NULL,

    CONSTRAINT "rekomendasi_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "anak_rfid_tag_key" ON "anak"("rfid_tag");

-- CreateIndex
CREATE UNIQUE INDEX "anak_nik_key" ON "anak"("nik");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_posyandu_id_fkey" FOREIGN KEY ("posyandu_id") REFERENCES "posyandu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anak" ADD CONSTRAINT "anak_ibu_id_fkey" FOREIGN KEY ("ibu_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anak" ADD CONSTRAINT "anak_posyandu_id_fkey" FOREIGN KEY ("posyandu_id") REFERENCES "posyandu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pemeriksaan" ADD CONSTRAINT "pemeriksaan_anak_id_fkey" FOREIGN KEY ("anak_id") REFERENCES "anak"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pemeriksaan" ADD CONSTRAINT "pemeriksaan_petugas_id_fkey" FOREIGN KEY ("petugas_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rekomendasi_gizi" ADD CONSTRAINT "rekomendasi_gizi_ahli_gizi_id_fkey" FOREIGN KEY ("ahli_gizi_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rekomendasi_item" ADD CONSTRAINT "rekomendasi_item_rekomendasi_id_fkey" FOREIGN KEY ("rekomendasi_id") REFERENCES "rekomendasi_gizi"("id") ON DELETE CASCADE ON UPDATE CASCADE;
