import { NextResponse } from "next/server";
import { syncYampiOrders } from "@/lib/sync";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await syncYampiOrders();

    return NextResponse.json({
      success: true,
      message: `Sincronizado com sucesso: ${result.created} criados, ${result.updated} atualizados, ${result.errors} erros`,
      ...result,
    });
  } catch (error) {
    console.error("Error syncing orders:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Falha ao sincronizar pedidos",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
