"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

type Creation = {
  imageBase64: string;
  createdAt: number;
  items?: string[];
};

const STORAGE_KEY = "homevia-creations";

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

export default function CriarPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

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
        const creation: Creation = {
          imageBase64: dataUrl,
          createdAt: Date.now(),
          ...(data.items?.length ? { items: data.items } : {}),
        };
        const prev = loadCreations();
        const next = [creation, ...prev];
        saveCreations(next);
        router.push("/");
      } else {
        setError("Resposta inválida da API.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }, [previewUrl, selectedFile, router]);

  return (
    <>
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link
            href="/"
            className="text-slate-600 transition hover:text-slate-900"
            aria-label="Voltar"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-xl font-semibold tracking-tight text-slate-900">
            Homevia
          </span>
          <div className="w-6" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 md:py-12">
        <section className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Nova transformação
          </h1>
          <p className="mt-2 text-slate-600">
            Envie uma foto do cômodo. A IA moderniza o espaço e lista os móveis.
          </p>
        </section>

        <section>
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`relative rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
              dragActive
                ? "border-indigo-400 bg-indigo-50/80"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <input
              type="file"
              accept="image/*"
              onChange={onInputChange}
              className="absolute inset-0 cursor-pointer rounded-2xl opacity-0"
              disabled={loading}
            />
            {previewUrl ? (
              <div className="flex flex-col items-center gap-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-72 rounded-xl object-contain shadow-lg"
                />
                <p className="text-sm text-slate-500">
                  Imagem selecionada. Clique em &quot;Criar&quot; para transformar.
                </p>
              </div>
            ) : (
              <>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                  <svg className="h-7 w-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                  </svg>
                </div>
                <p className="text-slate-600">
                  Arraste uma imagem aqui ou <span className="font-medium text-indigo-600">clique para escolher</span>
                </p>
              </>
            )}
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/"
              className="order-2 rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:order-1"
            >
              Cancelar
            </Link>
            <button
              type="button"
              onClick={onCreate}
              disabled={!previewUrl || loading}
              className="order-1 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:order-2"
            >
              {loading ? "Transformando…" : "Criar"}
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
