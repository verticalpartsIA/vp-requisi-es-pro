-- BUG-006: quotation_suppliers.id precisa de DEFAULT gen_random_uuid()
-- Sem isso, INSERT sem id explícito viola a constraint NOT NULL
ALTER TABLE quotation_suppliers ALTER COLUMN id SET DEFAULT gen_random_uuid();
