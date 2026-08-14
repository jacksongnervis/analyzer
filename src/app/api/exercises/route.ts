import { NextResponse } from 'next/server';
import { getAllPublicExercises } from '@/lib/exercisesServer';

export const dynamic = 'force-dynamic';

/**
 * Retorna a lista de exercícios públicos para o frontend.
 * Nota de segurança: Apenas os metadados e o `Dirty.java` são retornados.
 * O arquivo `Clean.java` NUNCA é exposto nesta rota.
 */
export async function GET() {
  try {
    const exercises = getAllPublicExercises();
    return NextResponse.json(exercises, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar lista pública de exercícios:', error);
    return NextResponse.json(
      { error: 'Não foi possível carregar os exercícios.' },
      { status: 500 }
    );
  }
}
