/**
 * Layerat Founding Member Official Recognition Email Template
 * 100% English, responsive, luxury HTML compatible with Gmail, Apple Mail, Outlook, and mobile.
 */

export interface FoundingEmailParams {
  displayName: string;
  username: string;
  profileUrl: string;
}

export function generateFoundingMemberEmailHtml({
  displayName,
  username,
  profileUrl,
}: FoundingEmailParams): string {
  const safeName = displayName || username || "Creator";
  const safeUrl = profileUrl || `https://www.layerat.com/u/${username}`;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark light" />
  <meta name="supported-color-schemes" content="dark light" />
  <title>You are now a Founding Member of Layerat</title>
  <style type="text/css">
    body, p, h1, h2, h3, div, span, a {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      background-color: #09090b;
      color: #fafafa;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    @media only screen and (max-width: 600px) {
      .card-wrap {
        padding: 24px 16px !important;
      }
      .content-box {
        padding: 24px 20px !important;
      }
      .headline {
        font-size: 22px !important;
        line-height: 28px !important;
      }
      .cta-btn {
        display: block !important;
        width: 100% !important;
        text-align: center !important;
        box-sizing: border-box !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; color: #fafafa;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #09090b; min-height: 100vh;">
    <tr>
      <td align="center" class="card-wrap" style="padding: 40px 16px;">
        <!-- Card Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 580px; background-color: #121216; border: 1px solid rgba(245, 158, 11, 0.28); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);">
          
          <!-- Top Accent Bar -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b);"></td>
          </tr>

          <!-- Content Padding -->
          <tr>
            <td class="content-box" style="padding: 40px 36px;">
              
              <!-- Brand Header -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px;">
                <tr>
                  <td>
                    <span style="font-size: 13px; font-weight: 800; letter-spacing: 0.25em; text-transform: uppercase; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      LAYERAT
                    </span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; background-color: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 9999px; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #fbbf24; font-family: monospace;">
                      ✨ OFFICIAL DISTINCTION
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Badge Pill -->
              <div style="margin-bottom: 20px;">
                <span style="display: inline-block; padding: 6px 14px; background-color: rgba(245, 158, 11, 0.16); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #fbbf24;">
                  ✨ FOUNDING MEMBER
                </span>
              </div>

              <!-- Main Title -->
              <h1 class="headline" style="font-size: 26px; font-weight: 800; line-height: 34px; color: #ffffff; letter-spacing: -0.02em; margin-bottom: 16px;">
                Welcome to the Founding Circle of Layerat.
              </h1>

              <!-- Greeting & Recognition -->
              <p style="font-size: 15px; line-height: 24px; color: #d4d4d8; margin-bottom: 16px;">
                Dear <strong>${safeName}</strong>,
              </p>
              <p style="font-size: 14px; line-height: 23px; color: #a1a1aa; margin-bottom: 24px;">
                We are deeply privileged to officially bestow upon you the <strong>Founding Member</strong> distinction.
                This honor is reserved strictly for the visionary designers, creators, and studios who placed their trust in Layerat from the very beginning. Your creative presence and early belief have laid the foundational standard for everything we are building.
              </p>

              <!-- Privileges Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #18181f; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 20px 22px;">
                    <div style="font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #fbbf24; margin-bottom: 14px; font-family: monospace;">
                      FOUNDING PRIVILEGES & RECOGNITION
                    </div>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; line-height: 20px; color: #d4d4d8;">
                      <tr>
                        <td style="padding-bottom: 10px; vertical-align: top; width: 22px; color: #f59e0b;">✦</td>
                        <td style="padding-bottom: 10px;">
                          <strong style="color: #ffffff;">Permanent Golden Badge:</strong> Displayed prominently alongside your name across your studio profile, case studies, and creator directories.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 10px; vertical-align: top; width: 22px; color: #f59e0b;">✦</td>
                        <td style="padding-bottom: 10px;">
                          <strong style="color: #ffffff;">Studio Profile Halo:</strong> An exclusive subtle amber accent illuminating your avatar to all visitors.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 10px; vertical-align: top; width: 22px; color: #f59e0b;">✦</td>
                        <td style="padding-bottom: 10px;">
                          <strong style="color: #ffffff;">Lifetime Editorial Priority:</strong> Prioritized review and curation by our editorial committee for front-page highlights.
                        </td>
                      </tr>
                      <tr>
                        <td style="vertical-align: top; width: 22px; color: #f59e0b;">✦</td>
                        <td>
                          <strong style="color: #ffffff;">Direct Founding Voice:</strong> An open communication channel with the founding team to steer future features and community evolution.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
                <tr>
                  <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="border-radius: 9999px; background: linear-gradient(135deg, #fbbf24, #f59e0b); box-shadow: 0 4px 18px rgba(245, 158, 11, 0.35);">
                          <a href="${safeUrl}" target="_blank" class="cta-btn" style="display: inline-block; padding: 14px 32px; font-size: 13px; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; color: #09090b; text-decoration: none; border-radius: 9999px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                            View Your Founding Profile →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Sign-off -->
              <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 24px;">
                <p style="font-size: 13px; line-height: 20px; color: #a1a1aa; margin-bottom: 4px;">
                  With our deepest appreciation and respect,
                </p>
                <p style="font-size: 14px; font-weight: 700; color: #ffffff;">
                  Ahmed Al-Azaiza &amp; The Layerat Editorial Board
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0e0e12; padding: 20px 36px; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center;">
              <p style="font-size: 11px; line-height: 18px; color: #71717a; margin-bottom: 6px;">
                Layerat • The Creative Showcase &amp; Monograph Engine for Visionary Designers
              </p>
              <p style="font-size: 11px; color: #52525b;">
                <a href="https://www.layerat.com" target="_blank" style="color: #a1a1aa; text-decoration: underline;">www.layerat.com</a>
                &nbsp;•&nbsp;
                <a href="https://www.layerat.com/privacy" target="_blank" style="color: #71717a; text-decoration: none;">Privacy Policy</a>
                &nbsp;•&nbsp;
                <a href="https://www.layerat.com/terms" target="_blank" style="color: #71717a; text-decoration: none;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
