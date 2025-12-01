'use client'

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star } from "lucide-react"
import { createComment } from "@/app/actions/comments"

interface FeedbackFormProps {
  buildingId: string
}

export function FeedbackForm({ buildingId }: FeedbackFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!content.trim()) {
      setError("Please enter your feedback")
      return
    }

    startTransition(async () => {
      const result = await createComment(buildingId, { rating, content: content.trim() })

      if (!result.success) {
        setError(result.error)
        return
      }

      setSuccess(true)
      setContent("")
      setRating(5)

      // Refresh the page to show the new comment
      router.refresh()

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="rating">Your Rating</Label>
        <div className="flex items-center gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none hover:scale-110 transition-transform"
            >
              <Star
                className={`w-6 h-6 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
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
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mt-2"
          rows={4}
          disabled={isPending}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {success && (
        <p className="text-sm text-green-600">Feedback submitted successfully!</p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Submitting...' : 'Submit Feedback'}
      </Button>
    </form>
  )
}
