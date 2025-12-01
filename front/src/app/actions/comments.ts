'use server'

const API_URL = process.env.BACK_API_URL || 'http://localhost:3001'

export interface Comment {
  id: string
  buildingId: string
  rating: number
  content: string
  createdAt: string
}

export interface CreateCommentInput {
  rating: number
  content: string
}

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function getComments(
  buildingId: string,
  options?: { limit?: number; offset?: number }
): Promise<ActionResult<Comment[]>> {
  try {
    const url = new URL(`${API_URL}/api/buildings/${buildingId}/comments`)
    if (options?.limit) {
      url.searchParams.set('limit', options.limit.toString())
    }
    if (options?.offset) {
      url.searchParams.set('offset', options.offset.toString())
    }

    const response = await fetch(url.toString(), {
      cache: 'no-store',
    })

    if (response.status === 404) {
      return { success: false, error: 'Building not found' }
    }

    if (!response.ok) {
      return { success: false, error: `Failed to fetch comments: ${response.status}` }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching comments:', error)
    return { success: false, error: 'Failed to connect to server' }
  }
}

export async function createComment(
  buildingId: string,
  input: CreateCommentInput
): Promise<ActionResult<Comment>> {
  try {
    const response = await fetch(`${API_URL}/api/buildings/${buildingId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })

    if (response.status === 404) {
      return { success: false, error: 'Building not found' }
    }

    if (response.status === 400) {
      const error = await response.json()
      return { success: false, error: error.error || 'Invalid input' }
    }

    if (!response.ok) {
      return { success: false, error: `Failed to create comment: ${response.status}` }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error creating comment:', error)
    return { success: false, error: 'Failed to connect to server' }
  }
}
