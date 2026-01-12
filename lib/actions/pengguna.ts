"use server";
import {revalidatePath} from "next/cache";
import prisma from "../prisma";
import z from "zod";

export const updateStatusUserById = async (id: string, is_active: boolean) => {
  const user = await prisma.user.update({
    where: {id},
    data: {
      is_active: !is_active,
    },
  });
  revalidatePath("/pengguna");
  return user;
};

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  nama_lengkap: z.string(),
  no_telepon: z.string().min(10),
  posyandu_id: z.string().nullable(),
  role: z.enum(["super_admin", "petugas", "ahli_gizi", "ibu"]),
  password: z.string().min(8),
});

export const createUser = async (values: z.infer<typeof formSchema>) => {
  const newUser = await prisma.user.create({
    data: values,
  });
  return newUser;
};
