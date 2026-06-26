import { config } from "@/config";

export interface PedidoInput {
  nome: string;
  telefone: string;
  arquivo: File;
}

export interface PedidoResult {
  success: boolean;
  message: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // result vem como "data:<mime>;base64,XXXX" — pegamos só a parte base64
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo."));
    reader.readAsDataURL(file);
  });
}

export async function enviarPedido({ nome, telefone, arquivo }: PedidoInput): Promise<PedidoResult> {
  if (!config.GOOGLE_SCRIPT_URL) {
    throw new Error("URL do Google Apps Script não configurada.");
  }

  // Apps Script (doPost) NÃO recebe arquivos via multipart/form-data nativamente.
  // O padrão confiável é enviar o arquivo em base64 dentro de um campo de texto
  // e o Apps Script reconstruir o Blob com Utilities.newBlob(...).
  const base64 = await fileToBase64(arquivo);

  const formData = new FormData();
  formData.append("nome", nome.trim());
  formData.append("telefone", telefone.trim());
  formData.append("comprovante_base64", base64);
  formData.append("comprovante_nome", arquivo.name);
  formData.append("comprovante_mime", arquivo.type || "application/octet-stream");

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
    throw new Error(data.message || "Falha ao enviar comprovante.");
  }

  return data;
}
