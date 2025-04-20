"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { programsApi } from "@/lib/api"
import { LoadingSpinner, ErrorAlert } from "@/components/ui-components"
import { CheckCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CreateProgram() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    mentor_email: "",
    title: "",
    description: "",
    session_type: "",
    price: "",
    duration: "",
    session_date: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)

      const data = {
        mentor_email: formData.mentor_email,
        title: formData.title,
        description: formData.description || undefined,
        session_type: formData.session_type || undefined,
        price: formData.price ? Number.parseFloat(formData.price) : undefined,
        duration: formData.duration ? Number.parseInt(formData.duration) : undefined,
        session_date: formData.session_date,
      }

      await programsApi.create(data)
      setSuccess(true)
    } catch (err: any) {
      console.error("Failed to create program:", err)
      setError(err.message || "Failed to create program. Please ensure the API server is running.")
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
        <h1 className="text-2xl font-bold">Program Created Successfully!</h1>
        <p className="text-muted-foreground">
          Your mentorship program has been created and is now available for mentees to apply.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
          <Button onClick={() => router.push("/programs")}>View All Programs</Button>
          <Button
            variant="outline"
            onClick={() => {
              setSuccess(false)
              setFormData({
                mentor_email: formData.mentor_email,
                title: "",
                description: "",
                session_type: "",
                price: "",
                duration: "",
                session_date: "",
              })
            }}
          >
            Create Another Program
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Create a Mentorship Program</h1>
        <p className="text-muted-foreground mt-2">Design a program to share your expertise with mentees</p>
      </div>

      {error && <ErrorAlert message={error} />}

      <Card>
        <CardHeader>
          <CardTitle>Program Details</CardTitle>
          <CardDescription>Fill out the form below to create a new mentorship program</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="mentor_email">Your Email *</Label>
              <Input
                id="mentor_email"
                name="mentor_email"
                type="email"
                value={formData.mentor_email}
                onChange={handleInputChange}
                placeholder="Enter your registered mentor email"
                required
              />
              <p className="text-sm text-muted-foreground">
                Please use the same email you registered with as a mentor
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Program Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Web Development Fundamentals"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what mentees will learn in this program"
                rows={4}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="session_type">Session Type</Label>
              <Select
                onValueChange={(value) => handleSelectChange("session_type", value)}
                value={formData.session_type}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-on-one">One-on-One</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="60"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="session_date">Session Date *</Label>
              <Input
                id="session_date"
                name="session_date"
                type="date"
                value={formData.session_date}
                onChange={handleInputChange}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <LoadingSpinner /> : "Create Program"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}