import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=MXN');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return NextResponse.json({ error: "Error fetching exchange rate" }, { status: 500 });
  }
}
