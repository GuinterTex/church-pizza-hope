
CREATE TABLE public.pedidos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  comprovante_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.pedidos TO anon, authenticated;
GRANT ALL ON public.pedidos TO service_role;

ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create pedidos"
  ON public.pedidos FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
