import { NextRequest, NextResponse } from "next/server";
import { getSQL } from "@/lib/db";

export const dynamic = "force-dynamic";

// Editable fields whitelist
const EDITABLE_FIELDS = [
  "cpf",
  "cnpj",
  "primeiro_contato",
  "cad_portal",
  "cad_pagseguro",
  "data_aceite",
  "maquina",
  "maq_de_rua",
  "data_envio_pos",
  "forma_pag_pos",
  "manual_cliente",
  "data_envio_manual",
  "custo_op_pagarme",
  "custo_pos",
  "comissao_afiliado",
  "lucro",
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getSQL();
    const { id } = await params;
    const orderId = parseInt(id, 10);

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: "Invalid order ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Filter only allowed fields
    const validUpdates: Record<string, unknown> = {};
    for (const [field, value] of Object.entries(body)) {
      if (EDITABLE_FIELDS.includes(field)) {
        validUpdates[field] = value;
      }
    }

    if (Object.keys(validUpdates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Handle individual field updates with template literals
    // For simplicity, we'll handle the most common editable fields
    const field = Object.keys(validUpdates)[0];
    const value = validUpdates[field];

    let result;

    switch (field) {
      case "cpf":
        result = await sql`
          UPDATE orders SET cpf = ${value as string}, updated_at = NOW()
          WHERE id = ${orderId} RETURNING *
        `;
        break;
      case "cnpj":
        result = await sql`
          UPDATE orders SET cnpj = ${value as string}, updated_at = NOW()
          WHERE id = ${orderId} RETURNING *
        `;
        break;
      case "primeiro_contato":
        result = await sql`
          UPDATE orders SET primeiro_contato = ${value as string}::date, updated_at = NOW()
          WHERE id = ${orderId} RETURNING *
        `;
        break;
      case "cad_portal":
        result = await sql`
          UPDATE orders SET cad_portal = ${value as string}, updated_at = NOW()
          WHERE id = ${orderId} RETURNING *
        `;
        break;
      case "cad_pagseguro":
        result = await sql`
          UPDATE orders SET cad_pagseguro = ${value as string}, updated_at = NOW()
          WHERE id = ${orderId} RETURNING *
        `;
        break;
      case "data_aceite":
        result = await sql`
          UPDATE orders SET data_aceite = ${value as string}::date, updated_at = NOW()
          WHERE id = ${orderId} RETURNING *
        `;
        break;
      case "maquina":
        result = await sql`
          UPDATE orders SET maquina = ${value as string}, updated_at = NOW()
          WHERE id = ${orderId} RETURNING *
        `;
        break;
      case "maq_de_rua":
        result = await sql`
          UPDATE orders SET maq_de_rua = ${value as string}, updated_at = NOW()
          WHERE id = ${orderId} RETURNING *
        `;
        break;
      case "data_envio_pos":
        result = await sql`
          UPDATE orders SET data_envio_pos = ${value as string}::date, updated_at = NOW()
          WHERE id = ${orderId} RETURNING *
        `;
        break;
      case "forma_pag_pos":
        result = await sql`
          UPDATE orders SET forma_pag_pos = ${value as string}, updated_at = NOW()
          WHERE id = ${orderId} RETURNING *
        `;
        break;
      case "manual_cliente":
        result = await sql`
          UPDATE orders SET manual_cliente = ${value as string}, updated_at = NOW()
          WHERE id = ${orderId} RETURNING *
        `;
        break;
      case "data_envio_manual":
        result = await sql`
          UPDATE orders SET data_envio_manual = ${value as string}::date, updated_at = NOW()
          WHERE id = ${orderId} RETURNING *
        `;
        break;
      case "custo_op_pagarme":
        result = await sql`
          UPDATE orders SET custo_op_pagarme = ${value as number}, updated_at = NOW()
          WHERE id = ${orderId} RETURNING *
        `;
        break;
      case "custo_pos":
        result = await sql`
          UPDATE orders SET custo_pos = ${value as number}, updated_at = NOW()
          WHERE id = ${orderId} RETURNING *
        `;
        break;
      case "comissao_afiliado":
        result = await sql`
          UPDATE orders SET comissao_afiliado = ${value as number}, updated_at = NOW()
          WHERE id = ${orderId} RETURNING *
        `;
        break;
      case "lucro":
        result = await sql`
          UPDATE orders SET lucro = ${value as number}, updated_at = NOW()
          WHERE id = ${orderId} RETURNING *
        `;
        break;
      default:
        return NextResponse.json(
          { error: "Field not supported" },
          { status: 400 }
        );
    }

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getSQL();
    const { id } = await params;
    const orderId = parseInt(id, 10);

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: "Invalid order ID" },
        { status: 400 }
      );
    }

    const result = await sql`
      SELECT * FROM orders WHERE id = ${orderId}
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: result[0],
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
