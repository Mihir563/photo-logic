import { Suspense } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import PortfolioManager from "@/components/portfolio-manager";
import CosmicLoader from "@/app/loading";

export default function PortfolioTab() {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Portfolio</CardTitle>
        <CardDescription>Manage your photography portfolio</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense
          fallback={
            <div>
              <CosmicLoader />
              <p>Loading portfolio...</p>
            </div>
          }
        >
          <PortfolioManager />
        </Suspense>
      </CardContent>
    </Card>
  );
}
