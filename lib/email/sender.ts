import { generateFoundingMemberEmailHtml } from "./founding-member-email";

export interface SendFoundingEmailPayload {
  to: string;
  displayName: string;
  username: string;
}

export interface SendFoundingEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Sends the official Founding Member recognition email via Resend
 */
export async function sendFoundingMemberEmail({
  to,
  displayName,
  username,
}: SendFoundingEmailPayload): Promise<SendFoundingEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("[EmailService] RESEND_API_KEY is not configured.");
    return {
      success: false,
      error: "RESEND_API_KEY is not configured in environment variables.",
    };
  }

  if (!to || !to.includes("@")) {
    return {
      success: false,
      error: "A valid recipient email address is required.",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.layerat.com";
  const profileUrl = `${siteUrl.replace(/\/$/, "")}/u/${username}`;
  const html = generateFoundingMemberEmailHtml({
    displayName,
    username,
    profileUrl,
  });

  const fromEmail = process.env.RESEND_FROM_EMAIL || "Layerat <welcome@layerat.com>";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: "✨ You are now a Founding Member of Layerat",
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.warn("[EmailService] Resend API error:", data);

      // If custom domain is not yet verified on Resend, attempt fallback with onboarding@resend.dev
      if (
        (data?.statusCode === 403 || data?.name === "validation_error") &&
        fromEmail !== "Layerat <onboarding@resend.dev>"
      ) {
        console.info("[EmailService] Retrying with Resend testing domain (onboarding@resend.dev)...");
        const fallbackRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Layerat <onboarding@resend.dev>",
            to: [to],
            subject: "✨ You are now a Founding Member of Layerat",
            html,
          }),
        });
        const fallbackData = await fallbackRes.json();
        if (fallbackRes.ok) {
          return { success: true, id: fallbackData.id };
        }
      }

      return {
        success: false,
        error: data?.message || "Failed to deliver email through Resend.",
      };
    }

    return { success: true, id: data.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown network error";
    console.error("[EmailService] Exception during email transmission:", message);
    return { success: false, error: message };
  }
}
