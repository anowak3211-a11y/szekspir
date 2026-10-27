import {accountRoute} from '@/lib/account-route';
import { NextRequest, NextResponse } from "next/server";
import {
  getProducts,
  createProduct,
  addFile,
  deleteFile,
  renameProduct,
  updateFile,
} from "@/lib/products";
import { safeDownload } from "@/lib/safe-fetch";
import { brainClient, brainOptions, brainSettings } from "@/lib/account-brain";
import { requiredAccountEnv } from "@/lib/account-context";
import OpenAI from "openai";

async function accountGET() {
  try {
    return NextResponse.json({ products: await getProducts() });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

async function generateProductPack(productName: string, urlInput?: string, notesInput?: string) {
  let pageText = "";
  const cleanUrl = (urlInput || "").trim();
  if (cleanUrl) {
    try {
      const downloaded = await safeDownload(cleanUrl, 2 * 1024 * 1024);
      const html = downloaded.buffer.toString("utf8");
      pageText = html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 18000);
    } catch (e) {
      if (!notesInput?.trim()) {
        throw new Error(`Could not fetch URL (${e instanceof Error ? e.message : String(e)}). Paste a brief/description instead.`);
      }
    }
  }
  const system = `You are a senior Direct Response strategist and product knowledge-base architect for Szekspir.
Given a target product name, optional scraped landing-page text, and optional owner notes/offer details, generate a complete, structured 3-file product pack in JSON format:
{
  "product_profile_json": {
    "product_name": "Exact brand and product name",
    "brand": "Brand name",
    "category": "Product category",
    "delivery_format": "e.g. gummies, capsules, softgels, oil, insoles, diffuser",
    "market": "UK or PL",
    "website": "Storefront domain if known, else empty string",
    "ingredients": ["List of active ingredients / key features"],
    "unique_mechanism": "Core mechanism explaining why it works",
    "offer": "Confirmed bundle/discount offer if provided, else empty string",
    "guarantee": "Confirmed money-back guarantee if provided, else empty string",
    "target_audience": "Primary buyer avatar and core pain points"
  },
  "offer_brief_md": "Detailed Markdown (# Offer & Product Brief) covering: 1. Product Name & Format, 2. Core Problem & Buyer Avatar, 3. Unique Mechanism & Ingredients/Features, 4. Confirmed Offer, Pricing & Guarantee, 5. Competitor Replacement & Disclosure Rules.",
  "master_prompt_direct_md": "Detailed Markdown (# Master Copywriting & Localisation Guidance) covering: 1. Voice & Tone (punchy Direct Response, zero corporate fluff, digits for all numbers), 2. Key Pain Points & Pattern-Interrupt Hooks, 3. How to Adapt Competitor Mechanisms to this Product, 4. Mandatory Words/Claims to Use vs Avoid."
}
Return valid JSON only.`;
  const userContent = JSON.stringify({
    productName,
    url: cleanUrl,
    ownerNotes: (notesInput || "").trim(),
    scrapedPageExcerpt: pageText,
  });

  let raw = "";
  if (brainSettings()) {
    const r = await brainClient(brainOptions(90000)).chat.completions.create({
      model: "gpt-6-sol",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: userContent },
      ],
      max_completion_tokens: 6000,
    });
    raw = r.choices[0]?.message?.content || "";
  } else {
    const client = new OpenAI({ apiKey: requiredAccountEnv("OPENAI_API_KEY"), timeout: 90000, maxRetries: 0 });
    const r = await client.chat.completions.create({
      model: "gpt-6-sol",
      reasoning_effort: "low",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: userContent },
      ],
    });
    raw = r.choices[0]?.message?.content || "";
  }

  const parsed = JSON.parse(raw);
  const profileStr = JSON.stringify(parsed.product_profile_json || { product_name: productName }, null, 2);
  const offerBrief = typeof parsed.offer_brief_md === "string" && parsed.offer_brief_md.trim()
    ? parsed.offer_brief_md.trim()
    : `# ${productName} — Offer & Product Brief\n\n${notesInput || ""}`;
  const masterPrompt = typeof parsed.master_prompt_direct_md === "string" && parsed.master_prompt_direct_md.trim()
    ? parsed.master_prompt_direct_md.trim()
    : `# ${productName} — Master Copywriting Guidance\n\nAdapt competitor scripts to ${productName}.`;

  await addFile(productName, "_product_profile.json", profileStr);
  await addFile(productName, "offer_brief.md", offerBrief);
  await addFile(productName, "master_prompt_direct.md", masterPrompt);
  return ["_product_profile.json", "offer_brief.md", "master_prompt_direct.md"];
}

async function accountPOST(req: NextRequest) {
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
    } else if (action === "generatePack") {
      if (!body.product?.trim())
        return NextResponse.json({ error: "Select a product first" }, { status: 400 });
      if (!body.url?.trim() && !body.notes?.trim())
        return NextResponse.json({ error: "Provide a landing page URL or product description/notes" }, { status: 400 });
      const generated = await generateProductPack(body.product.trim(), body.url, body.notes);
      return NextResponse.json({ ok: true, generated });
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

export const GET=accountRoute(accountGET);
export const POST=accountRoute(accountPOST);

