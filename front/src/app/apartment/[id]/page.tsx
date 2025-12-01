import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, MapPin, ArrowLeft, Building2, MessageSquare } from "lucide-react"
import { getBuilding } from "@/app/actions/buildings"
import { getComments, type Comment } from "@/app/actions/comments"
import { FeedbackForm } from "./feedback-form"

interface ApartmentDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ApartmentDetailPage({ params }: ApartmentDetailPageProps) {
  const { id } = await params

  const [buildingResult, commentsResult] = await Promise.all([
    getBuilding(id),
    getComments(id, { limit: 20 }),
  ])

  if (!buildingResult.success) {
    if (buildingResult.error === 'Building not found') {
      notFound()
    }
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{buildingResult.error}</p>
          <Link href="/" className="text-blue-600 hover:underline mt-2 inline-block">
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  const building = buildingResult.data
  const comments = commentsResult.success ? commentsResult.data : []

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
                <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-6 flex items-center justify-center">
                  <Building2 className="w-24 h-24 text-blue-400" />
                </div>

                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{building.name}</h1>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-5 h-5 mr-2" />
                      <span>{building.address}</span>
                    </div>
                    {building.priceRange && (
                      <p className="text-lg font-semibold text-green-600">{building.priceRange}</p>
                    )}
                  </div>

                  {building.summary && (
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                        <span className="text-2xl font-bold">{building.summary.averageRating.toFixed(1)}</span>
                      </div>
                      <p className="text-sm text-gray-600">{building.summary.commentCount} reviews</p>
                    </div>
                  )}
                </div>

                {building.description && (
                  <p className="text-gray-700">{building.description}</p>
                )}
              </CardContent>
            </Card>

            {/* AI Summary */}
            {building.summary && building.summary.content && (
              <Card>
                <CardHeader>
                  <CardTitle>AI Summary</CardTitle>
                  <p className="text-sm text-gray-600">Automatically generated from resident feedback</p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 italic">&ldquo;{building.summary.content}&rdquo;</p>
                </CardContent>
              </Card>
            )}

            {/* Recent Feedback */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No feedback yet. Be the first to leave a review!</p>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <CommentItem key={comment.id} comment={comment} />
                    ))}
                  </div>
                )}
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
              <CardContent>
                <FeedbackForm buildingId={id} />
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
                    <span className="font-semibold">{building.summary?.commentCount ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Rating</span>
                    <span className="font-semibold">
                      {building.summary ? `${building.summary.averageRating.toFixed(1)}/5` : 'N/A'}
                    </span>
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

function CommentItem({ comment }: { comment: Comment }) {
  const date = new Date(comment.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="border-b pb-4 last:border-b-0 last:pb-0">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${star <= comment.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-500">{date}</span>
      </div>
      <p className="text-gray-700">{comment.content}</p>
    </div>
  )
}
