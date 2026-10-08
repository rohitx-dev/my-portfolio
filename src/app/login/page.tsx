import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import LoginForm from "../../components/auth/LoginForm";
import SignOutButton from "../../components/auth/SignOutButton";
import { createClient } from "../../lib/supabase/server";
import { OWNER_ID } from "../../lib/auth/owner";

export const metadata: Metadata = {
  title: "Owner login | Rohit Singh",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id === OWNER_ID) redirect("/admin/documents");

  return (
    <main className="mx-auto min-h-[80svh] max-w-lg px-5 pb-20 pt-36 sm:px-8">
      <Link href="/docs" className="inline-flex min-h-11 items-center rounded text-sm text-slate-400 hover:text-white focus-visible:outline-2 focus-visible:outline-violet-400">← Back to Docs</Link>
      <section aria-labelledby="login-heading" className="mt-6 rounded-2xl border border-white/10 bg-[#101729]/90 p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">Portfolio workspace</p>
        <h1 id="login-heading" className="mt-4 text-3xl font-bold tracking-tight text-white">Owner login</h1>
        {user ? (
          <div className="mt-6 space-y-5">
            <p className="text-sm leading-7 text-slate-300">This account does not have access. Sign out, then use the portfolio owner account.</p>
            <SignOutButton />
          </div>
        ) : (
          <>
            <p className="mt-4 text-sm leading-7 text-slate-400">Sign in to your document workspace. This area is reserved for the portfolio owner.</p>
            <LoginForm />
          </>
        )}
      </section>
    </main>
  );
}
