-- Gestão FacilityPay Database Schema
-- Run this SQL in your Neon Postgres database to create the orders table

-- Main orders table (unified from all sources)
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,

  -- Identifiers
  yampi_order_id INTEGER UNIQUE,
  yampi_order_number INTEGER,
  paytime_transaction_id VARCHAR(255),

  -- Customer Info (from Yampi, editable)
  cliente VARCHAR(255),
  cpf VARCHAR(14),           -- EDITABLE
  cnpj VARCHAR(18),          -- EDITABLE
  telefone VARCHAR(20),
  endereco_entrega TEXT,

  -- Order Details
  data_venda TIMESTAMP,
  status VARCHAR(100),
  forma_pagamento VARCHAR(50),

  -- Product Info
  modelo VARCHAR(255),       -- Extracted model from product name
  plano VARCHAR(50),         -- Extracted plan from product name
  quantidade INTEGER,
  link_cupom VARCHAR(255),   -- Product name (not URL)

  -- Financial (from Yampi)
  valor_bruto DECIMAL(10,2),
  valor_liquido DECIMAL(10,2),
  valor_desconto DECIMAL(10,2),

  -- Operational Fields (editable/from Paytime)
  primeiro_contato DATE,
  cad_portal VARCHAR(50),
  cad_pagseguro VARCHAR(50),
  data_aceite DATE,
  maquina VARCHAR(100),
  maq_de_rua VARCHAR(50),
  data_envio_pos DATE,
  forma_pag_pos VARCHAR(50),
  manual_cliente VARCHAR(50),
  data_envio_manual DATE,

  -- Financial Costs (editable/from Paytime)
  custo_op_pagarme DECIMAL(10,2) DEFAULT 0,
  custo_pos DECIMAL(10,2) DEFAULT 0,
  comissao_afiliado DECIMAL(10,2) DEFAULT 0,
  lucro DECIMAL(10,2) DEFAULT 0,

  -- Metadata
  source VARCHAR(20) DEFAULT 'yampi',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_synced_at TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_orders_yampi_id ON orders(yampi_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_cpf ON orders(cpf);
CREATE INDEX IF NOT EXISTS idx_orders_cnpj ON orders(cnpj);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_data_venda ON orders(data_venda);
CREATE INDEX IF NOT EXISTS idx_orders_plano ON orders(plano);
CREATE INDEX IF NOT EXISTS idx_orders_forma_pagamento ON orders(forma_pagamento);

-- Comment on table
COMMENT ON TABLE orders IS 'Unified orders table from Yampi and Paytime APIs';

-- Comments on editable columns
COMMENT ON COLUMN orders.cpf IS 'Customer CPF - editable field, preserved during sync';
COMMENT ON COLUMN orders.cnpj IS 'Customer CNPJ - editable field, preserved during sync';
COMMENT ON COLUMN orders.primeiro_contato IS 'First contact date - editable';
COMMENT ON COLUMN orders.cad_portal IS 'Portal registration status - editable';
COMMENT ON COLUMN orders.cad_pagseguro IS 'Pagseguro registration status - editable';
COMMENT ON COLUMN orders.data_aceite IS 'Acceptance date - editable';
COMMENT ON COLUMN orders.maquina IS 'Machine identifier - editable';
COMMENT ON COLUMN orders.maq_de_rua IS 'Street machine - editable';
COMMENT ON COLUMN orders.data_envio_pos IS 'POS shipment date - editable';
COMMENT ON COLUMN orders.forma_pag_pos IS 'POS payment method - editable';
COMMENT ON COLUMN orders.manual_cliente IS 'Customer manual status - editable';
COMMENT ON COLUMN orders.data_envio_manual IS 'Manual shipment date - editable';
COMMENT ON COLUMN orders.custo_op_pagarme IS 'Pagarme operational cost - editable';
COMMENT ON COLUMN orders.custo_pos IS 'POS cost - editable';
COMMENT ON COLUMN orders.comissao_afiliado IS 'Affiliate commission - editable';
COMMENT ON COLUMN orders.lucro IS 'Profit - editable';
