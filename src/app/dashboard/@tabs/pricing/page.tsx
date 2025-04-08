import { Suspense } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import PricingForm from "@/components/pricing-form";
import CosmicLoader from "@/app/loading";

export default function PricingTab() {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Pricing</CardTitle>
        <CardDescription>
          Set up your pricing packages and rates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense
          fallback={
            <div>
              <CosmicLoader />
              <p>Loading pricing...</p>
            </div>
          }
        >
          <PricingForm />
        </Suspense>
      </CardContent>
    </Card>
  );
}
