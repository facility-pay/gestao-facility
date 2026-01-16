export interface YampiOrder {
  id: number
  number: number
  customer_id: number
  value_total: number
  value_products: number
  value_discount: number
  value_shipment: number
  value_tax: number
  authorized: boolean
  delivered: boolean
  track_code: string | null
  track_url: string | null
  shipment_service: string | null
  days_delivery: number | null
  // created_at can be string or object with date property
  created_at: string | { date: string }
  updated_at: string
  status?: {
    id: number
    name: string
    alias: string
  }
  customer?: {
    id: number
    name: string
    email: string
    cpf: string | null
    cnpj: string | null
    phone: {
      full_number: string
    } | null
  }
  shipping_address?: {
    street: string
    number: string
    neighborhood: string
    city: string
    state: string
    zipcode: string
  }
  items?: Array<{
    id: number
    product_id: number
    sku_id: number
    quantity: number
    price: number
    sku?: {
      title?: string
      // sku can also have nested data
      data?: {
        title: string
      }
    }
    product?: {
      name: string
    }
  }>
  promocode?: {
    code: string
  } | null
  transactions?: Array<{
    payment_method: string
  }>
  // payments array with name property
  payments?: Array<{
    name: string
    payment_method?: string
  }>
}

export interface SaleRecord {
  id: number
  orderNumber: number
  plano: string
  primeiroContato: string | null
  cadPortal: string | null
  cadPagseguro: string | null
  dataAceite: string | null
  maquina: string | null
  data: string
  cliente: string
  cpf: string | null
  cnpj: string | null
  telefone: string | null
  enderecoEntrega: string | null
  formaPagamento: string | null
  linkCupom: string | null
  maqDeRua: string | null
  dataVenda: string
  modelo: string | null
  quantidade: number
  dataEnvioPOS: string | null
  formaPagPOS: string | null
  status: string
  manualCliente: string | null
  dataEnvioManual: string | null
  valorBruto: number
  valorLiquido: number
  custoOpPagarme: number
  custoPOS: number
  comissaoAfiliado: number
  lucro: number
}

// Database row type
export interface DbOrderRow {
  id: number
  yampi_order_id: number | null
  yampi_order_number: number | null
  paytime_transaction_id: string | null
  cliente: string | null
  cpf: string | null
  cnpj: string | null
  telefone: string | null
  endereco_entrega: string | null
  data_venda: string | null
  status: string | null
  forma_pagamento: string | null
  modelo: string | null
  plano: string | null
  quantidade: number | null
  link_cupom: string | null
  valor_bruto: number | null
  valor_liquido: number | null
  valor_desconto: number | null
  primeiro_contato: string | null
  cad_portal: string | null
  cad_pagseguro: string | null
  data_aceite: string | null
  maquina: string | null
  maq_de_rua: string | null
  data_envio_pos: string | null
  forma_pag_pos: string | null
  manual_cliente: string | null
  data_envio_manual: string | null
  custo_op_pagarme: number | null
  custo_pos: number | null
  comissao_afiliado: number | null
  lucro: number | null
  source: string
  created_at: string
  updated_at: string
  last_synced_at: string | null
}

// Map database row to SaleRecord for display
export function mapDbRowToSaleRecord(row: DbOrderRow): SaleRecord {
  return {
    id: row.id,
    orderNumber: row.yampi_order_number || row.id,
    plano: row.plano || '-',
    primeiroContato: row.primeiro_contato,
    cadPortal: row.cad_portal,
    cadPagseguro: row.cad_pagseguro,
    dataAceite: row.data_aceite,
    maquina: row.maquina,
    data: row.data_venda || '',
    cliente: row.cliente || '-',
    cpf: row.cpf,
    cnpj: row.cnpj,
    telefone: row.telefone,
    enderecoEntrega: row.endereco_entrega,
    formaPagamento: row.forma_pagamento,
    linkCupom: row.link_cupom,
    maqDeRua: row.maq_de_rua,
    dataVenda: row.data_venda || '',
    modelo: row.modelo,
    quantidade: row.quantidade || 0,
    dataEnvioPOS: row.data_envio_pos,
    formaPagPOS: row.forma_pag_pos,
    status: row.status || '-',
    manualCliente: row.manual_cliente,
    dataEnvioManual: row.data_envio_manual,
    valorBruto: row.valor_bruto || 0,
    valorLiquido: row.valor_liquido || 0,
    custoOpPagarme: row.custo_op_pagarme || 0,
    custoPOS: row.custo_pos || 0,
    comissaoAfiliado: row.comissao_afiliado || 0,
    lucro: row.lucro || 0
  }
}

export interface YampiOrdersResponse {
  data: YampiOrder[]
  meta?: {
    pagination?: {
      total: number
      count: number
      per_page: number
      current_page: number
      total_pages: number
    }
  }
}

// Helper to unwrap Yampi's nested data objects
function unwrap<T>(obj: T | { data: T } | null | undefined): T | null {
  if (!obj) return null
  if (typeof obj === 'object' && 'data' in obj) return (obj as { data: T }).data
  return obj as T
}

// Extract date from created_at (can be string or { date: string })
function extractDate(createdAt: string | { date: string }): string {
  if (typeof createdAt === 'string') return createdAt
  if (typeof createdAt === 'object' && createdAt.date) return createdAt.date
  return ''
}

// Item type from YampiOrder
type YampiOrderItem = NonNullable<YampiOrder['items']>[number]

// Get SKU title from item (handles nested data structure)
function getSkuTitle(item: YampiOrderItem | null): string | null {
  if (!item) return null

  // Try sku.data.title first (nested structure)
  const sku = item.sku as { title?: string; data?: { title: string } } | undefined
  if (sku?.data?.title) return sku.data.title

  // Try sku.title directly
  if (sku?.title) return sku.title

  // Fallback to product name
  return item.product?.name || null
}

// Extract Plano from SKU title
// e.g., "Facility Mini - PLANO EXPRESS" → "EXPRESS"
function extractPlano(skuTitle: string | null): string {
  if (!skuTitle) return '-'
  const match = skuTitle.match(/PLANO\s+(.+)$/i)
  return match?.[1]?.trim().toUpperCase() || '-'
}

// Extract Modelo from SKU title - word after "Facility"
// e.g., "Facility Mini - PLANO EXPRESS" → "Mini"
function extractModelo(skuTitle: string | null): string {
  if (!skuTitle) return '-'
  const match = skuTitle.match(/Facility\s+(\w+)/i)
  return match?.[1]?.trim() || '-'
}

export function mapYampiOrderToSaleRecord(order: YampiOrder): SaleRecord {
  // Handle items as either array or object with data property
  const rawItems = order.items
  let items: YampiOrderItem[] = []
  if (Array.isArray(rawItems)) {
    items = rawItems
  } else if (rawItems && typeof rawItems === 'object' && 'data' in rawItems) {
    items = (rawItems as { data: YampiOrderItem[] }).data || []
  }

  const totalQuantity = items.reduce((sum, item) => sum + (item?.quantity || 0), 0)
  const firstItem = items[0] || null

  // Get SKU title from first item (handles nested sku.data.title)
  const skuTitle = getSkuTitle(firstItem)

  // Handle address
  const address = unwrap(order.shipping_address)
  const fullAddress = address
    ? `${address.street}, ${address.number} - ${address.neighborhood}, ${address.city}/${address.state}`
    : null

  // Payment type for handling nested data
  type PaymentItem = NonNullable<YampiOrder['payments']>[number]

  // Get payment method from payments[0].name
  const rawPayments = order.payments
  let payments: PaymentItem[] = []
  if (Array.isArray(rawPayments)) {
    payments = rawPayments
  } else if (rawPayments && typeof rawPayments === 'object' && 'data' in rawPayments) {
    payments = (rawPayments as { data: PaymentItem[] }).data || []
  }
  const paymentName = payments.length > 0 ? payments[0]?.name : null

  // Handle nested objects
  const customer = unwrap(order.customer)
  const status = unwrap(order.status)

  // Extract date from created_at
  const dateValue = extractDate(order.created_at)

  return {
    id: order.id,
    orderNumber: order.number,
    plano: extractPlano(skuTitle),
    primeiroContato: null,
    cadPortal: null,
    cadPagseguro: null,
    dataAceite: null,
    maquina: null,
    data: dateValue,
    cliente: customer?.name || '-',
    cpf: customer?.cpf || null,
    cnpj: customer?.cnpj || null,
    telefone: customer?.phone?.full_number || null,
    enderecoEntrega: fullAddress,
    formaPagamento: paymentName,
    linkCupom: skuTitle || '-',
    maqDeRua: null,
    dataVenda: dateValue,
    modelo: extractModelo(skuTitle),
    quantidade: totalQuantity,
    dataEnvioPOS: null,
    formaPagPOS: null,
    status: status?.name || '-',
    manualCliente: null,
    dataEnvioManual: null,
    valorBruto: order.value_total,
    valorLiquido: order.value_total - order.value_discount,
    custoOpPagarme: 0,
    custoPOS: 0,
    comissaoAfiliado: 0,
    lucro: 0
  }
}
