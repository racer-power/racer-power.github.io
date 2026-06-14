import { getTopScores } from "@/app/actions/scores";
import { TetrisGame } from "@/components/tetris/TetrisGame";

export default async function Home() {
  const topScores = await getTopScores(5);

  return <TetrisGame topScores={topScores} />;
}
