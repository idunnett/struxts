"use client"

import { useRouter } from "next/navigation"
import { SignInMethodDivider } from "./SignInMethodDivider"
import { SignInWithOAuth } from "./SignInWithOAuth"
import { SignInWithPassword } from "./SignInWithPassword"

/**
 * Users choose between OAuth providers or email and password combo
 * with required email verification and optional password reset via OTP.
 */
export function SignInFormPasswordAndVerifyViaCode() {
  const router = useRouter()
  // const { signIn } = useAuthActions()
  // const [step, setStep] = useState<"signIn" | { email: string } | "forgot">(
  //   "signIn",
  // )
  // const [submitting, setSubmitting] = useState(false)
  return (
    <div className="mx-auto flex max-w-[384px] flex-col gap-4">
      {/* {step === "signIn" ? ( */}
      <>
        <h2 className="text-2xl font-semibold tracking-tight">
          Sign in or create an account
        </h2>
        <SignInWithOAuth />
        <SignInMethodDivider />
        <SignInWithPassword
          handleSent={() => router.replace("/structures")}
          // handleSent={(email) => setStep({ email })}
          // handlePasswordReset={() => setStep("forgot")}
          // provider="password-code"
        />
      </>
      {/* ) : step === "forgot" ? (
        <ResetPasswordWithEmailCode
          provider="password-code"
          handleCancel={() => setStep("signIn")}
        />
      ) : (
        <>
          <h2 className="text-2xl font-semibold tracking-tight">
            Check your email
          </h2>
          <p className="text-sm text-muted-foreground">
            Enter the 8-digit code we sent to your email address.
          </p>
          <form
            className="flex flex-col"
            onSubmit={(event) => {
              event.preventDefault()
              setSubmitting(true)
              const formData = new FormData(event.currentTarget)
              signIn("password-code", formData).catch((error) => {
                console.error(error)
                toast.error("Code could not be verified, try again")
                setSubmitting(false)
              })
            }}
          >
            <label htmlFor="email">Code</label>
            <CodeInput />
            <input name="email" value={step.email} type="hidden" />
            <input name="flow" value="email-verification" type="hidden" />
            <Button type="submit" disabled={submitting}>
              Continue
            </Button>
            <Button
              type="button"
              variant="link"
              onClick={() => setStep("signIn")}
            >
              Cancel
            </Button>
          </form>
        </>
      )} */}
    </div>
  )
}
