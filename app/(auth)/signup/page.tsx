import { AuthForm } from "@/components/auth-form";

export const metadata = {
  title: "Sign up · MSG to PDF",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <AuthForm mode="signup" next={next ?? "/dashboard"} />;
}
