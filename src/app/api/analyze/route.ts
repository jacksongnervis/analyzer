import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { CLEAN_CODE_ANALYZER_PROMPT } from '@/prompts/analyzerPrompt';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Código não fornecido.' }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'Chave da API do Groq não configurada no servidor.' }, { status: 500 });
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    // Chamada à API da Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: CLEAN_CODE_ANALYZER_PROMPT },
        { role: 'user', content: code },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1, // Temperatura baixa para respostas mais determinísticas e aderentes ao JSON
      response_format: { type: 'json_object' }, // Força a saída como JSON (suportado em alguns modelos)
    });

    const aiContent = chatCompletion.choices[0]?.message?.content;

    if (!aiContent) {
      throw new Error('Resposta vazia da API.');
    }

    // Tentar fazer o parse do JSON para validar
    const parsedData = JSON.parse(aiContent);

    // Retorna a resposta parseada
    return NextResponse.json(parsedData, { status: 200 });

  } catch (error: any) {
    console.error('Erro ao analisar código:', error);

    // Identificar erro de Rate Limit (Too Many Requests)
    if (error?.status === 429 || error?.message?.includes('429')) {
      return NextResponse.json(
        { error: 'Muitas requisições. Rate limit excedido.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Falha ao processar a análise do código. Tente novamente.' },
      { status: 500 }
    );
  }
}
