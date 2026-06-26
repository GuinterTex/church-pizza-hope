// Configurações públicas da aplicação.
// PIX_KEY é exibida no front-end (cliente copia ao clicar).
// GOOGLE_SCRIPT_URL é o endpoint do Apps Script que grava no Google Sheets
// e salva o comprovante no Drive.

export const config = {
  PIX_KEY: "45991271068",
  VALOR_PIZZA: "R$ 40,00",
  IGREJA: "Igreja Lagoinha Toledo - PR",

  GOOGLE_SCRIPT_URL:
    "https://script.google.com/macros/s/AKfycbyFphSXA8HRnDKAx-wUXUqbEG7LzcQWG1OmeAfqZo6uADb_-v6HyJVEadmwjNO5x2o6Jg/exec",
} as const;

export type AppConfig = typeof config;
