"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { matchingApi, type MatchResult } from "@/lib/api"
import { LoadingSpinner, ErrorAlert, SuccessAlert } from "@/components/ui-components"
import { Check, Star, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function FindMentor() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [selectedMentorId, setSelectedMentorId] = useState<number | null>(null)
  const [connectionSuccess, setConnectionSuccess] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    goals: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

const handleFindMatches = async (e: React.FormEvent) => {
  e.preventDefault()
  try {
    setLoading(true)
    setError(null)
    setSuccess(null)
    setMatches([])
    setSelectedMentorId(null)

    const data = {
      name: formData.name,
      email: formData.email,
      goals: formData.goals,
    }

    try {
      const response = await matchingApi.findMatches(data)

      if (response.success) {
        setMatches(response.matches || [])

        if (response.message === "No matching mentors found") {
          setError("No matching mentors found. Try adjusting your goals or check back later.")
        } else if (response.matches.length > 0) {
          setSuccess("We found some great mentors for you!")
        } else {
          setError("No matching mentors found. Try adjusting your goals or check back later.")
        }
      } else {
        throw new Error(response.error || "Unknown error occurred")
      }
    } catch (apiError: any) {
      if (apiError.response) {
        const status = apiError.response.status
        const errorData = apiError.response.data
        
        if (status === 409) {
          setError("A mentee with this email already exists. Please use a different email or log in.")
        } else if (errorData && errorData.error) {
          setError(errorData.error)
        } else {
          setError(`Error (${status}): Failed to find matches`)
        }
      } else if (apiError.message) {
        setError(apiError.message)
      } else {
        setError("Failed to find matches. Please try again later.")
      }
    }
  } catch (err: any) {
    setError("An unexpected error occurred. Please try again.")
  } finally {
    setLoading(false)
  }
}
  const handleSelectMentor = (mentorId: number) => {
    console.log(matches)
    console.log(mentorId)
    setSelectedMentorId(mentorId)
  }

  const handleDirectConnection = async () => {
    if (!selectedMentorId) return;
    setSuccess("")

    try {
      setLoading(true)
      setError(null)

      const data = [{
        mentee_id: 57,
        selected_mentor_id: selectedMentorId,
      }];

      await matchingApi.createConnection(data);
      setConnectionSuccess(true)
    } catch (err: any) {
      setError(err.message || "Failed to create connection. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (connectionSuccess) {
    return (
      <div className="max-w-md mx-auto mt-12 text-center space-y-4">
        <div className="flex justify-center">
          <Check className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold">Connection Successful!</h1>
        <p className="text-muted-foreground">
          You've been connected with your mentor. They will reach out to you soon to begin your mentorship journey.
        </p>
        <Button onClick={() => router.push("/programs")} className="mt-4">
          Browse Mentorship Programs
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Find Your Mentor</h1>
        <p className="text-muted-foreground mt-2">
          Tell us about yourself and your goals, and we'll match you with the perfect mentor
        </p>
      </div>

      {error && <ErrorAlert message={error} />}
      {success && <SuccessAlert message={success} />}

      {!matches.length && (
        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
            <CardDescription>We'll use this information to find the best mentor matches for you</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFindMatches} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="goals">Your Goals *</Label>
                <Textarea
                  id="goals"
                  name="goals"
                  value={formData.goals}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Describe what you're looking to achieve with a mentor..."
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <LoadingSpinner /> : "Find Mentors"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {matches.length > 0 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Your Mentor Matches</h2>
            <p className="text-muted-foreground">
              Based on your goals, we've found these mentors who might be a great fit
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
              <Card key={match.id} className={`${selectedMentorId === match.id ? "border-primary" : ""}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{match.name}</CardTitle>
                    {match.match_score && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        {Math.round(match.match_score * 100)}% Match
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{match.email}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {match.expertise && (
                    <p className="text-sm">
                      <span className="font-medium">Expertise:</span> {match.expertise}
                    </p>
                  )}
                  {match.experience_years && (
                    <p className="text-sm">
                      <span className="font-medium">Experience:</span> {match.experience_years} years
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={selectedMentorId === match.id ? "default" : "outline"}
                    onClick={() => handleSelectMentor(match.id)}
                  >
                    {selectedMentorId === match.id ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Selected
                      </>
                    ) : (
                      "Select This Mentor"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {selectedMentorId && (
            <div className="flex justify-center">
              <Button 
                size="lg" 
                className="mt-4 px-8" 
                onClick={handleDirectConnection}
                disabled={loading}
              >
                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    Continue with Selected Mentor
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
