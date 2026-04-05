import { createClient } from "@/lib/supabase/server";
import { getLimits, type Plan } from "@/lib/plans";
import { UserMenuClient } from "./user-menu-client";

export async function UserMenu() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex items-center gap-1">
        <Link
          href="/login"
          className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="inline-flex h-9 items-center rounded-lg bg-[var(--color-primary)] px-3 text-sm font-medium text-[var(--color-primary-foreground)] hover:opacity-90"
        >
          Sign up
        </Link>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();
  const plan = (profile?.plan as Plan | undefined) ?? "free";
  const planLabel = getLimits(plan).name;

  return (
    <UserMenuClient
      userEmail={user.email || ""}
      planLabel={planLabel}
    />
  );
}

