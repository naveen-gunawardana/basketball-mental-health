import { NextResponse } from "next/server";
import { badRequest, withAppUser } from "@/lib/app-api";

/**
 * Safety scan.
 *
 * What this does: reads a piece of free text the athlete just wrote and says
 * whether the app should surface crisis resources on screen.
 *
 * What this deliberately does NOT do:
 *   · block or delay the write — the debrief is already saved before this runs
 *   · notify a mentor, a coach, a parent, or an admin
 *   · store the text, or log it anywhere, including on an error path
 *   · make any clinical judgement, which it is not remotely qualified to
 *
 * It is a tripwire that puts a phone number in front of someone, nothing more.
 * The bar for a false negative is high and the cost of a false positive is one
 * dismissable sheet, so the patterns lean toward catching things.
 *
 * Runs on the server rather than in the app so the list can be corrected
 * without waiting on an App Store review.
 */

const PATTERNS: RegExp[] = [
  /\bkill(ing)?\s+my ?self\b/i,
  /\bkms\b/i,
  /\bend(ing)?\s+(it|my life)\b/i,
  /\bdon'?t\s+want\s+to\s+(be\s+here|live|wake up)\b/i,
  /\bwant\s+to\s+die\b/i,
  /\bbetter\s+off\s+without\s+me\b/i,
  /\bno\s+(point|reason)\s+(in\s+)?(living|anything)\b/i,
  /\bhurt(ing)?\s+my ?self\b/i,
  /\bcut(ting)?\s+my ?self\b/i,
  /\bcan'?t\s+(do|take)\s+(this|it)\s+any ?more\b/i,
  /\bhate\s+my ?self\b/i,
  /\bnobody\s+would\s+(care|notice|miss)\b/i,
  /\bwish\s+i\s+(was|were)\s+dead\b/i,
];

/**
 * Sports talk is violent and it isn't a crisis. "I want to kill it out there"
 * and "that game killed me" must not trip the wire — a false alarm every time
 * a kid says something ordinary would train them to ignore the real one.
 */
const EXEMPT: RegExp[] = [
  /\bkill(ed|ing)?\s+(it|us|them|the\s+\w+)\b/i,
  /\bdead\s+(leg|arm|ball|weight)\b/i,
  /\bkilled\s+me\s+(in|on|at)\s+(the\s+)?(gym|practice|weight|drill|run|court|field)/i,
  /\bdying\s+(of\s+)?(laughter|to\s+play|for\s+it)\b/i,
];

export const POST = withAppUser(async (_user, request) => {
  let body: { text?: string; source?: string };
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid request.");
  }

  const text = body.text;
  if (typeof text !== "string") return badRequest("Missing text.");

  // Nothing is persisted and nothing is logged. The only thing that leaves this
  // function is a boolean.
  const exempt = EXEMPT.some((r) => r.test(text));
  const surfaceSupport = !exempt && PATTERNS.some((r) => r.test(text));

  return NextResponse.json({ surfaceSupport });
});
