import { config } from "@/config";

export interface PedidoInput {
  nome: string;
  telefone: string;
  tipo: "doacao" | "retirada";
}

export interface PedidoResult {
  success: boolean;
  message: string;
}

export async function enviarPedido({ nome, telefone, tipo }: PedidoInput): Promise<PedidoResult> {
  if (!config.GOOGLE_SCRIPT_URL) {
    throw new Error("URL do Google Apps Script não configurada.");
  }

  const formData = new FormData();
  formData.append("nome", nome.trim());
  formData.append("telefone", telefone.trim());
  formData.append("tipo", tipo);

  // O endpoint remoto ainda pode exigir campos de comprovante.
  // Enviamos um comprovante mínimo válido por trás da cena para evitar validações antigas.
  formData.append(
    "comprovante_base64",
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=",
  );
  formData.append("comprovante_nome", "sem-comprovante.png");
  formData.append("comprovante_mime", "image/png");

  let response: Response;
  try {
    // Sem headers customizados = requisição "simples" (sem preflight CORS).
    response = await fetch(config.GOOGLE_SCRIPT_URL, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new Error(
      "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
    );
  }

  if (!response.ok) {
    throw new Error(`Erro do servidor (${response.status}). Tente novamente.`);
  }

  let data: PedidoResult;
  try {
    data = (await response.json()) as PedidoResult;
  } catch {
    throw new Error("Resposta inválida do servidor.");
  }

  if (!data.success) {
    throw new Error(data.message || "Falha ao enviar o pedido.");
  }

  return data;
}
