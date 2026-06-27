import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Check, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { enviarPedido } from "@/services/pedidos";

export const Route = createFileRoute("/formulario")({
  head: () => ({
    meta: [
      { title: "Concluir pedido — Pizza Solidária" },
      {
        name: "description",
        content: "Finalize seu pedido informando seu nome e telefone.",
      },
    ],
  }),
  component: FormularioPage,
});

const schema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome completo").max(120),
  telefone: z
    .string()
    .trim()
    .min(10, "Telefone inválido")
    .max(20, "Telefone inválido"),
});

function FormularioPage() {
  const [confirmed, setConfirmed] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ nome, telefone });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Verifique os dados");
      return;
    }
    setSubmitting(true);
    try {
      await enviarPedido({ nome: parsed.data.nome, telefone: parsed.data.telefone });
      setPedidoConfirmado(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro inesperado";
      toast.error("Não foi possível enviar", { description: message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen w-full px-6 py-10 md:py-16">
      <div className="mx-auto w-full max-w-xl">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>

        <div className="fade-in rounded-2xl border border-border bg-card p-7 shadow-[var(--shadow-soft)] md:p-9">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Concluir pedido
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Antes de continuar, confirme que o pagamento já foi realizado. Isso leva menos de 1
            minuto.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <p className="text-sm font-medium text-foreground">
                Você já realizou o pagamento?
              </p>
              <button
                type="button"
                onClick={() => setConfirmed(true)}
                disabled={confirmed}
                className="mt-3 inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-5 py-3 text-sm font-medium text-accent transition-all hover:scale-[1.02] hover:bg-accent/20 disabled:cursor-default disabled:opacity-100"
              >
                {confirmed ? <Check className="h-4 w-4" /> : null}
                {confirmed ? "Pagamento confirmado" : "Sim, já realizei o pagamento"}
              </button>
            </div>

            <fieldset
              disabled={!confirmed}
              className="space-y-5 transition-opacity disabled:opacity-50"
            >
              <Field label="Nome completo" htmlFor="nome">
                <input
                  id="nome"
                  type="text"
                  autoComplete="name"
                  placeholder="João da Silva"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent/60 focus:ring-2 focus:ring-accent/30"
                />
              </Field>

              <Field label="Telefone" htmlFor="telefone">
                <input
                  id="telefone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="(45) 99999-9999"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent/60 focus:ring-2 focus:ring-accent/30"
                />
              </Field>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-4 text-base font-medium text-primary-foreground transition-all hover:scale-[1.02] hover:bg-[oklch(0.65_0.15_148)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Enviando...
                  </>
                ) : (
                  "Concluir pedido"
                )}
              </button>
            </fieldset>
          </form>

          {pedidoConfirmado && (
            <div
              className="mt-8 rounded-[20px] border border-border bg-card p-6 shadow-[var(--shadow-soft)]"
              role="status"
              aria-live="polite"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FCD201] text-[#0F1115]">
                <span className="text-3xl font-bold">✓</span>
              </div>
              <h2 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
                Contribuição registrada!
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Obrigado por fazer parte. Baixe seu ticket de retirada e apresente no dia para
                retirar sua pizza.
              </p>
              <a
                href="/ticket-retirada.png"
                download="ticket-retirada-lagoinha.png"
                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[#FCD201] px-5 py-4 text-base font-bold text-[#0F1115] transition hover:bg-[#e6c00d] focus:outline-none focus:ring-2 focus:ring-yellow-300"
              >
                Baixar meu ticket
              </a>
              <p className="mt-4 text-sm text-muted-foreground">
                Retirada em 22/08, das 14h às 15h, na Av. José João Muraro, 1658.
              </p>
              <button
                type="button"
                onClick={() => setPedidoConfirmado(false)}
                className="mt-4 text-sm font-medium text-primary underline-offset-4 transition hover:underline"
              >
                Refazer pedido
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

function SuccessScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="fade-in w-full max-w-md rounded-2xl border border-border bg-card p-9 text-center shadow-[var(--shadow-soft)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Pedido concluído</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Seu pedido foi enviado com sucesso. Nossa equipe fará a conferência do pagamento.
          <br />
          <br />
          Muito obrigado por contribuir com nossa missão. Que Deus abençoe sua família.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center justify-center rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
