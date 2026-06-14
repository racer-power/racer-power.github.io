"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveHighScore(data: {
  player: string;
  score: number;
  lines: number;
  level: number;
}) {
  const player = data.player.trim().slice(0, 20) || "Player";

  await prisma.highScore.create({
    data: {
      player,
      score: data.score,
      lines: data.lines,
      level: data.level,
    },
  });

  revalidatePath("/");
}

export async function getTopScores(limit = 5) {
  return prisma.highScore.findMany({
    orderBy: { score: "desc" },
    take: limit,
  });
}
