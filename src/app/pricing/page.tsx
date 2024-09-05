import { Button } from "../../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"

export default function PricingPage() {
  return (
    <div className="container mx-auto flex h-full w-full flex-col items-center lg:px-28">
      <div className="relative flex h-1/6 items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800 sm:text-4xl">
          Pricing
        </h1>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_40px_40px_rgba(77,60,139,0.2)]" />
      </div>
      <div className="flex w-full gap-2">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Free Plan</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="pl-4">
              <li className="list-item list-disc">3 members</li>
              <li className="list-item list-disc">1 structure</li>
              <li className="list-item list-disc">50 nodes</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button size="sm">Get started for free</Button>
          </CardFooter>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Pro Plan</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="pl-4">
              <li className="list-item list-disc">100 members</li>
              <li className="list-item list-disc">10 structures</li>
              <li className="list-item list-disc">500 nodes per structure</li>
              <li className="list-item list-disc">Node Files</li>
              <li className="list-item list-disc">1GB of node file storage</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button size="sm">Upgrade</Button>
          </CardFooter>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Enterprise</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="pl-4">
              <li className="list-item list-disc">Unlimited members</li>
              <li className="list-item list-disc">Unlimited structures</li>
              <li className="list-item list-disc">Unlimited nodes</li>
              <li className="list-item list-disc">
                Unlimited node file storage
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button size="sm">Contact Us for Pricing</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
