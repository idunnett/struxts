import { Card } from "../../../components/ui/card"
import { SignInFormPasswordAndVerifyViaCode } from "./SignInFormPasswordAndVerifyViaCode"

export default function SignInPage() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      {/* <SignIn routing="hash" fallbackRedirectUrl="/" /> */}
      <Card className="w-full max-w-md p-4">
        <SignInFormPasswordAndVerifyViaCode />
      </Card>
    </div>
  )
}
