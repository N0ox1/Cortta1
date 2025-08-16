"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-2xl p-6 space-y-3">
      <h2 className="text-xl font-semibold text-red-600">Falha ao carregar a barbearia</h2>
      <p className="text-sm text-neutral-600">
        {error.message || "Ocorreu um erro inesperado."}
      </p>
      <button
        onClick={() => reset()}
        className="rounded-xl border px-4 py-2 text-sm hover:bg-neutral-50"
      >
        Tentar novamente
      </button>
    </main>
  );
}
