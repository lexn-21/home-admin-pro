-- Fehlende Foreign Keys ergänzen, damit PostgREST-Embeds (properties(name)) zuverlässig funktionieren.
-- Vorher: Embed lieferte für tenants/payments Fehler → nach Insert verschwanden Listeneinträge scheinbar.

-- 1) tenants.property_id → properties.id
ALTER TABLE public.tenants
  ADD CONSTRAINT tenants_property_id_fkey
  FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE SET NULL;

-- 2) payments.property_id → properties.id
ALTER TABLE public.payments
  ADD CONSTRAINT payments_property_id_fkey
  FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tenants_property_id ON public.tenants(property_id);
CREATE INDEX IF NOT EXISTS idx_payments_property_id ON public.payments(property_id);