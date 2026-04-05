import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isPaidPlan } from "@/lib/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Download a past conversion from the private Supabase Storage bucket.
 * Only Pro users can access history downloads; the profile check happens
 * server-side so a free user cannot poke around by guessing UUIDs.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();
  if (!profile || !isPaidPlan(profile.plan)) {
    return NextResponse.json(
      { error: "History downloads are a Pro feature." },
      { status: 402 },
    );
  }

  const admin = createServiceClient();
  const { data: row } = await admin
    .from("conversions")
    .select("user_id, output_filename, storage_path")
    .eq("id", id)
    .single();

  if (!row || row.user_id !== user.id || !row.storage_path) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: file, error } = await admin.storage
    .from("conversions")
    .download(row.storage_path);
  if (error || !file) {
    return NextResponse.json({ error: "Storage error" }, { status: 500 });
  }

  const arrayBuffer = await file.arrayBuffer();
  return new NextResponse(new Uint8Array(arrayBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${row.output_filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
