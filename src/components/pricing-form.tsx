"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DollarSign, Plus, Trash } from "lucide-react"
import { useState } from "react"

export default function PricingForm() {
  const [packages, setPackages] = useState([
    {
      id: "1",
      name: "Basic Session",
      price: 150,
      duration: 1,
      description: "1 hour photo session, 10 edited digital photos, Online gallery, Personal use license",
      included: ["1 hour photo session", "10 edited digital photos", "Online gallery", "Personal use license"],
    },
    {
      id: "2",
      name: "Standard Session",
      price: 300,
      duration: 2,
      description:
        "2 hour photo session, 25 edited digital photos, Online gallery, Personal use license, 1 outfit change",
      included: [
        "2 hour photo session",
        "25 edited digital photos",
        "Online gallery",
        "Personal use license",
        "1 outfit change",
      ],
    },
    {
      id: "3",
      name: "Premium Session",
      price: 600,
      duration: 4,
      description:
        "4 hour photo session, 50 edited digital photos, Online gallery, Commercial use license, Multiple locations, 3 outfit changes",
      included: [
        "4 hour photo session",
        "50 edited digital photos",
        "Online gallery",
        "Commercial use license",
        "Multiple locations",
        "3 outfit changes",
      ],
    },
  ])

  const addPackage = () => {
    const newPackage = {
      id: Date.now().toString(),
      name: "New Package",
      price: 0,
      duration: 1,
      description: "",
      included: [""],
    }
    setPackages([...packages, newPackage])
  }

  const removePackage = (id: string) => {
    setPackages(packages.filter((pkg) => pkg.id !== id))
  }

  return (
    <div>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Hourly Rate</CardTitle>
          <CardDescription>Set your base hourly rate for photography services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 max-w-md">
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input className="pl-10" defaultValue="150" />
            </div>
            <span className="text-muted-foreground">per hour</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Packages</CardTitle>
            <CardDescription>Create custom packages for your photography services</CardDescription>
          </div>
          <Button onClick={addPackage}>
            <Plus className="mr-2 h-4 w-4" />
            Add Package
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {packages.map((pkg, index) => (
              <div key={pkg.id} className="border rounded-lg p-6 relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 text-muted-foreground hover:text-destructive"
                  onClick={() => removePackage(pkg.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>

                <h3 className="text-lg font-medium mb-4">Package {index + 1}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor={`name-${pkg.id}`} className="text-sm font-medium">
                        Package Name
                      </label>
                      <Input id={`name-${pkg.id}`} defaultValue={pkg.name} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor={`price-${pkg.id}`} className="text-sm font-medium">
                          Price ($)
                        </label>
                        <Input id={`price-${pkg.id}`} defaultValue={pkg.price.toString()} />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor={`duration-${pkg.id}`} className="text-sm font-medium">
                          Duration (hours)
                        </label>
                        <Input id={`duration-${pkg.id}`} defaultValue={pkg.duration.toString()} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor={`description-${pkg.id}`} className="text-sm font-medium">
                        Description
                      </label>
                      <Textarea id={`description-${pkg.id}`} defaultValue={pkg.description} rows={3} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">What's Included</label>
                      <div className="mt-2 space-y-2">
                        {pkg.included.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex gap-2">
                            <Input defaultValue={item} placeholder="e.g., 1 hour photo session" />
                            {itemIndex === pkg.included.length - 1 ? (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  const newPackages = [...packages]
                                  newPackages[index].included.push("")
                                  setPackages(newPackages)
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  const newPackages = [...packages]
                                  newPackages[index].included.splice(itemIndex, 1)
                                  setPackages(newPackages)
                                }}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Button>Save Pricing</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

