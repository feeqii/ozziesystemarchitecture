import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-6">
      <SignIn
        appearance={{
          elements: {
            card: "shadow-xl border border-border",
          },
        }}
      />
    </div>
  );
}
