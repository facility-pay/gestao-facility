import { getSQL, extractPlano, extractModelo } from "./db";
import { fetchAllOrders } from "./yampi";
import { YampiOrder } from "@/types/order";

export interface SyncResult {
  created: number;
  updated: number;
  errors: number;
  total: number;
}

// Helper to unwrap Yampi's nested data objects
function unwrap<T>(obj: T | { data: T } | null | undefined): T | null {
  if (!obj) return null;
  if (typeof obj === "object" && "data" in obj)
    return (obj as { data: T }).data;
  return obj as T;
}

// Transform Yampi order to database row values
function yampiOrderToDbValues(order: YampiOrder) {
  // Handle items
  const rawItems = order.items;
  const items = Array.isArray(rawItems)
    ? rawItems
    : (rawItems as unknown as { data: YampiOrder["items"] })?.data || [];

  const totalQuantity = Array.isArray(items)
    ? items.reduce((sum, item) => sum + (item?.quantity || 0), 0)
    : 0;
  const firstItem = Array.isArray(items) ? items[0] : null;
  const productName = firstItem?.product?.name || firstItem?.sku?.title || null;

  // Handle address
  const address = unwrap(order.shipping_address);
  const fullAddress = address
    ? `${address.street}, ${address.number} - ${address.neighborhood}, ${address.city}/${address.state}`
    : null;

  // Handle transactions
  const rawTransactions = order.transactions;
  const transactions = Array.isArray(rawTransactions)
    ? rawTransactions
    : (rawTransactions as unknown as { data: YampiOrder["transactions"] })
        ?.data || [];
  const paymentMethod = Array.isArray(transactions)
    ? transactions[0]?.payment_method
    : null;

  // Handle nested objects
  const customer = unwrap(order.customer);
  const status = unwrap(order.status);

  return {
    yampi_order_id: order.id,
    yampi_order_number: order.number,
    cliente: customer?.name || null,
    cpf: customer?.cpf || null,
    cnpj: customer?.cnpj || null,
    telefone: customer?.phone?.full_number || null,
    endereco_entrega: fullAddress,
    data_venda: order.created_at,
    status: status?.name || null,
    forma_pagamento: paymentMethod,
    modelo: extractModelo(productName),
    plano: extractPlano(productName),
    quantidade: totalQuantity,
    link_cupom: productName, // Product name, not coupon code
    valor_bruto: order.value_total,
    valor_liquido: order.value_total - order.value_discount,
    valor_desconto: order.value_discount,
  };
}

export async function syncYampiOrders(): Promise<SyncResult> {
  const sql = getSQL();
  const result: SyncResult = {
    created: 0,
    updated: 0,
    errors: 0,
    total: 0,
  };

  try {
    const yampiResponse = await fetchAllOrders();
    const orders = yampiResponse.data || [];
    result.total = orders.length;

    for (const order of orders) {
      try {
        const values = yampiOrderToDbValues(order);

        // Check if order exists
        const existing = await sql`
          SELECT id FROM orders WHERE yampi_order_id = ${values.yampi_order_id}
        `;

        if (existing.length > 0) {
          // Update existing - preserve editable fields (cpf, cnpj)
          await sql`
            UPDATE orders SET
              yampi_order_number = ${values.yampi_order_number},
              cliente = ${values.cliente},
              telefone = ${values.telefone},
              endereco_entrega = ${values.endereco_entrega},
              data_venda = ${values.data_venda},
              status = ${values.status},
              forma_pagamento = ${values.forma_pagamento},
              modelo = ${values.modelo},
              plano = ${values.plano},
              quantidade = ${values.quantidade},
              link_cupom = ${values.link_cupom},
              valor_bruto = ${values.valor_bruto},
              valor_liquido = ${values.valor_liquido},
              valor_desconto = ${values.valor_desconto},
              updated_at = NOW(),
              last_synced_at = NOW()
            WHERE yampi_order_id = ${values.yampi_order_id}
          `;
          result.updated++;
        } else {
          // Insert new
          await sql`
            INSERT INTO orders (
              yampi_order_id,
              yampi_order_number,
              cliente,
              cpf,
              cnpj,
              telefone,
              endereco_entrega,
              data_venda,
              status,
              forma_pagamento,
              modelo,
              plano,
              quantidade,
              link_cupom,
              valor_bruto,
              valor_liquido,
              valor_desconto,
              source,
              last_synced_at
            ) VALUES (
              ${values.yampi_order_id},
              ${values.yampi_order_number},
              ${values.cliente},
              ${values.cpf},
              ${values.cnpj},
              ${values.telefone},
              ${values.endereco_entrega},
              ${values.data_venda},
              ${values.status},
              ${values.forma_pagamento},
              ${values.modelo},
              ${values.plano},
              ${values.quantidade},
              ${values.link_cupom},
              ${values.valor_bruto},
              ${values.valor_liquido},
              ${values.valor_desconto},
              'yampi',
              NOW()
            )
          `;
          result.created++;
        }
      } catch (error) {
        console.error(`Error syncing order ${order.id}:`, error);
        result.errors++;
      }
    }
  } catch (error) {
    console.error("Error fetching orders from Yampi:", error);
    throw error;
  }

  return result;
}
