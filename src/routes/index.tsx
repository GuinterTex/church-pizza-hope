import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";
import { config } from "@/config";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pizza Solidária — Igreja Lagoinha Toledo" },
      {
        name: "description",
        content:
          "Uma pizza pode alimentar muito mais do que pessoas. Ao participar, você fortalece nossa missão.",
      },
    ],
  }),
  component: IndexPage,
});

function IndexPage() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [counting, setCounting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!counting) return;
    const start = Date.now();
    const total = 3000;
    const tick = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / total) * 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(tick);
        navigate({ to: "/formulario" });
      }
    }, 30);
    return () => clearInterval(tick);
  }, [counting, navigate]);

  async function handlePix() {
    try {
      await navigator.clipboard.writeText(config.PIX_KEY);
    } catch {
      // ignore — usuário ainda pode copiar manualmente
    }
    setCopied(true);
    toast.success("Chave PIX copiada", {
      description:
        "Abra seu banco, realize o pagamento e em seguida prosseguiremos para finalizar seu pedido.",
    });
    setCounting(true);
  }

  return (
    <main className="min-h-screen w-full px-6 py-10 md:py-16 lg:px-12">
      <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[3fr_2fr] lg:gap-16">
        {/* Coluna esquerda */}
        <section className="fade-in flex flex-col gap-10">
          <header className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card">
              <DoveIcon className="h-4 w-4 text-accent" aria-hidden />
            </div>
            <span className="font-medium tracking-wide">{config.IGREJA}</span>
          </header>

          <div className="space-y-5">
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              Pizza Solidária
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Uma pizza que alimenta muito mais do que a fome.
              <br className="hidden md:block" />
              Ao participar, você ajuda a fortalecer nossa igreja e a crescer o Reino aqui em Toledo.
            </p>
          </div>


          <article className="rounded-2xl border border-border bg-card p-6 md:p-7">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Pizza Calabresa</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">
                  {config.VALOR_PIZZA}
                </p>
              </div>
              <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                Edição única
              </span>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              Toda arrecadação será destinada às ações missionárias da igreja.
            </p>
          </article>
        </section>

        {/* Coluna direita */}
        <aside className="fade-in lg:sticky lg:top-12 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-7 shadow-[var(--shadow-soft)] md:p-9">
            <h2 className="text-2xl font-semibold tracking-tight">Finalizar contribuição</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Escolha a forma de pagamento.
            </p>

            <button
              onClick={handlePix}
              disabled={counting}
              aria-label="Pagar com PIX e copiar chave"
              className="group mt-8 flex w-full items-center justify-between gap-3 rounded-xl bg-primary px-5 py-4 text-left text-base font-medium text-primary-foreground transition-all duration-200 hover:scale-[1.02] hover:bg-[oklch(0.65_0.15_148)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
            >
              <span className="flex items-center gap-3">
                <PixIcon />
                <span>Pagar com PIX</span>
              </span>
              {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5 opacity-80" />}
            </button>

            <div className="mt-6 rounded-xl border border-border bg-background/40 p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Chave PIX
              </p>
              <p className="mt-1 break-all font-mono text-sm text-foreground">
                {config.PIX_KEY}
              </p>
            </div>

            {counting && (
              <div className="fade-in mt-7 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Estamos preparando a próxima etapa. Você será redirecionado para completar seu
                  pedido.
                </p>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-accent transition-[width] duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground">
              Pagamento processado pelo seu próprio banco. <br />
              Não armazenamos dados financeiros.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

function DoveIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
    </svg>
  );
}

function PixIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M18.3 16.3L13.7 20.9c-.94.94-2.46.94-3.4 0L5.7 16.3a2.4 2.4 0 010-3.4l4.6-4.6a2.4 2.4 0 013.4 0l4.6 4.6a2.4 2.4 0 010 3.4z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M7 11l2-2M15 11l2-2M9 15l2 2M13 17l2-2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
