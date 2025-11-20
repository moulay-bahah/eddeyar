import { NextRequest, NextResponse } from "next/server";
import { turso } from "../tursoClient";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Champs obligatoires manquants" },
        { status: 400 }
      );
    }

    const result = await turso.execute("SELECT * FROM options WHERE id = ?", [
      id,
    ]);
    const option = result.rows[0] || null;

    return NextResponse.json(option, { status: 200 });
  } catch (error) {
    console.error("options by id GET error:", error);
    return NextResponse.json(
      { ok: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
