import { Resend } from "resend";
import { EMAIL_FROM } from "@/lib/email";

/**
 * Central Resend helpers. The newsletter is powered by Resend's
 * Audiences/Segments + Broadcasts (free tier: ~3,000 emails/mo, 100/day).
 *
 * Configuration:
 *   RESEND_API_KEY      — already used across the app for transactional email.
 *   RESEND_AUDIENCE_ID  — create an Audience in the Resend dashboard and paste
 *                         its ID here. (Newer accounts may call this a
 *                         "Segment"; RESEND_SEGMENT_ID is accepted too.)
 *
 * Everything degrades gracefully: with no key/audience, subscribers are still
 * stored in our own `newsletter_subscribers` table, and the admin composer
 * falls back to sending issues directly to that list in batches.
 */

export function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export function getAudienceId(): string | null {
  return process.env.RESEND_AUDIENCE_ID || process.env.RESEND_SEGMENT_ID || null;
}

/**
 * Add (or re-add) a contact to the Resend audience. Best-effort — returns the
 * Resend contact id when available, never throws. The DB row is the source of
 * truth; this just keeps Resend's audience in sync for broadcasts.
 */
export async function addContactToAudience(
  email: string,
  name?: string | null,
): Promise<string | null> {
  const resend = getResend();
  const audienceId = getAudienceId();
  if (!resend || !audienceId) return null;

  try {
    const firstName = name?.trim().split(/\s+/)[0];
    const { data } = await resend.contacts.create({
      audienceId,
      email,
      unsubscribed: false,
      ...(firstName ? { firstName } : {}),
    });
    return data?.id ?? null;
  } catch (err) {
    console.error("Resend addContactToAudience failed:", err);
    return null;
  }
}

/** Mark a contact unsubscribed in the Resend audience. Best-effort. */
export async function unsubscribeContact(email: string): Promise<void> {
  const resend = getResend();
  const audienceId = getAudienceId();
  if (!resend || !audienceId) return;
  try {
    await resend.contacts.update({ audienceId, email, unsubscribed: true });
  } catch (err) {
    console.error("Resend unsubscribeContact failed:", err);
  }
}

export interface BroadcastInput {
  subject: string;
  html: string;
  name?: string;
  previewText?: string;
}

/**
 * Create and immediately send a Broadcast to the configured audience.
 * Resend automatically appends an unsubscribe link + List-Unsubscribe headers
 * to broadcasts, so this stays CAN-SPAM compliant.
 *
 * Returns the broadcast id on success. Throws if Resend / audience aren't
 * configured so the caller can fall back to direct sends.
 */
export async function sendBroadcast(input: BroadcastInput): Promise<string> {
  const resend = getResend();
  const audienceId = getAudienceId();
  if (!resend) throw new Error("RESEND_API_KEY is not configured");
  if (!audienceId) throw new Error("RESEND_AUDIENCE_ID is not configured");

  const created = await resend.broadcasts.create({
    audienceId,
    from: EMAIL_FROM,
    subject: input.subject,
    html: input.html,
    ...(input.name ? { name: input.name } : {}),
    ...(input.previewText ? { previewText: input.previewText } : {}),
  });

  if (created.error || !created.data?.id) {
    throw new Error(created.error?.message ?? "Failed to create broadcast");
  }

  const sent = await resend.broadcasts.send(created.data.id);
  if (sent.error) {
    throw new Error(sent.error.message ?? "Failed to send broadcast");
  }
  return created.data.id;
}
