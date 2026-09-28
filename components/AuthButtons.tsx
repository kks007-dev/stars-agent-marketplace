import { Show, SignInButton, UserButton } from "@clerk/nextjs";

/** Only rendered when Clerk is configured (see Header). */
export default function AuthButtons() {
  return (
    <>
      <Show when="signed-out">
        <SignInButton mode="redirect">
          <button className="btn-ghost !py-1.5 text-sm">Sign in</button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </>
  );
}
