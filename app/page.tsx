"use client";

import { useCallback, useEffect, useState } from "react";

type Creation = {
  imageBase64: string;
  createdAt: number;
  items?: string[];
};

const STORAGE_KEY = "mobilia-creations";

function loadCreations(): Creation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Creation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCreations(creations: Creation[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(creations));
  } catch {
    // ignore
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [creations, setCreations] = useState<Creation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [viewerImage, setViewerImage] = useState<string | null>(null);

  useEffect(() => {
    setCreations(loadCreations());
  }, []);

  useEffect(() => {
    if (!viewerImage) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setViewerImage(null);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [viewerImage]);

  const addCreation = useCallback((imageBase64: string, items?: string[]) => {
    const creation: Creation = {
      imageBase64,
      createdAt: Date.now(),
      ...(items?.length ? { items } : {}),
    };
    setCreations((prev) => {
      const next = [creation, ...prev];
      saveCreations(next);
      return next;
    });
  }, []);

  const handleFile = useCallback((file: File | null) => {
    setPreviewUrl(null);
    setSelectedFile(file);
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Selecione apenas arquivos de imagem (JPEG, PNG, WebP).");
      setSelectedFile(null);
      return;
    }
    fileToDataUrl(file).then(setPreviewUrl).catch(() => {
      setError("Não foi possível ler a imagem.");
      setSelectedFile(null);
    });
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      handleFile(file);
      e.target.value = "";
    },
    [handleFile]
  );

  const onCreate = useCallback(async () => {
    if (!previewUrl || !selectedFile) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: previewUrl }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Falha ao transformar a imagem.");
        return;
      }
      if (data?.imageBase64) {
        const dataUrl = `data:image/png;base64,${data.imageBase64}`;
        addCreation(dataUrl, data.items);
        setSelectedFile(null);
        setPreviewUrl(null);
      } else {
        setError("Resposta inválida da API.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }, [previewUrl, selectedFile, addCreation]);

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">mobilia.ai</h1>
        <p className="mb-8 text-neutral-600">
          Envie uma foto de um cômodo e receba uma versão moderna e aconchegante.
        </p>

        <section className="mb-10">
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
              dragActive ? "border-emerald-500 bg-emerald-50" : "border-neutral-300 bg-white"
            }`}
          >
            <input
              type="file"
              accept="image/*"
              onChange={onInputChange}
              className="absolute inset-0 cursor-pointer opacity-0"
              disabled={loading}
            />
            {previewUrl ? (
              <div className="flex flex-col items-center gap-4">
                <button
                  type="button"
                  onClick={() => setViewerImage(previewUrl)}
                  className="focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-lg"
                >
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-64 rounded-lg object-contain shadow-md cursor-zoom-in hover:opacity-90 transition-opacity"
                  />
                </button>
                <p className="text-sm text-neutral-500">
                  Imagem selecionada. Clique em &quot;Criar&quot; para transformar.
                </p>
              </div>
            ) : (
              <p className="text-neutral-500">
                Arraste uma imagem aqui ou clique para escolher um arquivo
              </p>
            )}
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onCreate}
              disabled={!previewUrl || loading}
              className="rounded-lg bg-emerald-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Criando…" : "Criar"}
            </button>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Minhas criações</h2>
          {creations.length === 0 ? (
            <p className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-neutral-500">
              Nenhuma criação ainda. Envie uma foto e clique em Criar.
            </p>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-1">
              {creations.map((c, i) => (
                <li
                  key={`${c.createdAt}-${i}`}
                  className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm sm:flex-row"
                >
                  <button
                    type="button"
                    onClick={() => setViewerImage(c.imageBase64)}
                    className="relative h-64 shrink-0 sm:h-72 sm:w-80 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-inset"
                  >
                    <img
                      src={c.imageBase64}
                      alt={`Criação ${i + 1}`}
                      className="h-full w-full object-cover cursor-zoom-in hover:opacity-95 transition-opacity"
                    />
                  </button>
                  <div className="flex flex-1 flex-col justify-center border-t border-neutral-100 p-4 sm:border-t-0 sm:border-l">
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
                      Móveis e itens
                    </h3>
                    {c.items?.length ? (
                      <ul className="space-y-1.5 text-neutral-700">
                        {c.items.map((item, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-neutral-400">
                        Lista de itens não disponível para esta criação.
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {viewerImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Visualizador de imagem"
          onClick={() => setViewerImage(null)}
        >
          <button
            type="button"
            onClick={() => setViewerImage(null)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Fechar"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={viewerImage}
            alt="Imagem em tamanho maior"
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </main>
  );
}