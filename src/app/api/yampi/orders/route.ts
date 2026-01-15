import { NextRequest, NextResponse } from "next/server";
import { fetchAllOrders } from "@/lib/yampi";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const q = searchParams.get("q") || undefined;
    const date_from = searchParams.get("date_from") || undefined;
    const date_to = searchParams.get("date_to") || undefined;
    const status_id = searchParams.getAll("status_id");
    const payment_method = searchParams.getAll("payment_method");

    const data = await fetchAllOrders({
      q,
      date_from,
      date_to,
      status_id: status_id.length > 0 ? status_id : undefined,
      payment_method: payment_method.length > 0 ? payment_method : undefined,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
