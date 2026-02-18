"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

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

export default function Home() {
  const [creations, setCreations] = useState<Creation[]>([]);
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

  return (
    <>
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <span className="text-xl font-semibold tracking-tight text-slate-900">
            Homevia
          </span>
          <Link
            href="/criar"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Nova criação
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 md:py-12">
        <section className="mb-10 text-center md:mb-14">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Suas criações
          </h1>
          <p className="mt-2 text-slate-600 md:text-lg">
            Cômodos transformados com IA. Toque em uma imagem para ampliar.
          </p>
        </section>

        <section>
          {creations.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <svg className="h-7 w-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Nenhuma criação ainda</h2>
              <p className="mt-1 text-sm text-slate-500">
                Envie uma foto de um cômodo e receba uma versão moderna com lista de móveis.
              </p>
              <Link
                href="/criar"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Criar primeira transformação
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-1">
              {creations.map((c, i) => (
                <li
                  key={`${c.createdAt}-${i}`}
                  className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:shadow-md sm:flex"
                >
                  <button
                    type="button"
                    onClick={() => setViewerImage(c.imageBase64)}
                    className="relative h-64 w-full shrink-0 overflow-hidden sm:h-72 sm:w-80 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset"
                  >
                    <img
                      src={c.imageBase64}
                      alt={`Criação ${i + 1}`}
                      className="h-full w-full object-cover transition hover:scale-[1.02]"
                    />
                  </button>
                  <div className="flex flex-1 flex-col justify-center border-t border-slate-100 p-5 sm:border-t-0 sm:border-l sm:p-6">
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Móveis e itens
                    </h3>
                    {c.items?.length ? (
                      <ul className="space-y-2 text-slate-700">
                        {c.items.map((item, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-400">
                        Lista de itens não disponível para esta criação.
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {viewerImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Visualizador de imagem"
          onClick={() => setViewerImage(null)}
        >
          <button
            type="button"
            onClick={() => setViewerImage(null)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
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
    </>
  );
}
