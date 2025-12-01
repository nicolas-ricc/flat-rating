'use server'

const API_URL = process.env.BACK_API_URL || 'http://localhost:3001'

export interface Building {
  id: string
  name: string
  address: string
  priceRange: string | null
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface BuildingWithSummary extends Building {
  summary: {
    content: string
    averageRating: number
    commentCount: number
    lastUpdated: string
  } | null
}

export interface CreateBuildingInput {
  name: string
  address: string
  priceRange?: string
  description?: string
}

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function getBuildings(search?: string): Promise<ActionResult<Building[]>> {
  try {
    const url = new URL(`${API_URL}/api/buildings`)
    if (search) {
      url.searchParams.set('search', search)
    }

    const response = await fetch(url.toString(), {
      cache: 'no-store',
    })

    if (!response.ok) {
      return { success: false, error: `Failed to fetch buildings: ${response.status}` }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching buildings:', error)
    return { success: false, error: 'Failed to connect to server' }
  }
}

export async function getBuilding(id: string): Promise<ActionResult<BuildingWithSummary>> {
  try {
    const response = await fetch(`${API_URL}/api/buildings/${id}`, {
      cache: 'no-store',
    })

    if (response.status === 404) {
      return { success: false, error: 'Building not found' }
    }

    if (!response.ok) {
      return { success: false, error: `Failed to fetch building: ${response.status}` }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching building:', error)
    return { success: false, error: 'Failed to connect to server' }
  }
}

export async function createBuilding(input: CreateBuildingInput): Promise<ActionResult<Building>> {
  try {
    const response = await fetch(`${API_URL}/api/buildings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })

    if (response.status === 400) {
      const error = await response.json()
      return { success: false, error: error.error || 'Invalid input' }
    }

    if (!response.ok) {
      return { success: false, error: `Failed to create building: ${response.status}` }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error creating building:', error)
    return { success: false, error: 'Failed to connect to server' }
  }
}
