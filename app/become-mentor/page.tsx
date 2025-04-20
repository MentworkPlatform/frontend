"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { mentorsApi } from "@/lib/api"
import { LoadingSpinner, ErrorAlert } from "@/components/ui-components"
import { CheckCircle } from "lucide-react"

export default function BecomeMentor() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    expertise: "",
    experience_years: "",
    profile_picture_url: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
  
      const data = {
        name: formData.name,
        email: formData.email,
        bio: formData.bio || undefined,
        expertise: formData.expertise || undefined,
        experience_years: formData.experience_years ? Number.parseInt(formData.experience_years) : undefined,
        profile_picture_url: formData.profile_picture_url || undefined,
      }
  
      await mentorsApi.register(data)
      setSuccess(true)
  
      // Clear form
      setFormData({
        name: "",
        email: "",
        bio: "",
        expertise: "",
        experience_years: "",
        profile_picture_url: "",
      })
  
      // Redirect to create program after 2 seconds
      setTimeout(() => {
        router.push("/programs/create")
      }, 2000)
    } catch (err: any) {
      console.error("Failed to register mentor:", err)
      setError(err.message || "Failed to register. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-12 text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold">Registration Successful!</h1>
        <p className="text-muted-foreground">
          Thank you for registering as a mentor. You'll be redirected to create your first program.
        </p>
        <Button onClick={() => router.push("/programs/create")} className="mt-4">
          Create Your First Program
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Become a Mentor</h1>
        <p className="text-muted-foreground mt-2">Share your expertise and help others achieve their goals</p>
      </div>

      {error && <ErrorAlert message={error} />}

      <Card>
        <CardHeader>
          <CardTitle>Mentor Registration</CardTitle>
          <CardDescription>Fill out the form below to register as a mentor on our platform</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="expertise">Area of Expertise *</Label>
              <Input
                id="expertise"
                name="expertise"
                value={formData.expertise}
                onChange={handleInputChange}
                placeholder="e.g. Software Engineering, Marketing, Finance"
                required
              />
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
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell potential mentees about yourself, your experience, and your mentoring style"
                rows={4}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="profile_picture_url">Profile Picture URL (optional)</Label>
              <Input
                id="profile_picture_url"
                name="profile_picture_url"
                value={formData.profile_picture_url}
                onChange={handleInputChange}
                placeholder="https://example.com/your-photo.jpg"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <LoadingSpinner /> : "Register as Mentor"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
