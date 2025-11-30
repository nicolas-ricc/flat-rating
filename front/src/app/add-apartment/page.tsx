"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Star, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AddApartmentPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    priceRange: "",
    description: "",
    feedback: "",
  })
  const [rating, setRating] = useState(5)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // In real app, this would submit to your backend
    console.log("Submitting new apartment:", {
      ...formData,
      rating,
      submittedAt: new Date().toISOString(),
    })

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitting(false)

    // Redirect to home page or show success message
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Buildings
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Apartment Building</h1>
          <p className="text-gray-600">Help others by adding a new building and sharing your experience</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Building Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Building Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Building Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Sunset Towers"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="priceRange">Price Range</Label>
                  <Input
                    id="priceRange"
                    name="priceRange"
                    value={formData.priceRange}
                    onChange={handleInputChange}
                    placeholder="e.g., $1,200 - $2,800"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Full Address *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main St, Downtown, City, State, ZIP"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Building Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the building, its features, and what makes it unique..."
                  rows={3}
                />
              </div>

              {/* Rating Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Your Experience</h3>

                <div className="mb-4">
                  <Label>Overall Rating *</Label>
                  <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-8 h-8 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="feedback">Your Feedback *</Label>
                  <Textarea
                    id="feedback"
                    name="feedback"
                    value={formData.feedback}
                    onChange={handleInputChange}
                    placeholder="Share your experience living here. Mention amenities, management, maintenance, neighborhood, etc. This will help our AI analyze and rate specific aspects of the building."
                    rows={5}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your feedback will be analyzed by AI to automatically generate ratings for amenities and features.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6">
                <Button type="button" variant="outline" onClick={() => router.push("/")} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? "Adding Building..." : "Add Building"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm mb-2">How it works:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Your feedback is analyzed by AI to identify and rate specific amenities</li>
              <li>• Amenity ratings are automatically updated as more reviews are added</li>
              <li>• Help future residents make informed decisions</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
