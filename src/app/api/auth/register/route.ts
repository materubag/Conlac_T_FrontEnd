import { NextResponse } from "next/server";
export async function POST() { return NextResponse.json({ success: false, error: "La creación pública de cuentas está deshabilitada." }, { status: 403 }); }
