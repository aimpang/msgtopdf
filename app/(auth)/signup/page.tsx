import { AuthForm } from "@/components/auth-form";

export const metadata = {
  title: "Sign up · MSG to PDF",
  description:
    "Create a free MSG to PDF account. Get 8 conversions a month, conversion history, and upgrade options.",
  alternates: { canonical: "/signup" },
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <AuthForm mode="signup" next={next ?? "/dashboard"} />;
}
