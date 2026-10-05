import { NextResponse } from "next/server";

const REQUIRED = ["role", "name", "phone", "clientName", "clientPhone", "need", "budget"] as const;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, error: "Dados inválidos." }, { status: 400 });

  // campo escondido: se veio preenchido, é robô. Finge sucesso e descarta
  if (body.website) return NextResponse.json({ ok: true });

  const missing = REQUIRED.filter((k) => !String(body[k] ?? "").trim());
  if (missing.length || body.consent !== true) {
    return NextResponse.json({ ok: false, error: "Faltam campos obrigatórios." }, { status: 400 });
  }
  if (String(body.details ?? "").length > 900) {
    return NextResponse.json({ ok: false, error: "Os detalhes passaram de 900 caracteres." }, { status: 400 });
  }

  // TODO: aqui você envia a indicação (e-mail com Resend/Nodemailer, banco de dados, planilha...)
  console.log("[indicacao]", body);

  return NextResponse.json({ ok: true });
}
