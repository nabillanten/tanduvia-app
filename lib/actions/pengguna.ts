"use server";
import {revalidatePath} from "next/cache";
import prisma from "../prisma";

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
