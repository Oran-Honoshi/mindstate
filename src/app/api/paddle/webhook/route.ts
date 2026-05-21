// src/app/api/paddle/webhook/route.ts
// Handles Paddle subscription lifecycle events and updates Supabase profiles

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Paddle price ID → subscription_status mapping
const PRICE_TO_STATUS: Record<string, string> = {
  "pri_01ks5tm2jqs69wrg92jxrc936b": "individual",   // $2/mo
  "pri_01ks5tnfpxvgdh2gkfm0k5pry8": "family",       // $5/mo — Family Choice
  "pri_01ks5tpt6wsyn05gexnpade0a0": "family",        // $10/mo — Grand Family
};

// Grand Family member limit per price ID
const PRICE_TO_FAMILY_LIMIT: Record<string, number> = {
  "pri_01ks5tnfpxvgdh2gkfm0k5pry8": 3,
  "pri_01ks5tpt6wsyn05gexnpade0a0": 7,
};

// ── Signature verification ────────────────────────────────────────────────────
async function verifyPaddleSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string
): Promise<boolean> {
  if (!signatureHeader) return false;
  try {
    // Paddle sends: ts=TIMESTAMP;h1=HMAC
    const parts = Object.fromEntries(
      signatureHeader.split(";").map((p) => p.split("=") as [string, string])
    );
    const ts = parts["ts"];
    const h1 = parts["h1"];
    if (!ts || !h1) return false;

    const payload = `${ts}:${rawBody}`;
    const hmac = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(h1));
  } catch {
    return false;
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  // Supabase admin client — created here to avoid build-time env var access
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const rawBody = await req.text();
  const signatureHeader = req.headers.get("paddle-signature");
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

  // Verify signature in production
  if (webhookSecret) {
    const valid = await verifyPaddleSignature(rawBody, signatureHeader, webhookSecret);
    if (!valid) {
      console.error("Paddle webhook: invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType: string = event.event_type ?? event.alert_name ?? "";
  const data = event.data ?? event;

  console.log(`Paddle webhook: ${eventType}`);

  try {
    switch (eventType) {

      // ── Subscription created / activated ──────────────────────────────────
      case "subscription.created":
      case "subscription.activated": {
        const customData = data.custom_data ?? {};
        const userId: string | undefined = customData.user_id ?? data.customer?.id;
        const priceId: string = data.items?.[0]?.price?.id ?? data.items?.[0]?.price_id ?? "";
        const paddleSubscriptionId: string = data.id ?? data.subscription_id ?? "";
        const status = PRICE_TO_STATUS[priceId] ?? "individual";
        const familyLimit = PRICE_TO_FAMILY_LIMIT[priceId];

        if (!userId) {
          console.error("Paddle webhook: no user_id in custom_data");
          break;
        }

        await supabaseAdmin
          .from("profiles")
          .update({
            subscription_status: status,
            paddle_subscription_id: paddleSubscriptionId,
            paddle_price_id: priceId,
            subscription_updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        // Create family group if family plan
        if (status === "family" && familyLimit) {
          const code = Math.random().toString(36).substring(2, 10).toUpperCase();
          const { data: existingGroup } = await supabaseAdmin
            .from("family_groups")
            .select("id")
            .eq("admin_id", userId)
            .single();

          if (!existingGroup) {
            const { data: newGroup } = await supabaseAdmin
              .from("family_groups")
              .insert({ admin_id: userId, member_limit: familyLimit, invite_code: code })
              .select()
              .single();

            if (newGroup) {
              // Add admin as first member
              await supabaseAdmin
                .from("family_members")
                .upsert({ group_id: newGroup.id, user_id: userId });
            }
          } else {
            // Update member limit if upgrading
            await supabaseAdmin
              .from("family_groups")
              .update({ member_limit: familyLimit })
              .eq("admin_id", userId);
          }
        }

        console.log(`Activated ${status} for user ${userId}`);
        break;
      }

      // ── Subscription updated (plan change, renewal) ───────────────────────
      case "subscription.updated": {
        const paddleSubId: string = data.id ?? data.subscription_id ?? "";
        const priceId: string = data.items?.[0]?.price?.id ?? data.items?.[0]?.price_id ?? "";
        const status = PRICE_TO_STATUS[priceId] ?? "individual";
        const familyLimit = PRICE_TO_FAMILY_LIMIT[priceId];

        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("paddle_subscription_id", paddleSubId)
          .single();

        if (profile) {
          await supabaseAdmin
            .from("profiles")
            .update({
              subscription_status: status,
              paddle_price_id: priceId,
              subscription_updated_at: new Date().toISOString(),
            })
            .eq("id", profile.id);

          if (status === "family" && familyLimit) {
            await supabaseAdmin
              .from("family_groups")
              .update({ member_limit: familyLimit })
              .eq("admin_id", profile.id);
          }
        }
        break;
      }

      // ── Subscription cancelled / paused / past due ────────────────────────
      case "subscription.canceled":
      case "subscription.cancelled":
      case "subscription.paused": {
        const paddleSubId: string = data.id ?? data.subscription_id ?? "";

        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("paddle_subscription_id", paddleSubId)
          .single();

        if (profile) {
          await supabaseAdmin
            .from("profiles")
            .update({
              subscription_status: "free",
              subscription_updated_at: new Date().toISOString(),
            })
            .eq("id", profile.id);
        }
        break;
      }

      // ── Subscription resumed ──────────────────────────────────────────────
      case "subscription.resumed":
      case "subscription.uncanceled": {
        const paddleSubId: string = data.id ?? data.subscription_id ?? "";
        const priceId: string = data.items?.[0]?.price?.id ?? data.items?.[0]?.price_id ?? "";
        const status = PRICE_TO_STATUS[priceId] ?? "individual";

        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("paddle_subscription_id", paddleSubId)
          .single();

        if (profile) {
          await supabaseAdmin
            .from("profiles")
            .update({
              subscription_status: status,
              subscription_updated_at: new Date().toISOString(),
            })
            .eq("id", profile.id);
        }
        break;
      }

      // ── Payment failed ────────────────────────────────────────────────────
      case "transaction.payment_failed": {
        // Paddle handles dunning — we just log it
        console.warn("Paddle payment failed:", data.id);
        break;
      }

      default:
        console.log(`Paddle webhook: unhandled event ${eventType}`);
    }
  } catch (err) {
    console.error("Paddle webhook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}