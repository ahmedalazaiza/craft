/**
 * Layerat Founding Member Official Recognition Email Template
 * 100% English, standardized to the exact Layerat email design system.
 * Bulletproof across iOS/Android Gmail, Apple Mail, Outlook (light & dark mode).
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
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>You are now a Founding Member of Layerat</title>
  <style type="text/css">
    /* Base Resets */
    body, p, h1, h2, h3, div, span, a {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      background-color: #f4f4f5;
      color: #09090b;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    img {
      border: 0;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      display: block;
    }
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    a {
      color: #7c3aed;
      text-decoration: none;
    }

    /* Mobile Responsive Optimizations */
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 24px 12px !important;
      }
      .card-container {
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 12px !important;
      }
      .content-padding {
        padding: 28px 20px !important;
      }
      .headline {
        font-size: 22px !important;
        line-height: 28px !important;
      }
      .body-text {
        font-size: 14px !important;
        line-height: 22px !important;
      }
      .button-table {
        width: 100% !important;
      }
      .btn-cell {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
        padding: 0 !important;
      }
      .btn-link {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
        text-align: center !important;
        padding: 14px 20px !important;
      }
    }

    /* Dark Mode Theme Adaptation */
    @media (prefers-color-scheme: dark) {
      body, .email-bg {
        background-color: #09090b !important;
      }
      .card-container {
        background-color: #121215 !important;
        border-color: #27272a !important;
        box-shadow: 0 16px 36px rgba(0, 0, 0, 0.7) !important;
      }
      .brand-wordmark {
        color: #ffffff !important;
      }
      .headline {
        color: #ffffff !important;
      }
      .body-text {
        color: #a1a1aa !important;
      }
      .body-bold {
        color: #ffffff !important;
      }
      .badge-cell {
        background-color: rgba(245, 158, 11, 0.15) !important;
        border: 0 !important;
      }
      .badge-icon, .badge-text {
        color: #fde68a !important;
      }
      .perks-box, .perks-cell {
        background-color: #18181b !important;
        border: 0 !important;
      }
      .perks-text {
        color: #d4d4d8 !important;
      }
      .footer-text {
        color: #71717a !important;
      }
      .footer-links a {
        color: #a1a1aa !important;
      }
      .footer-meta {
        color: #52525b !important;
      }
    }

    /* Outlook.com Dark Mode Compatibility */
    [data-ogsc] body, [data-ogsc] .email-bg {
      background-color: #09090b !important;
    }
    [data-ogsc] .card-container {
      background-color: #121215 !important;
      border-color: #27272a !important;
    }
    [data-ogsc] .brand-wordmark, [data-ogsc] .headline, [data-ogsc] .body-bold {
      color: #ffffff !important;
    }
    [data-ogsc] .body-text {
      color: #a1a1aa !important;
    }
    [data-ogsc] .badge-cell {
      background-color: rgba(245, 158, 11, 0.15) !important;
      border: 0 !important;
    }
    [data-ogsc] .badge-icon, [data-ogsc] .badge-text {
      color: #fde68a !important;
    }
    [data-ogsc] .perks-box, [data-ogsc] .perks-cell {
      background-color: #18181b !important;
      border: 0 !important;
    }
  </style>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a, span { font-family: Arial, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body class="email-bg" style="margin: 0; padding: 0; background-color: #f4f4f5; color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div class="email-bg email-wrapper" style="background-color: #f4f4f5; width: 100%; min-height: 100vh; padding: 40px 16px; box-sizing: border-box;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">

          <!-- Brand Header (Matching Layerat Standard) -->
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
            <tr>
              <td align="center">
                <a href="https://www.layerat.com" target="_blank" style="text-decoration: none; display: inline-block;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td valign="middle" style="padding-right: 10px;">
                        <img src="https://media.layerat.com/branding/logo-icon.png" alt="Layerat" width="32" height="32" style="display: block; width: 32px; height: 32px; border: 0;" />
                      </td>
                      <td valign="middle">
                        <span class="brand-wordmark" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 22px; font-weight: 700; letter-spacing: -0.03em; color: #09090b; line-height: 32px;">
                          Layerat<span style="color: #952ce5;">.</span>
                        </span>
                      </td>
                    </tr>
                  </table>
                </a>
              </td>
            </tr>
          </table>

          <!-- Main Card Container -->
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="card-container" style="max-width: 540px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);">
            
            <!-- Top Gradient Accent Bar (Purple Layerat Signature) -->
            <tr>
              <td height="3" style="background: #8510de; background-image: linear-gradient(90deg, #8510de 0%, #cf91ff 50%, #8510de 100%); line-height: 3px; font-size: 3px; mso-line-height-rule: exactly;">&nbsp;</td>
            </tr>

            <!-- Card Inner Content -->
            <tr>
              <td class="content-padding" style="padding: 40px 36px;">
                
                <!-- The Highlighted Founding Member Badge Pill (Seamless capsule, icon & text side-by-side in matching color) -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; margin-bottom: 22px;">
                  <tr>
                    <td class="badge-cell" style="background-color: #fef3c7; border: 0; border-radius: 9999px; padding: 6px 14px; vertical-align: middle;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                        <tr>
                          <td valign="middle" class="badge-icon" style="padding-right: 6px; font-size: 11px; line-height: 12px; color: #b45309;">✦</td>
                          <td valign="middle" class="badge-text" style="font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #b45309; white-space: nowrap; line-height: 12px;">
                            FOUNDING MEMBER
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Headline -->
                <h1 class="headline" style="margin: 0 0 14px 0; font-size: 26px; line-height: 34px; font-weight: 700; color: #09090b; letter-spacing: -0.02em;">
                  Welcome to the Founding Circle of Layerat.
                </h1>

                <!-- Body Text -->
                <p class="body-text" style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #52525b;">
                  Dear <strong class="body-bold" style="color: #09090b; font-weight: 600;">${safeName}</strong>,
                </p>
                <p class="body-text" style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #52525b;">
                  We are delighted to officially recognize you as a <strong class="body-bold" style="color: #09090b; font-weight: 600;">Founding Member</strong> of Layerat. This lifetime distinction is reserved exclusively for the pioneering creators and studios who placed their trust in our platform from day one.
                </p>

                <!-- Privileges List (Clean borderless card with generous padding) -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="perks-box" style="border-collapse: separate; background-color: #f4f4f5; border: 0; border-radius: 14px; margin-bottom: 28px;">
                  <tr>
                    <td class="perks-cell" style="padding: 24px 24px; border-radius: 14px; border: 0;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td valign="top" style="padding-bottom: 14px; width: 22px; font-size: 14px; line-height: 22px; color: #7c3aed;">✦</td>
                          <td style="padding-bottom: 14px; font-size: 13.5px; line-height: 22px; color: #52525b;" class="perks-text">
                            <strong class="body-bold" style="color: #09090b; font-weight: 600;">Permanent Golden Badge:</strong> Displayed on your studio profile and published monographs.
                          </td>
                        </tr>
                        <tr>
                          <td valign="top" style="padding-bottom: 14px; width: 22px; font-size: 14px; line-height: 22px; color: #7c3aed;">✦</td>
                          <td style="padding-bottom: 14px; font-size: 13.5px; line-height: 22px; color: #52525b;" class="perks-text">
                            <strong class="body-bold" style="color: #09090b; font-weight: 600;">Studio Profile Halo:</strong> An exclusive subtle accent illuminating your avatar to all visitors.
                          </td>
                        </tr>
                        <tr>
                          <td valign="top" style="width: 22px; font-size: 14px; line-height: 22px; color: #7c3aed;">✦</td>
                          <td style="font-size: 13.5px; line-height: 22px; color: #52525b;" class="perks-text">
                            <strong class="body-bold" style="color: #09090b; font-weight: 600;">Priority Curation:</strong> Preferential consideration by our curation team for discovery showcases.
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Primary CTA Button (Layerat Purple Signature Button) -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="button-table" style="margin: 0 0 28px 0;">
                  <tr>
                    <td align="center" bgcolor="#7c3aed" class="btn-cell" style="border-radius: 9999px; background-color: #7c3aed; box-shadow: 0 6px 18px rgba(124, 58, 237, 0.35);">
                      <!--[if mso]>
                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${safeUrl}" style="height:46px;v-text-anchor:middle;width:240px;" arcsize="50%" fillcolor="#7c3aed" stroke="f">
                        <w:anchorlock/>
                        <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">View Your Founding Profile</center>
                      </v:roundrect>
                      <![endif]-->
                      <!--[if !mso]><!-->
                      <a href="${safeUrl}" target="_blank" class="btn-link" style="display: inline-block; padding: 14px 34px; font-size: 15px; font-weight: 600; color: #ffffff !important; text-decoration: none; border-radius: 9999px; letter-spacing: -0.01em;">
                        <span style="color: #ffffff !important; text-decoration: none;">View Your Founding Profile &rarr;</span>
                      </a>
                      <!--<![endif]-->
                    </td>
                  </tr>
                </table>

                <!-- Signature (No personal names - purely as Layerat) -->
                <div style="border-top: 1px solid #e4e4e7; padding-top: 20px; margin-top: 10px;">
                  <p class="body-text" style="margin: 0 0 4px 0; font-size: 14px; line-height: 22px; color: #71717a;">
                    With gratitude,
                  </p>
                  <p class="body-bold" style="margin: 0; font-size: 15px; font-weight: 600; color: #09090b;">
                    The Layerat Team
                  </p>
                </div>

              </td>
            </tr>
          </table>

          <!-- Footer (Exact Standard Layerat Footer) -->
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; margin-top: 28px; text-align: center;">
            <tr>
              <td align="center" style="padding-bottom: 12px;">
                <img src="https://media.layerat.com/branding/logo-icon.png" alt="Layerat Icon" width="20" height="20" style="display: block; width: 20px; height: 20px; opacity: 0.6; margin: 0 auto;" />
              </td>
            </tr>
            <tr>
              <td align="center" class="footer-text" style="font-size: 12px; line-height: 18px; color: #71717a;">
                Layerat Platforms Inc. &middot; The Sanctuary for Independent Creators
              </td>
            </tr>
            <tr>
              <td align="center" class="footer-links" style="font-size: 12px; line-height: 20px; padding-top: 6px;">
                <a href="https://www.layerat.com" target="_blank" style="color: #71717a; text-decoration: none;">Website</a>
                &nbsp;&middot;&nbsp;
                <a href="https://www.layerat.com/privacy" target="_blank" style="color: #71717a; text-decoration: none;">Privacy</a>
                &nbsp;&middot;&nbsp;
                <a href="https://www.layerat.com/terms" target="_blank" style="color: #71717a; text-decoration: none;">Terms</a>
                &nbsp;&middot;&nbsp;
                <a href="mailto:welcome@layerat.com" style="color: #71717a; text-decoration: none;">Support</a>
              </td>
            </tr>
            <tr>
              <td align="center" class="footer-meta" style="font-size: 11px; line-height: 16px; color: #a1a1aa; padding-top: 10px;">
                Sent from <span style="font-weight: 500;">welcome@layerat.com</span>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}
