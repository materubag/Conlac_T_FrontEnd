import { NextResponse } from "next/server";
import { createAssociation, getAssociations } from "@/lib/data";

export async function GET() {
  const associations = await getAssociations();

  return NextResponse.json(associations);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const nuevaAsociacion = await createAssociation(data);

    await getAssociations();

    return NextResponse.json(nuevaAsociacion, {
      status: 201,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "No se pudo crear la asociación.",
      },
      {
        status: 500,
      }
    );
  }
}