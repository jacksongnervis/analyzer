import fs from 'fs';
import path from 'path';
import { PublicExercise, ServerExercise } from '@/types';

// Diretório base dos exercícios na raiz do projeto
const EXERCISES_DIR = path.join(process.cwd(), 'exercises');

/**
 * Lê todos os exercícios a partir da estrutura de pastas em `/exercises`.
 * Executado exclusivamente no ambiente do servidor Node.js.
 */
export function getAllServerExercises(): ServerExercise[] {
  try {
    if (!fs.existsSync(EXERCISES_DIR)) {
      return [];
    }

    const folderNames = fs.readdirSync(EXERCISES_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .sort(); // Mantém a ordem numérica das pastas (01-, 02-, ...)

    const exercises: ServerExercise[] = [];

    for (const folder of folderNames) {
      const folderPath = path.join(EXERCISES_DIR, folder);
      const infoPath = path.join(folderPath, 'info.json');
      const dirtyPath = path.join(folderPath, 'Dirty.java');
      const cleanPath = path.join(folderPath, 'Clean.java');

      if (!fs.existsSync(infoPath) || !fs.existsSync(dirtyPath)) {
        continue;
      }

      try {
        const infoRaw = fs.readFileSync(infoPath, 'utf-8');
        const info = JSON.parse(infoRaw);

        const initialCode = fs.readFileSync(dirtyPath, 'utf-8').trim();
        const expectedCleanCode = fs.existsSync(cleanPath) 
          ? fs.readFileSync(cleanPath, 'utf-8').trim() 
          : '';

        exercises.push({
          id: info.id || folder,
          title: info.title || folder,
          category: info.category || 'Geral',
          difficulty: info.difficulty || 'Iniciante',
          description: info.description || '',
          objectives: Array.isArray(info.objectives) ? info.objectives : [],
          initialCode,
          expectedCleanCode,
        });
      } catch (err) {
        console.error(`Erro ao carregar o exercício na pasta ${folder}:`, err);
      }
    }

    return exercises;
  } catch (error) {
    console.error('Erro ao ler diretório de exercícios:', error);
    return [];
  }
}

/**
 * Retorna a lista de exercícios públicos para o Front-end.
 * O campo `expectedCleanCode` (Clean.java) é propositalmente REMOVIDO para evitar
 * que o gabarito fique exposto no DevTools/F12 do navegador.
 */
export function getAllPublicExercises(): PublicExercise[] {
  const serverExercises = getAllServerExercises();
  return serverExercises.map(({ expectedCleanCode, ...publicData }) => publicData);
}

/**
 * Busca um exercício completo (com gabarito) exclusivamente para uso interno da IA no servidor.
 */
export function getServerExerciseById(id: string): ServerExercise | undefined {
  const exercises = getAllServerExercises();
  return exercises.find(ex => ex.id === id);
}
