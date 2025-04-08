import AuthForm from "@/components/auth-form";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";

// Make the component async!
export default async function AuthPage() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // User is already logged in, yeet them to the dashboard
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to PhotoLogic</h1>
        <p className="text-muted-foreground">
          Sign in to your account or create a new one to get started.
        </p>
      </div>
      <AuthForm />
    </div>
  );
}
