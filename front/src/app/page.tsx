import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Plus, Building2 } from "lucide-react"
import { getBuildings, type Building } from "./actions/buildings"
import { SearchForm } from "./search-form"

interface HomePageProps {
  searchParams: Promise<{ search?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams
  const search = params.search || ""
  const result = await getBuildings(search)

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
          <p className="text-gray-600 mb-4">Discover and rate apartment buildings based on real resident feedback</p>
          <SearchForm initialSearch={search} />
        </div>

        {!result.success ? (
          <div className="text-center py-12">
            <p className="text-red-600">{result.error}</p>
            <p className="text-gray-500 mt-2">Please make sure the backend server is running.</p>
          </div>
        ) : result.data.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {search ? `No buildings found for "${search}"` : "No buildings yet. Be the first to add one!"}
            </p>
            <Link href="/add-apartment">
              <Button className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Add Building
              </Button>
            </Link>
          </div>
        ) : (
          <BuildingGrid buildings={result.data} />
        )}
      </main>
    </div>
  )
}

function BuildingGrid({ buildings }: { buildings: Building[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {buildings.map((building) => (
        <Card key={building.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="p-0">
            <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-t-lg flex items-center justify-center">
              <Building2 className="w-16 h-16 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-2">
              <CardTitle className="text-lg">{building.name}</CardTitle>
            </div>

            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">{building.address}</span>
            </div>

            {building.priceRange && (
              <p className="text-sm text-gray-600 mb-3">{building.priceRange}</p>
            )}

            {building.description && (
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{building.description}</p>
            )}

            <Link href={`/apartment/${building.id}`}>
              <Button className="w-full">View Details</Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
