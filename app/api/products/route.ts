import { NextRequest, NextResponse } from "next/server";
import {
  getProducts,
  createProduct,
  addFile,
  deleteFile,
  renameProduct,
  updateFile,
} from "@/lib/products";

export async function GET() {
  try {
    return NextResponse.json({ products: await getProducts() });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || "addFile";
    if (action === "create") {
      if (!body.name?.trim())
        return NextResponse.json({ error: "Name required" }, { status: 400 });
      await createProduct(body.name.trim());
    } else if (action === "rename") {
      await renameProduct(body.product,body.name);
    } else if (action === "updateFile") {
      await updateFile(body.product,body.filename,body.markdown,body.expectedMarkdown);
    } else if (action === "addFile") {
      if (!body.product?.trim() || !body.filename?.trim())
        return NextResponse.json(
          { error: "product and filename required" },
          { status: 400 }
        );
      await addFile(body.product.trim(), body.filename.trim(), body.markdown || "");
    } else if (action === "deleteFile") {
      await deleteFile(body.product, body.filename);
    } else {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
