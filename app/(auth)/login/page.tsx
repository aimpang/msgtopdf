import { AuthForm } from "@/components/auth-form";

export const metadata = {
  title: "Log in · MSG to PDF",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <AuthForm mode="signin" next={next ?? "/dashboard"} />;
}
