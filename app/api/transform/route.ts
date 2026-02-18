import { NextRequest, NextResponse } from "next/server";

const OPENAI_EDIT_URL = "https://api.openai.com/v1/images/edits";
const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";

const EDIT_PROMPT =
  "Mantenha exatamente o tamanho, a proporção e o estilo do cômodo (paredes, janelas, piso, iluminação e estrutura). Altere apenas os móveis e os itens de decoração: substitua-os por versões mais modernas, bonitas e aconchegantes, sem mudar o layout nem as dimensões do ambiente.";

const LIST_FURNITURE_PROMPT = `Analise esta imagem de um cômodo decorado. Liste CADA móvel e item de decoração visível (sofá, cama, lustre, quadros, tapete, mesas, cadeiras, etc.).
Para cada item, escreva uma descrição curta em português do Brasil, por exemplo: "Sofá preto de 3 lugares de algodão", "Lustre com cristais 3 lâmpadas", "Quadro artístico tema África", "Cama de casal colchão Ortobom".
Retorne APENAS um JSON válido com um único objeto que tenha a chave "itens" (array de strings). Exemplo: {"itens": ["Sofá preto de 3 lugares", "Lustre com cristais"]}
Não inclua markdown, explicações ou texto fora do JSON.`;

function normalizeImageUrl(imageBase64: string): string {
  const s = imageBase64.trim();
  if (s.startsWith("data:")) return s;
  const mime = "image/jpeg";
  return `data:${mime};base64,${s}`;
}

async function listFurnitureFromImage(
  apiKey: string,
  imageBase64: string
): Promise<string[]> {
  const imageUrl =
    imageBase64.startsWith("data:") ? imageBase64 : `data:image/png;base64,${imageBase64}`;

  const res = await fetch(OPENAI_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: LIST_FURNITURE_PROMPT },
            {
              type: "image_url",
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || "Falha ao identificar móveis.");
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data?.choices?.[0]?.message?.content?.trim() ?? "";

  try {
    const parsed = JSON.parse(text) as { itens?: string[] };
    const itens = parsed?.itens;
    if (Array.isArray(itens) && itens.every((x) => typeof x === "string")) {
      return itens;
    }
  } catch {
    const lines = text
      .split(/\n/)
      .map((l) => l.replace(/^[\d\-•*.]+\s*/, "").replace(/^["']|["']$/g, "").trim())
      .filter((l) => l.length > 2);
    if (lines.length > 0) return lines;
  }

  return [];
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY não configurada. Configure em .env.local." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const rawImage = body?.imageBase64;
    if (!rawImage || typeof rawImage !== "string") {
      return NextResponse.json(
        { error: "Envie a imagem em base64 no campo imageBase64." },
        { status: 400 }
      );
    }

    const imageUrl = normalizeImageUrl(rawImage);

    const response = await fetch(OPENAI_EDIT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1.5",
        prompt: EDIT_PROMPT,
        images: [{ image_url: imageUrl }],
        n: 1,
        size: "1024x1024",
        quality: "high",
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      let errJson: { error?: { message?: string } } = {};
      try {
        errJson = JSON.parse(errText);
      } catch {
        // ignore
      }
      const message =
        errJson?.error?.message || response.statusText || errText;
      return NextResponse.json(
        { error: `OpenAI: ${message}` },
        { status: response.status >= 500 ? 502 : 400 }
      );
    }

    const data = (await response.json()) as {
      data?: Array<{ b64_json?: string }>;
    };
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json(
        { error: "Resposta da OpenAI sem imagem." },
        { status: 502 }
      );
    }

    let items: string[] = [];
    try {
      items = await listFurnitureFromImage(apiKey, b64);
    } catch {
      // continua sem a lista de móveis
    }

    return NextResponse.json({ imageBase64: b64, items });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao processar imagem.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
