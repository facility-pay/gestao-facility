import { neon, NeonQueryFunction } from "@neondatabase/serverless";

// Create the SQL template tag function
let sqlInstance: NeonQueryFunction<false, false> | null = null;

export function getSQL(): NeonQueryFunction<false, false> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  if (!sqlInstance) {
    sqlInstance = neon(process.env.DATABASE_URL);
  }
  return sqlInstance;
}

// Export sql for template literal queries
export const sql = getSQL;

// Database row type matching our schema
export interface OrderRow {
  id: number;
  yampi_order_id: number | null;
  yampi_order_number: number | null;
  paytime_transaction_id: string | null;
  cliente: string | null;
  cpf: string | null;
  cnpj: string | null;
  telefone: string | null;
  endereco_entrega: string | null;
  data_venda: Date | null;
  status: string | null;
  forma_pagamento: string | null;
  modelo: string | null;
  plano: string | null;
  quantidade: number | null;
  link_cupom: string | null;
  valor_bruto: number | null;
  valor_liquido: number | null;
  valor_desconto: number | null;
  primeiro_contato: Date | null;
  cad_portal: string | null;
  cad_pagseguro: string | null;
  data_aceite: Date | null;
  maquina: string | null;
  maq_de_rua: string | null;
  data_envio_pos: Date | null;
  forma_pag_pos: string | null;
  manual_cliente: string | null;
  data_envio_manual: Date | null;
  custo_op_pagarme: number | null;
  custo_pos: number | null;
  comissao_afiliado: number | null;
  lucro: number | null;
  source: string;
  created_at: Date;
  updated_at: Date;
  last_synced_at: Date | null;
}

// Extract Plano from product name
// Pattern: "{Model} - PLANO {Plan Name}"
export function extractPlano(productName: string | null): string {
  if (!productName) return "-";

  const match = productName.match(/PLANO\s+(.+)$/i);
  if (match && match[1]) {
    return match[1].trim().toUpperCase();
  }

  return "-";
}

// Extract Modelo (device model) from product name
// Pattern: "{Model} - PLANO {Plan Name}"
export function extractModelo(productName: string | null): string {
  if (!productName) return "-";

  const match = productName.match(/^(.+?)\s*-\s*PLANO/i);
  if (match && match[1]) {
    return match[1].trim();
  }

  // Fallback: return full name if no pattern match
  return productName;
}
