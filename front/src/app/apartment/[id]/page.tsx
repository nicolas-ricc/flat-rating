"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star, MapPin, ArrowLeft, MessageSquare } from "lucide-react"
import { useParams } from "next/navigation"

// Mock data - in real app this would come from your backend
const apartmentDetails = {
  1: {
    id: 1,
    name: "Sunset Towers",
    address: "123 Main St, Downtown",
    overallRating: 4.2,
    totalReviews: 28,
    image: "/placeholder.svg?height=300&width=500",
    priceRange: "$1,200 - $2,800",
    description: "Modern high-rise apartment building in the heart of downtown with stunning city views.",
    amenities: [
      { name: "Swimming Pool", rating: 4.5, description: "Large outdoor pool with deck area" },
      { name: "Fitness Center", rating: 4.1, description: "24/7 gym with modern equipment" },
      { name: "Parking", rating: 3.8, description: "Underground parking garage" },
      { name: "Laundry", rating: 4.3, description: "In-unit washer and dryer" },
      { name: "Security", rating: 4.6, description: "24/7 security and key card access" },
      { name: "Maintenance", rating: 3.9, description: "On-site maintenance team" },
    ],
    recentFeedback: [
      {
        id: 1,
        rating: 5,
        comment: "Great location and the pool area is amazing! Staff is very responsive.",
        date: "2024-01-15",
      },
      {
        id: 2,
        rating: 4,
        comment: "Love the gym facilities. Parking can be tight during peak hours.",
        date: "2024-01-10",
      },
      {
        id: 3,
        rating: 4,
        comment: "Beautiful views from upper floors. Maintenance is quick to respond.",
        date: "2024-01-08",
      },
    ],
  },
}

export default function ApartmentDetailPage() {
  const params = useParams()
  const apartmentId = Number.parseInt(params.id as string)
  const apartment = apartmentDetails[apartmentId as keyof typeof apartmentDetails]

  const [newFeedback, setNewFeedback] = useState("")
  const [newRating, setNewRating] = useState(5)

  if (!apartment) {
    return <div>Apartment not found</div>
  }

  const handleSubmitFeedback = () => {
    // In real app, this would submit to your backend
    console.log("Submitting feedback:", { rating: newRating, comment: newFeedback })
    setNewFeedback("")
    setNewRating(5)
    // Show success message or update UI
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Building Overview */}
            <Card>
              <CardContent className="p-6">
                <img
                  src={apartment.image || "/placeholder.svg"}
                  alt={apartment.name}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />

                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{apartment.name}</h1>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-5 h-5 mr-2" />
                      <span>{apartment.address}</span>
                    </div>
                    <p className="text-lg font-semibold text-green-600">{apartment.priceRange}</p>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                      <span className="text-2xl font-bold">{apartment.overallRating}</span>
                    </div>
                    <p className="text-sm text-gray-600">{apartment.totalReviews} reviews</p>
                  </div>
                </div>

                <p className="text-gray-700">{apartment.description}</p>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Amenities & Ratings</CardTitle>
                <p className="text-sm text-gray-600">Ratings automatically generated from resident feedback</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {apartment.amenities.map((amenity) => (
                    <div key={amenity.name} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">{amenity.name}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{amenity.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{amenity.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Feedback */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apartment.recentFeedback.map((feedback) => (
                    <div key={feedback.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < feedback.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">{feedback.date}</span>
                      </div>
                      <p className="text-gray-700">{feedback.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Add Feedback */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Leave Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="rating">Your Rating</Label>
                  <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setNewRating(star)} className="focus:outline-none">
                        <Star
                          className={`w-6 h-6 ${star <= newRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="feedback">Your Feedback</Label>
                  <Textarea
                    id="feedback"
                    placeholder="Share your experience living here..."
                    value={newFeedback}
                    onChange={(e) => setNewFeedback(e.target.value)}
                    className="mt-2"
                    rows={4}
                  />
                </div>

                <Button onClick={handleSubmitFeedback} className="w-full">
                  Submit Feedback
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Reviews</span>
                    <span className="font-semibold">{apartment.totalReviews}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Rating</span>
                    <span className="font-semibold">{apartment.overallRating}/5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amenities</span>
                    <span className="font-semibold">{apartment.amenities.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
