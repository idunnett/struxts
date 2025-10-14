import { SignInWithGoogle } from "./SignInWithGoogle"

export function SignInWithOAuth() {
  return (
    <div className="flex w-full flex-col items-stretch gap-2 min-[460px]:flex-row">
      {/* <SignInWithGitHub /> */}
      <SignInWithGoogle />
      {/* <SignInWithApple /> */}
    </div>
  )
}
