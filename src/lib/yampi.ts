import { YampiOrdersResponse } from '@/types/order'

const YAMPI_API_URL = process.env.YAMPI_API_URL || 'https://api.dooki.com.br/v2'
const YAMPI_STORE_ALIAS = process.env.YAMPI_STORE_ALIAS || ''
const YAMPI_USER_TOKEN = process.env.YAMPI_USER_TOKEN || ''
const YAMPI_USER_SECRET_KEY = process.env.YAMPI_USER_SECRET_KEY || ''

interface FetchOrdersParams {
  page?: number
  limit?: number
  status_id?: string[]
  payment_method?: string[]
  date_from?: string
  date_to?: string
  q?: string
}

export async function fetchOrders(params: FetchOrdersParams = {}): Promise<YampiOrdersResponse> {
  const { page = 1, limit = 100, status_id, payment_method, date_from, date_to, q } = params

  const url = new URL(`${YAMPI_API_URL}/${YAMPI_STORE_ALIAS}/orders`)

  url.searchParams.append('page', page.toString())
  url.searchParams.append('limit', limit.toString())
  url.searchParams.append('include', 'customer,status,items,shipping_address,promocode,transactions')

  if (q) {
    url.searchParams.append('q', q)
  }

  if (status_id && status_id.length > 0) {
    status_id.forEach(id => url.searchParams.append('status_id[]', id))
  }

  if (payment_method && payment_method.length > 0) {
    payment_method.forEach(method => url.searchParams.append('payment_method[]', method))
  }

  if (date_from && date_to) {
    url.searchParams.append('date', `created_at:${date_from}|${date_to}`)
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'User-Token': YAMPI_USER_TOKEN,
      'User-Secret-Key': YAMPI_USER_SECRET_KEY,
      'Content-Type': 'application/json',
    },
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error(`Yampi API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function fetchAllOrders(params: Omit<FetchOrdersParams, 'page' | 'limit'> = {}): Promise<YampiOrdersResponse> {
  const allOrders: YampiOrdersResponse['data'] = []
  let currentPage = 1
  const limit = 100
  let totalPages = 1

  do {
    const response = await fetchOrders({ ...params, page: currentPage, limit })

    if (response.data) {
      allOrders.push(...response.data)
    }

    // Get total pages from meta
    if (response.meta?.pagination) {
      totalPages = response.meta.pagination.total_pages || 1
    }

    currentPage++
  } while (currentPage <= totalPages)

  return {
    data: allOrders,
    meta: {
      pagination: {
        total: allOrders.length,
        count: allOrders.length,
        per_page: allOrders.length,
        current_page: 1,
        total_pages: 1
      }
    }
  }
}

export async function fetchOrderStatuses(): Promise<Array<{ id: number; name: string; alias: string }>> {
  const url = new URL(`${YAMPI_API_URL}/${YAMPI_STORE_ALIAS}/catalog/order-statuses`)

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'User-Token': YAMPI_USER_TOKEN,
      'User-Secret-Key': YAMPI_USER_SECRET_KEY,
      'Content-Type': 'application/json',
    },
    next: { revalidate: 3600 }
  })

  if (!response.ok) {
    return []
  }

  const data = await response.json()
  return data.data || []
}
