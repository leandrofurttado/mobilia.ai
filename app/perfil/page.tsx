"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function PerfilPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <>
        <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
            <span className="text-xl font-semibold tracking-tight text-slate-900">Homevia</span>
          </div>
        </header>
        <main className="mx-auto max-w-2xl px-4 py-12">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-10 text-center shadow-sm">
            <p className="text-slate-500">Carregando...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
          <span className="text-xl font-semibold tracking-tight text-slate-900">Homevia</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-12 md:py-16">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt=""
                width={80}
                height={80}
                className="rounded-full border-2 border-slate-200"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                <svg className="h-10 w-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
            <div className="mt-4 sm:ml-6 sm:mt-0">
              <h1 className="text-xl font-bold text-slate-900">
                {session?.user?.name ?? "Usuário"}
              </h1>
              <p className="mt-1 text-slate-600">{session?.user?.email}</p>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Sair da conta
            </button>
          </div>
        </div>

        <p className="mt-6 text-center">
          <Link href="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            Voltar ao início
          </Link>
        </p>
      </main>
    </>
  );
}
