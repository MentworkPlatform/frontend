// API base URL
const API_BASE_URL = "http://localhost:3050"

// Helper function for API requests
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const defaultHeaders = {
    "Content-Type": "application/json",
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)

    // Parse the response JSON first
    const data = await response.json()

    // Check if the request was successful
    if (!response.ok) {
      // Use the error message from the API response if available
      if (data && data.error) {
        throw new Error(data.error)
      } else {
        throw new Error(data.message || `API error: ${response.status} ${response.statusText}`)
      }
    }

    return data
  } catch (error) {
    // Check if it's a network error (like server not running)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      console.error("Network error - API server may not be running:", error)
      throw new Error("Cannot connect to API server. Please ensure the API is running at " + API_BASE_URL)
    }

    console.error("API request error:", error)
    throw error
  }
}

// Types
export interface Mentor {
  id: number
  name: string
  email: string
  bio?: string
  expertise?: string
  experience_years?: number
  profile_picture_url?: string
  created_at: string
  updated_at: string
}

export interface Mentee {
  id: number
  name: string
  email: string
  goals?: string
  created_at: string
  updated_at: string
}

export interface Program {
  id: number
  mentor_email: string
  title: string
  description?: string
  session_type?: string
  price?: number
  duration?: number
  session_date: string
  created_at: string
  updated_at: string
  mentor_name?: string
}

export interface Connection {
  id: number
  mentor_id: number
  mentee_id: number
  created_at: string
  updated_at: string
  // Joined fields
  mentor_name?: string
  mentor_email?: string
  mentee_name?: string
  mentee_email?: string
  mentee_goals?: string
  expertise?: string
}

export interface MatchResult {
  id: number
  name: string
  email: string
  expertise?: string
  experience_years?: number
  match_score?: number
}

// API functions for Mentors
export const mentorsApi = {
  getAll: () => apiRequest<{ success: boolean; mentors: Mentor[] }>("/mentors"),
  getById: (id: number) => apiRequest<{ success: boolean; mentor: Mentor }>(`/mentors/id/${id}`),
  getByEmail: (email: string) => apiRequest<{ success: boolean; mentor: Mentor }>(`/mentors/email/${email}`),
  register: (data: {
    name: string
    email: string
    bio?: string
    expertise?: string
    experience_years?: number
    profile_picture_url?: string
  }) =>
    apiRequest<{ success: boolean; mentor: Mentor }>("/mentors/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (
    id: number,
    data: { name?: string; bio?: string; expertise?: string; experience_years?: number; profile_picture_url?: string },
  ) =>
    apiRequest<{ success: boolean; mentor: Mentor }>(`/mentors/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
}

// API functions for Mentees
export const menteesApi = {
  getAll: () => apiRequest<{ success: boolean; mentees: Mentee[] }>("/mentees"),
  getByEmail: (email: string) => apiRequest<{ success: boolean; mentee: Mentee }>(`/mentees/email/${email}`),
  register: (data: { name: string; email: string; goals?: string }) =>
    apiRequest<{ success: boolean; mentee: Mentee }>("/mentees/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: { name?: string; goals?: string }) =>
    apiRequest<{ success: boolean; mentee: Mentee }>(`/mentees/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
}

// API functions for Programs
export const programsApi = {
  getAll: () => apiRequest<{ success: boolean; programs: Program[] }>("/programs"),
  getByMentorEmail: (email: string) =>
    apiRequest<{ success: boolean; programs: Program[] }>(`/programs/mentor/${email}`),
  create: (data: {
    mentor_email: string
    title: string
    description?: string
    session_type?: string
    price?: number
    duration?: number
    session_date: string
  }) =>
    apiRequest<{ success: boolean; program: Program }>("/programs", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (
    id: number,
    data: {
      title?: string
      description?: string
      session_type?: string
      price?: number
      duration?: number
      session_date?: string
    },
  ) =>
    apiRequest<{ success: boolean; program: Program }>(`/programs/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiRequest<{ success: boolean; message: string; program: Program }>(`/programs/${id}`, {
      method: "DELETE",
    }),
}

// API functions for Connections
export const connectionsApi = {
  getByMentor: (mentorId: number) =>
    apiRequest<{ success: boolean; connections: Connection[] }>(`/connections/mentor/${mentorId}`),
  getByMentee: (menteeId: number) =>
    apiRequest<{ success: boolean; connections: Connection[] }>(`/connections/mentee/${menteeId}`),
  create: (data: { mentor_id: number; mentee_id: number }) =>
    apiRequest<{ success: boolean; connection: Connection }>("/connections", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiRequest<{ success: boolean; message: string; connection: Connection }>(`/connections/${id}`, {
      method: "DELETE",
    }),
}

// API functions for Matching
export const matchingApi = {
  findMatches: (data: { name: string; email: string; goals: string }) =>
    apiRequest<{
      error: string;
      message: string;
      success: boolean;
      matches: MatchResult[];
    }>("/matching/find-matches", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  createMenteeWithConnection: (data: {
    mentee_name: string
    mentee_email: string
    mentee_goals?: string
    selected_mentor_id: number
  }) =>
    apiRequest<{ success: boolean; mentee: Mentee; connection: Connection }>(
      "/matching/create-mentee-with-connection",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    ),
  createConnection: (data: { mentee_id: number; selected_mentor_id: number }[]) =>
    apiRequest<{ success: boolean; connection: Connection }>(
      "/matching/create-connection",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    ),
}
