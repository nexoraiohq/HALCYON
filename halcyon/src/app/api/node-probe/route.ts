import { createRequire } from "node:module";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const out: Record<string, unknown> = {
    node: process.version,
    execArgv: process.execArgv,
    nodeOptions: process.env.NODE_OPTIONS ?? null,
  };
  try {
    const req = createRequire(import.meta.url);
    out.resolvedJose = req.resolve("jose");
    req("jose");
    out.requireJose = "OK";
  } catch (e) {
    const err = e as Error & { code?: string };
    out.requireJose = `${err.code ?? ""} :: ${err.message?.split("\n")[0]}`;
  }
  return NextResponse.json(out);
}
