import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Plus } from "lucide-react"

// Mock data - in real app this would come from your backend
const apartments = [
  {
    id: 1,
    name: "Sunset Towers",
    address: "123 Main St, Downtown",
    overallRating: 4.2,
    totalReviews: 28,
    image: "/placeholder.svg?height=200&width=300",
    priceRange: "$1,200 - $2,800",
    topAmenities: ["Pool", "Gym", "Parking"],
  },
  {
    id: 2,
    name: "Garden View Apartments",
    address: "456 Oak Ave, Midtown",
    overallRating: 3.8,
    totalReviews: 15,
    image: "/placeholder.svg?height=200&width=300",
    priceRange: "$900 - $2,100",
    topAmenities: ["Garden", "Laundry", "Pet-Friendly"],
  },
  {
    id: 3,
    name: "Metro Heights",
    address: "789 Broadway, Financial District",
    overallRating: 4.6,
    totalReviews: 42,
    image: "/placeholder.svg?height=200&width=300",
    priceRange: "$1,800 - $4,200",
    topAmenities: ["Concierge", "Rooftop", "Gym"],
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">CityRent Reviews</h1>
            <Link href="/add-apartment">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Building
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Apartment Buildings in Your City</h2>
          <p className="text-gray-600">Discover and rate apartment buildings based on real resident feedback</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apartments.map((apartment) => (
            <Card key={apartment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <img
                  src={apartment.image || "/placeholder.svg"}
                  alt={apartment.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg">{apartment.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{apartment.overallRating}</span>
                  </div>
                </div>

                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{apartment.address}</span>
                </div>

                <p className="text-sm text-gray-600 mb-3">{apartment.priceRange}</p>
                <p className="text-xs text-gray-500 mb-4">{apartment.totalReviews} reviews</p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {apartment.topAmenities.map((amenity) => (
                    <Badge key={amenity} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>

                <Link href={`/apartment/${apartment.id}`}>
                  <Button className="w-full">View Details</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
