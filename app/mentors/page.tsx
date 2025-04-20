"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { mentorsApi, type Mentor } from "@/lib/api"
import { LoadingSpinner, ErrorAlert, SuccessAlert } from "@/components/ui-components"
import { UserPlus, User, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function MentorsPage() {
  const searchParams = useSearchParams()
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [registerOpen, setRegisterOpen] = useState(searchParams.get("action") === "register")
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    expertise: "",
    experience_years: "",
    profile_picture_url: "",
  })

  useEffect(() => {
    fetchMentors()
  }, [])

  async function fetchMentors() {
    try {
      setLoading(true)
      setError(null)
      const response = await mentorsApi.getAll()
      setMentors(response.mentors)
    } catch (err: any) {
      console.error("Failed to fetch mentors:", err)
      setError(err.message || "Failed to load mentors. Please ensure the API server is running.")
      // Set empty array to avoid undefined errors
      setMentors([])
    } finally {
      setLoading(false)
    }
  }

  // Add a retry function
  const retryFetch = () => {
    setError(null)
    fetchMentors()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const data = {
        name: formData.name,
        email: formData.email,
        bio: formData.bio || undefined,
        expertise: formData.expertise || undefined,
        experience_years: formData.experience_years ? Number.parseInt(formData.experience_years) : undefined,
        profile_picture_url: formData.profile_picture_url || undefined,
      }

      await mentorsApi.register(data)
      setSuccess("Mentor registered successfully!")
      setFormData({
        name: "",
        email: "",
        bio: "",
        expertise: "",
        experience_years: "",
        profile_picture_url: "",
      })
      setRegisterOpen(false)
      fetchMentors()
    } catch (err: any) {
      setError(err.message || "Failed to register mentor. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleMentorClick = (mentor: Mentor) => {
    setSelectedMentor(mentor)
    setDetailsOpen(true)
  }

  if (loading && mentors.length === 0) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      {error && <ErrorAlert message={error} retry={retryFetch} />}
      {success && <SuccessAlert message={success} />}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mentors</h1>
          <p className="text-muted-foreground">View and manage all mentors in the platform</p>
        </div>
        <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Register Mentor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Register New Mentor</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRegisterSubmit} className="space-y-4 mt-4">
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
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} rows={3} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expertise">Expertise</Label>
                <Input id="expertise" name="expertise" value={formData.expertise} onChange={handleInputChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="experience_years">Years of Experience</Label>
                <Input
                  id="experience_years"
                  name="experience_years"
                  type="number"
                  value={formData.experience_years}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="profile_picture_url">Profile Picture URL</Label>
                <Input
                  id="profile_picture_url"
                  name="profile_picture_url"
                  value={formData.profile_picture_url}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setRegisterOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Registering..." : "Register Mentor"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mentors.map((mentor) => (
          <Card
            key={mentor.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleMentorClick(mentor)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{mentor.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{mentor.email}</p>
              {mentor.expertise && (
                <p className="text-sm">
                  <span className="font-medium">Expertise:</span> {mentor.expertise}
                </p>
              )}
              {mentor.experience_years && (
                <p className="text-sm">
                  <span className="font-medium">Experience:</span> {mentor.experience_years} years
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {mentors.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No mentors found. Register a new mentor to get started.</p>
        </div>
      )}

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Mentor Details</span>
              <Button variant="ghost" size="icon" onClick={() => setDetailsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedMentor && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  {selectedMentor.profile_picture_url ? (
                    <img
                      src={selectedMentor.profile_picture_url || "/placeholder.svg"}
                      alt={selectedMentor.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedMentor.name}</h3>
                  <p className="text-muted-foreground">{selectedMentor.email}</p>
                </div>
              </div>

              <div className="grid gap-2">
                <h4 className="font-medium">Bio</h4>
                <p className="text-sm">{selectedMentor.bio || "No bio provided"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Expertise</h4>
                  <p className="text-sm">{selectedMentor.expertise || "Not specified"}</p>
                </div>
                <div>
                  <h4 className="font-medium">Experience</h4>
                  <p className="text-sm">
                    {selectedMentor.experience_years ? `${selectedMentor.experience_years} years` : "Not specified"}
                  </p>
                </div>
              </div>

              <div className="grid gap-2">
                <h4 className="font-medium">Joined</h4>
                <p className="text-sm">{new Date(selectedMentor.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
