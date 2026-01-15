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
  created_at: string
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
      title: string
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
  cpfCnpj: string | null
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

export function mapYampiOrderToSaleRecord(order: YampiOrder): SaleRecord {
  // Handle items as either array or object with data property
  const rawItems = order.items
  const items = Array.isArray(rawItems)
    ? rawItems
    : (rawItems as unknown as { data: YampiOrder['items'] })?.data || []

  const totalQuantity = Array.isArray(items) ? items.reduce((sum, item) => sum + (item?.quantity || 0), 0) : 0
  const firstItem = Array.isArray(items) ? items[0] : null
  const productName = firstItem?.product?.name || firstItem?.sku?.title || '-'

  // Handle nested objects that might have data wrapper
  const unwrap = <T>(obj: T | { data: T } | null | undefined): T | null => {
    if (!obj) return null
    if (typeof obj === 'object' && 'data' in obj) return (obj as { data: T }).data
    return obj as T
  }

  const address = unwrap(order.shipping_address)
  const fullAddress = address
    ? `${address.street}, ${address.number} - ${address.neighborhood}, ${address.city}/${address.state}`
    : null

  const rawTransactions = order.transactions
  const transactions = Array.isArray(rawTransactions)
    ? rawTransactions
    : (rawTransactions as unknown as { data: YampiOrder['transactions'] })?.data || []
  const paymentMethod = Array.isArray(transactions) ? transactions[0]?.payment_method : null

  const customer = unwrap(order.customer)
  const status = unwrap(order.status)
  const promocode = unwrap(order.promocode)

  return {
    id: order.id,
    orderNumber: order.number,
    plano: '-',
    primeiroContato: null,
    cadPortal: null,
    cadPagseguro: null,
    dataAceite: null,
    maquina: null,
    data: order.created_at,
    cliente: customer?.name || '-',
    cpfCnpj: customer?.cpf || customer?.cnpj || null,
    telefone: customer?.phone?.full_number || null,
    enderecoEntrega: fullAddress,
    formaPagamento: paymentMethod || null,
    linkCupom: promocode?.code || null,
    maqDeRua: null,
    dataVenda: order.created_at,
    modelo: productName,
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
