import Link from "next/link";

export default function PlanosPage() {
  return (
    <>
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
          <span className="text-xl font-semibold tracking-tight text-slate-900">
            Homevia
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-12 md:py-16">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Planos
          </h1>
          <p className="mt-2 text-slate-600">
            Em breve você poderá escolher o plano ideal para suas transformações.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            Voltar ao início
          </Link>
        </div>
      </main>
    </>
  );
}
