import { createHmac, timingSafeEqual } from 'crypto';

export const BENNETT_SHOP_DOMAIN = 'ucnevy-h8.myshopify.com';
export const BENNETT_PUBLIC_ORIGIN = 'https://bennettseed.co';
export const BENNETT_SELLING_PLAN_ID = 739110617478;
export const RATE_ADJ_PRODUCT_ID = 16689019650438;
export const RATE_ADJ_VARIANTS: Record<number, number> = {
  8: 68360918761862,
  16: 68360918794630,
  24: 68360918827398,
};

const SIGN_SECRET =
  process.env.BENNETT_SUB_SECRET ||
  process.env.CRON_SECRET ||
  process.env.BENNETT_UK_CAPI_KEY ||
  'bs_sub_hmac_v1_9f4e2a8d7c';

let runtimeLoopTokenOverride = '';

export function setRuntimeLoopToken(tok: string) {
  runtimeLoopTokenOverride = tok.trim();
}

function getLoopToken(): string {
  const tok = (runtimeLoopTokenOverride || process.env.LOOP_BENNETT_JWT || '').trim();
  if (!tok) {
    throw new Error('Loop service token is not configured (LOOP_BENNETT_JWT)');
  }
  return tok;
}

async function loopFetch<T = Record<string, unknown>>(
  method: 'GET' | 'POST' | 'PUT',
  url: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const tok = getLoopToken();
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${tok}`,
      token: tok,
      'Content-Type': 'application/json',
      Origin: 'https://ucnevy-h8.app.loopwork.co',
      Referer: 'https://ucnevy-h8.app.loopwork.co/',
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    cache: 'no-store',
    signal: AbortSignal.timeout(25000),
  });
  const json = (await res.json().catch(() => ({}))) as T;
  return json;
}

export interface SessionTokenPayload {
  email: string;
  loopId: number;
  shopifyId: number;
  paidOrdersCount: number;
  feeGbp: number;
  nextScheduleId: number | null;
  nextBillingUnix: number | null;
  exp: number;
}

export function signSubSession(payload: Omit<SessionTokenPayload, 'exp'>): string {
  const full: SessionTokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 3600,
  };
  const dataB64 = Buffer.from(JSON.stringify(full), 'utf8').toString('base64url');
  const sig = createHmac('sha256', SIGN_SECRET).update(dataB64).digest('base64url');
  return `${dataB64}.${sig}`;
}

export function verifySubSession(token: string): SessionTokenPayload | null {
  if (!token || !token.includes('.')) return null;
  const [dataB64, sig] = token.split('.', 2);
  if (!dataB64 || !sig) return null;
  const expected = createHmac('sha256', SIGN_SECRET).update(dataB64).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(dataB64, 'base64url').toString('utf8')) as SessionTokenPayload;
    if (!parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export interface EnrichedSubscription {
  loopId: number;
  shopifyId: number;
  firstName: string;
  email: string;
  itemsSummary: string;
  recurringPriceGbp: number;
  paidOrdersCount: number;
  minCycles: number;
  eligibleForFreeCancel: boolean;
  paidJarsCount: number;
  feeGbp: number;
  adjustmentVariantId: number;
  checkoutBuyoutUrl: string;
  cardSummary: string | null;
  hasSavedCard: boolean;
  nextBillingUnix: number | null;
  nextBillingIso: string | null;
  nextScheduleId: number | null;
  within48hWindow: boolean;
  sessionToken: string;
}

function computePaidJarsCount(discountedTotal: number): number {
  if (discountedTotal >= 60) return 3;
  if (discountedTotal >= 40) return 2;
  return 1;
}

function formatBrand(raw?: unknown): string {
  const s = String(raw || '').trim();
  if (!s) return 'Card';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export async function findActiveSubscriptionsByEmail(rawEmail: string): Promise<EnrichedSubscription[]> {
  const cleanEmail = rawEmail.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) return [];

  const searchUrl =
    `https://api.loopwork.co/api/merchant/subscriptionContract/allWithDetails` +
    `?sort_column=createdAt&sort_type=DESC&search_string=${encodeURIComponent(cleanEmail)}` +
    `&page=1&is_billing_retry_on=false&itemsSeparator=${encodeURIComponent('|||')}`;

  const searchRes = await loopFetch<{
    success?: boolean;
    data?: { contracts?: Array<Record<string, unknown>> };
  }>('GET', searchUrl);

  const contracts = (searchRes?.data?.contracts || []).filter(c => {
    const em = String(c.email || '').trim().toLowerCase();
    const st = Number(c.status || 0);
    // status 1 = ACTIVE, status 2 = PAUSED
    return em === cleanEmail && (st === 1 || st === 2);
  });

  const out: EnrichedSubscription[] = [];
  for (const c of contracts) {
    const loopId = Number(c.id);
    const shopifyId = Number(c.shopify_id);
    if (!loopId || !shopifyId) continue;

    const [detailRes, histRes, schedRes] = await Promise.all([
      loopFetch<{ success?: boolean; data?: Record<string, unknown> }>(
        'GET',
        `https://api.loopwork.co/api/merchant/subscriptionContract/read_by_shopify_id?shopify_id=${shopifyId}`,
      ),
      loopFetch<{ success?: boolean; data?: { total_count?: number; results?: Array<Record<string, unknown>> } }>(
        'GET',
        `https://api.loopwork.co/api/merchant/subscriptionContract/ordersHistory?subscriptionContract_id=${loopId}&page=1&limit=10`,
      ),
      loopFetch<{ success?: boolean; data?: { results?: Array<Record<string, unknown>> } }>(
        'GET',
        `https://api.loopwork.co/api/merchant/subscriptionContract/ordersSchedule?subscriptionContract_id=${loopId}&page=1&limit=5`,
      ),
    ]);

    const detail = detailRes?.data || {};
    const paidHistCount = (histRes?.data?.results || []).filter(
      r => String(r.financial_status || '').toLowerCase() === 'paid',
    ).length;
    const paidOrdersCount = Math.max(
      1,
      Number(detail.billing_attempt_success_count || 0),
      paidHistCount,
    );

    const recurringPriceGbp = Number(
      detail.total_line_item_discounted_price ?? c.total_line_item_discounted_price ?? 23.99,
    );
    const paidJarsCount = computePaidJarsCount(recurringPriceGbp);
    const feeGbp = paidJarsCount * 8;
    const adjustmentVariantId = RATE_ADJ_VARIANTS[feeGbp] || RATE_ADJ_VARIANTS[8];

    const pm = (detail.payment_method || {}) as Record<string, unknown>;
    const inst = (pm.payment_instrument || {}) as Record<string, unknown>;
    const last4 = String(inst.lastDigits || inst.virtualLastDigits || '').trim();
    const brand = formatBrand(inst.brand);
    const isRevoked = Number(pm.is_revoked || 0) === 1 || Boolean(detail.customerPaymentMethod_revokedAt);
    const hasSavedCard = Boolean(pm.id && !isRevoked);
    const cardSummary = hasSavedCard ? (last4 ? `${brand} •••• ${last4}` : `Saved ${brand}`) : null;

    const upcoming = (schedRes?.data?.results || []).find(r => Number(r.future_order_status) === 2) ||
      (schedRes?.data?.results || [])[0] ||
      null;
    const nextScheduleId = upcoming?.id ? Number(upcoming.id) : null;
    const nextBillingUnix = Number(upcoming?.billing_date || detail.next_billing_date || c.next_billing_date || 0) || null;
    const nextBillingIso = nextBillingUnix ? new Date(nextBillingUnix * 1000).toISOString() : null;
    const nowUnix = Math.floor(Date.now() / 1000);
    const within48hWindow = Boolean(nextBillingUnix && nextBillingUnix - nowUnix < 48 * 3600);

    const checkoutBuyoutUrl =
      `${BENNETT_PUBLIC_ORIGIN}/cart/${adjustmentVariantId}:1` +
      `?checkout[email]=${encodeURIComponent(cleanEmail)}` +
      `&attributes[bs_cancel_contract]=${encodeURIComponent(String(loopId))}` +
      `&attributes[bs_cancel_shopify_id]=${encodeURIComponent(String(shopifyId))}` +
      `&attributes[bs_cancel_email]=${encodeURIComponent(cleanEmail)}`;

    const sessionToken = signSubSession({
      email: cleanEmail,
      loopId,
      shopifyId,
      paidOrdersCount,
      feeGbp,
      nextScheduleId,
      nextBillingUnix,
    });

    out.push({
      loopId,
      shopifyId,
      firstName: String(c.first_name || 'Member').trim(),
      email: cleanEmail,
      itemsSummary: String(c.items || 'Cold-Pressed Pumpkin Seed Oil').replace(/\|\|\|/g, ', '),
      recurringPriceGbp,
      paidOrdersCount,
      minCycles: 2,
      eligibleForFreeCancel: paidOrdersCount >= 2,
      paidJarsCount,
      feeGbp,
      adjustmentVariantId,
      checkoutBuyoutUrl,
      cardSummary,
      hasSavedCard,
      nextBillingUnix,
      nextBillingIso,
      nextScheduleId,
      within48hWindow,
      sessionToken,
    });
  }

  return out;
}

export async function delaySubscription28Days(
  loopId: number,
  nextScheduleId: number | null,
  currentBillingUnix: number | null,
): Promise<{ ok: boolean; message: string; newDateIso?: string }> {
  const baseUnix = currentBillingUnix && currentBillingUnix > Math.floor(Date.now() / 1000)
    ? currentBillingUnix
    : Math.floor(Date.now() / 1000) + 7 * 86400;
  const newBillingUnix = baseUnix + 28 * 86400;

  if (nextScheduleId) {
    const res = await loopFetch<{ success?: boolean; message?: string }>(
      'POST',
      'https://api.loopwork.co/api/merchant/subscriptionContract/rescheduleOneOrder',
      {
        subscriptionContractId: loopId,
        orderId: nextScheduleId,
        newBillingDate: newBillingUnix,
        recalculateFutureOrders: true,
        userTimezone: 'Europe/London',
        notifyCustomer: true,
      },
    );
    if (res?.success) {
      return {
        ok: true,
        message: 'Your upcoming delivery has been shifted forward by 28 days.',
        newDateIso: new Date(newBillingUnix * 1000).toISOString(),
      };
    }

    const skipRes = await loopFetch<{ success?: boolean; message?: string }>(
      'POST',
      'https://api.loopwork.co/api/merchant/subscriptionContract/skipOrder',
      {
        subscriptionContractId: loopId,
        orderId: nextScheduleId,
        notifyCustomer: true,
      },
    );
    if (skipRes?.success) {
      return {
        ok: true,
        message: 'Your upcoming refill has been skipped — zero charge this cycle.',
      };
    }
    return { ok: false, message: res?.message || skipRes?.message || 'Unable to reschedule right now.' };
  }

  return { ok: false, message: 'No upcoming scheduled order found to shift.' };
}

export async function applyRetentionDiscount30(loopId: number): Promise<{ ok: boolean; message: string }> {
  const res = await loopFetch<{ success?: boolean; message?: string }>(
    'POST',
    'https://api.loopwork.co/api/merchant/subscriptionContract/addDiscount',
    {
      subscriptionContractId: loopId,
      discountConfig: {
        value: 30,
        code: '',
        type: 'PERCENTAGE',
        recurringCycleLimit: 3,
        title: 'VIP 30% Member Retention Discount',
      },
    },
  );
  if (res?.success) {
    return {
      ok: true,
      message: 'Extra 30% OFF has been applied to your next 3 subscription refills!',
    };
  }
  return { ok: false, message: res?.message || 'Discount is already active on your subscription.' };
}

export async function cancelLoopSubscription(
  loopId: number,
  reason: string,
  comment: string,
): Promise<{ ok: boolean; message: string }> {
  const res = await loopFetch<{ success?: boolean; message?: string }>(
    'POST',
    'https://api.loopwork.co/api/merchant/subscriptionContract/cancel',
    {
      subscriptionContract_id: loopId,
      reason,
      comment: comment.slice(0, 250),
      notifyCustomer: true,
      shouldMarkForCancellation: false,
    },
  );
  if (res?.success) {
    return { ok: true, message: 'Your subscription has been cancelled and confirmed by email.' };
  }
  return { ok: false, message: res?.message || 'Unable to cancel subscription right now.' };
}

export async function chargeSavedCardAndCancel(
  loopId: number,
  shopifyId: number,
  feeGbp: number,
): Promise<{ ok: boolean; message: string; cardDeclined?: boolean }> {
  const adjustmentVariantId = RATE_ADJ_VARIANTS[feeGbp] || RATE_ADJ_VARIANTS[8];

  const [detailRes, beforeHistRes] = await Promise.all([
    loopFetch<{ success?: boolean; data?: Record<string, unknown> }>(
      'GET',
      `https://api.loopwork.co/api/merchant/subscriptionContract/read_by_shopify_id?shopify_id=${shopifyId}`,
    ),
    loopFetch<{ success?: boolean; data?: { results?: Array<Record<string, unknown>> } }>(
      'GET',
      `https://api.loopwork.co/api/merchant/subscriptionContract/ordersHistory?subscriptionContract_id=${loopId}&page=1&limit=10`,
    ),
  ]);

  const detail = detailRes?.data;
  if (!detail) {
    return { ok: false, message: 'Subscription contract could not be loaded.' };
  }

  const originalLines = Array.isArray(detail.line_items)
    ? (detail.line_items as Array<Record<string, unknown>>)
    : [];
  const beforePaidIds = new Set(
    (beforeHistRes?.data?.results || [])
      .filter(r => String(r.financial_status || '').toLowerCase() === 'paid')
      .map(r => Number(r.shopify_id || r.id)),
  );

  // 1. Add the £8/£16/£24 non-shipping rate adjustment line to the contract
  const addRes = await loopFetch<{ success?: boolean; message?: string }>(
    'POST',
    'https://api.loopwork.co/api/merchant/subscriptionContract/add_line',
    {
      subscriptionContract_id: loopId,
      productVariantId: adjustmentVariantId,
      quantity: 1,
      basePrice: feeGbp,
      pricingPolicy: null,
      sellingPlanShopifyId: null,
      type: 'subscription',
      discountType: 'FIXED_AMOUNT',
      discountValue: 0,
      recurringDiscountPolicyApplied: false,
      recurringDiscountAfterCycle: 1,
      recurringDiscountType: 'FIXED_AMOUNT',
      recurringDiscountValue: 0,
    },
  );
  if (!addRes?.success) {
    return {
      ok: false,
      cardDeclined: true,
      message: addRes?.message || 'Unable to prepare saved-card charge — please use Apple Pay / Express Checkout below.',
    };
  }

  // Verify the adjustment line is present on the contract before removing original physical lines
  const afterAddRes = await loopFetch<{ data?: Record<string, unknown> }>(
    'GET',
    `https://api.loopwork.co/api/merchant/subscriptionContract/read_by_shopify_id?shopify_id=${shopifyId}`,
  );
  const afterAddLines = Array.isArray(afterAddRes?.data?.line_items)
    ? (afterAddRes!.data!.line_items as Array<Record<string, unknown>>)
    : [];
  if (!afterAddLines.some(l => Number(l.variant_id) === adjustmentVariantId)) {
    return {
      ok: false,
      cardDeclined: true,
      message: 'Unable to attach rate adjustment to saved card — please use Apple Pay / Express Checkout below.',
    };
  }

  // 2. Temporarily remove original physical jar line(s) so chargeNow bills ONLY £8/£16/£24 with £0 shipping
  for (const line of originalLines) {
    if (Number(line.variant_id) === adjustmentVariantId) continue;
    await loopFetch(
      'POST',
      'https://api.loopwork.co/api/merchant/subscriptionContract/removeLine',
      {
        subscriptionContract_id: loopId,
        lineItem_id: line.id,
        type: 'subscription',
      },
    );
  }

  // 3. Trigger immediate off-session charge onto the saved payment method
  const chargeRes = await loopFetch<{ success?: boolean; message?: string }>(
    'POST',
    'https://api.loopwork.co/api/merchant/subscriptionContract/chargeNow',
    {
      subscriptionContractId: loopId,
      recalculateFutureOrders: false,
      processCompleteCharge: false,
    },
  );

  // 4. Poll ordersHistory up to 6 times (~7.5s) to confirm Shopify captured a new PAID order
  let chargeConfirmedPaid = false;
  if (chargeRes?.success) {
    for (let i = 0; i < 6; i++) {
      await new Promise(r => setTimeout(r, 1250));
      const afterHist = await loopFetch<{
        success?: boolean;
        data?: { results?: Array<Record<string, unknown>> };
      }>(
        'GET',
        `https://api.loopwork.co/api/merchant/subscriptionContract/ordersHistory?subscriptionContract_id=${loopId}&page=1&limit=10`,
      );
      const paidNow = (afterHist?.data?.results || []).filter(
        r => String(r.financial_status || '').toLowerCase() === 'paid',
      );
      if (paidNow.some(r => !beforePaidIds.has(Number(r.shopify_id || r.id)))) {
        chargeConfirmedPaid = true;
        break;
      }
    }
  }

  if (chargeConfirmedPaid) {
    await cancelLoopSubscription(
      loopId,
      'Single-order rate adjustment paid',
      `Paid £${feeGbp}.00 single-order rate adjustment via saved card; auto-cancelled immediately.`,
    );
    return {
      ok: true,
      message: `Payment of £${feeGbp}.00 confirmed and your subscription has been permanently cancelled. A confirmation email is on its way.`,
    };
  }

  // 5. Rollback cleanly if card declined / requires 3DS so subscriber cannot escape for free with a frozen card
  for (const orig of originalLines) {
    if (Number(orig.variant_id) === adjustmentVariantId) continue;
    await loopFetch(
      'POST',
      'https://api.loopwork.co/api/merchant/subscriptionContract/add_line',
      {
        subscriptionContract_id: loopId,
        productVariantId: Number(orig.variant_id),
        quantity: Number(orig.quantity || 1),
        basePrice: Number(orig.base_price || 31.99),
        pricingPolicy: null,
        sellingPlanShopifyId: Number(orig.selling_plan_id || BENNETT_SELLING_PLAN_ID),
        type: 'subscription',
        discountType: 'PERCENTAGE',
        discountValue: 25,
        recurringDiscountPolicyApplied: false,
        recurringDiscountAfterCycle: 1,
        recurringDiscountType: 'PERCENTAGE',
        recurringDiscountValue: 25,
      },
    );
  }

  // Remove the temporary adjustment line from the restored active contract
  const refreshed = await loopFetch<{ data?: Record<string, unknown> }>(
    'GET',
    `https://api.loopwork.co/api/merchant/subscriptionContract/read_by_shopify_id?shopify_id=${shopifyId}`,
  );
  const refreshedLines = Array.isArray(refreshed?.data?.line_items)
    ? (refreshed!.data!.line_items as Array<Record<string, unknown>>)
    : [];
  for (const rl of refreshedLines) {
    if (Number(rl.variant_id) === adjustmentVariantId) {
      await loopFetch(
        'POST',
        'https://api.loopwork.co/api/merchant/subscriptionContract/removeLine',
        {
          subscriptionContract_id: loopId,
          lineItem_id: rl.id,
          type: 'subscription',
        },
      );
    }
  }

  return {
    ok: false,
    cardDeclined: true,
    message:
      'Your bank declined the off-session charge or requested 3D Secure / Apple Pay verification. Please tap "Pay via Apple Pay / Express Checkout" below to complete the £' +
      feeGbp +
      '.00 adjustment and cancel automatically.',
  };
}

export async function autoCancelByWebhookOrder(
  email: string,
  attrLoopContractId?: string,
): Promise<{ cancelledLoopIds: number[] }> {
  const cancelledLoopIds: number[] = [];
  const directId = Number(attrLoopContractId || 0);
  if (directId > 0) {
    const res = await cancelLoopSubscription(
      directId,
      'Single-order rate adjustment paid via Checkout',
      'Auto-cancelled immediately upon paid Rate Adjustment checkout order.',
    );
    if (res.ok) cancelledLoopIds.push(directId);
  }

  if (cancelledLoopIds.length === 0 && email) {
    const subs = await findActiveSubscriptionsByEmail(email);
    for (const s of subs) {
      const res = await cancelLoopSubscription(
        s.loopId,
        'Single-order rate adjustment paid via Checkout',
        'Auto-cancelled immediately upon paid Rate Adjustment checkout order.',
      );
      if (res.ok) cancelledLoopIds.push(s.loopId);
    }
  }
  return { cancelledLoopIds };
}
