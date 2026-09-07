import { NextRequest, NextResponse } from "next/server";
import { sendFoundingMemberEmail } from "@/lib/email/sender";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { email } = body;
    const { userId, displayName, username } = body;

    // If email was not sent in payload, attempt to look up from Supabase profiles
    if (!email && userId) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && serviceKey) {
        const supabase = createClient(supabaseUrl, serviceKey);
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, display_name, username")
          .eq("id", userId)
          .maybeSingle();

        if (profile?.email) {
          email = profile.email;
        }
      }
    }

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "No email address found for this user account.",
        },
        { status: 400 }
      );
    }

    const result = await sendFoundingMemberEmail({
      to: email,
      displayName: displayName || username || "Creator",
      username: username || "creator",
    });

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
