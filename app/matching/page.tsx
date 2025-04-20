"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { matchingApi, type MatchResult } from "@/lib/api"
import { LoadingSpinner, ErrorAlert, SuccessAlert } from "@/components/ui-components"
import { Search, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function MatchingPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [selectedMentorId, setSelectedMentorId] = useState<number | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

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
      setShowCreateForm(false)

      const data = {
        name: formData.name,
        email: formData.email,
        goals: formData.goals,
      }

      const response = await matchingApi.findMatches(data)
      setMatches(response.matches)

      if (response.matches.length === 0) {
        setError("No matching mentors found. Try adjusting your goals or check back later.")
      } else {
        setSuccess("Found potential mentor matches!")
      }
    } catch (err: any) {
      console.error("Failed to find matches:", err)
      setError(err.message || "Failed to find matches. Please ensure the API server is running.")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectMentor = (mentorId: number) => {
    setSelectedMentorId(mentorId)
    setShowCreateForm(true)
  }

  const handleCreateMenteeWithConnection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMentorId) return

    try {
      setLoading(true)
      setError(null)

      const data = {
        mentee_name: formData.name,
        mentee_email: formData.email,
        mentee_goals: formData.goals || undefined,
        selected_mentor_id: selectedMentorId,
      }

      await matchingApi.createMenteeWithConnection(data)
      setSuccess("Mentee created and connected with mentor successfully!")
      setFormData({
        name: "",
        email: "",
        goals: "",
      })
      setMatches([])
      setSelectedMentorId(null)
      setShowCreateForm(false)
    } catch (err: any) {
      setError(err.message || "Failed to create mentee and connection. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && <ErrorAlert message={error} />}
      {success && <SuccessAlert message={success} />}

      <div>
        <h1 className="text-3xl font-bold mb-2">Find Mentor Matches</h1>
        <p className="text-muted-foreground">Enter your information to find the best mentor matches</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFindMatches} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
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
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Finding Matches..." : "Find Matches"}
                <Search className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {loading && <LoadingSpinner />}

      {matches.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Potential Mentor Matches</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
              <Card key={match.mentor_id} className={`${selectedMentorId === match.mentor_id ? "border-primary" : ""}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex justify-between items-center">
                    <span>{match.name}</span>
                    {match.match_score && (
                      <Badge variant="outline">Match: {Math.round(match.match_score * 100)}%</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">{match.email}</p>
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
                <CardFooter className="flex justify-end">
                  <Button
                    variant={selectedMentorId === match.mentor_id ? "default" : "outline"}
                    onClick={() => handleSelectMentor(match.mentor_id)}
                  >
                    {selectedMentorId === match.mentor_id ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Selected
                      </>
                    ) : (
                      "Select"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {showCreateForm && selectedMentorId && (
        <Card>
          <CardHeader>
            <CardTitle>Create Mentee and Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateMenteeWithConnection} className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                You've selected a mentor! Click the button below to create your mentee profile and establish a
                connection.
              </p>
              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Mentee & Connect"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
