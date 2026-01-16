import { NextRequest, NextResponse } from "next/server";
import { getSQL, OrderRow } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const sql = getSQL();
    const searchParams = request.nextUrl.searchParams;

    // Get filter parameters
    const q = searchParams.get("q");
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");

    let rows: OrderRow[];

    // Use template literals for type safety
    if (q && dateFrom && dateTo) {
      const searchTerm = `%${q}%`;
      rows = await sql`
        SELECT * FROM orders
        WHERE (cliente ILIKE ${searchTerm} OR cpf ILIKE ${searchTerm} OR cnpj ILIKE ${searchTerm} OR telefone ILIKE ${searchTerm})
        AND data_venda >= ${dateFrom}::timestamp AND data_venda <= ${dateTo}::timestamp
        ORDER BY data_venda DESC
      ` as OrderRow[];
    } else if (q) {
      const searchTerm = `%${q}%`;
      rows = await sql`
        SELECT * FROM orders
        WHERE cliente ILIKE ${searchTerm} OR cpf ILIKE ${searchTerm} OR cnpj ILIKE ${searchTerm} OR telefone ILIKE ${searchTerm}
        ORDER BY data_venda DESC
      ` as OrderRow[];
    } else if (dateFrom && dateTo) {
      rows = await sql`
        SELECT * FROM orders
        WHERE data_venda >= ${dateFrom}::timestamp AND data_venda <= ${dateTo}::timestamp
        ORDER BY data_venda DESC
      ` as OrderRow[];
    } else {
      rows = await sql`
        SELECT * FROM orders
        ORDER BY data_venda DESC
      ` as OrderRow[];
    }

    return NextResponse.json({
      data: rows,
      total: rows.length,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
