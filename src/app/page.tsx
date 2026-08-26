import { getAllPublicExercises } from '@/lib/exercisesServer';
import { AnalyzerApp } from '@/components/AnalyzerApp';

export const dynamic = 'force-dynamic';

export default function Home() {
  const initialExercises = getAllPublicExercises();
  return <AnalyzerApp initialExercises={initialExercises} />;
}
