"use server";

import prisma from "../prisma";

export const getAllPosyandu = async () => {
  const allPosyandu = await prisma.posyandu.findMany({
    select: {
      id: true,
      nama_posyandu: true,
    },
  });
  return allPosyandu;
};

