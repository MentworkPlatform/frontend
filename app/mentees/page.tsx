"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { menteesApi, type Mentee } from "@/lib/api"
import { LoadingSpinner, ErrorAlert, SuccessAlert } from "@/components/ui-components"
import { UserPlus, User, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function MenteesPage() {
  const searchParams = useSearchParams()
  const [mentees, setMentees] = useState<Mentee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [registerOpen, setRegisterOpen] = useState(searchParams.get("action") === "register")
  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    goals: "",
  })

  useEffect(() => {
    fetchMentees()
  }, [])

  async function fetchMentees() {
    try {
      setLoading(true)
      setError(null)
      const response = await menteesApi.getAll()
      setMentees(response.mentees)
    } catch (err: any) {
      console.error("Failed to fetch mentees:", err)
      setError(err.message || "Failed to load mentees. Please ensure the API server is running.")
      // Set empty array to avoid undefined errors
      setMentees([])
    } finally {
      setLoading(false)
    }
  }

  // Add a retry function
  const retryFetch = () => {
    setError(null)
    fetchMentees()
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
        goals: formData.goals || undefined,
      }

      await menteesApi.register(data)
      setSuccess("Mentee registered successfully!")
      setFormData({
        name: "",
        email: "",
        goals: "",
      })
      setRegisterOpen(false)
      fetchMentees()
    } catch (err: any) {
      setError(err.message || "Failed to register mentee. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleMenteeClick = (mentee: Mentee) => {
    setSelectedMentee(mentee)
    setDetailsOpen(true)
  }

  if (loading && mentees.length === 0) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      {error && <ErrorAlert message={error} retry={retryFetch} />}
      {success && <SuccessAlert message={success} />}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mentees</h1>
          <p className="text-muted-foreground">View and manage all mentees in the platform</p>
        </div>
        <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Register Mentee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Register New Mentee</DialogTitle>
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
                <Label htmlFor="goals">Goals</Label>
                <Textarea id="goals" name="goals" value={formData.goals} onChange={handleInputChange} rows={3} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setRegisterOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Registering..." : "Register Mentee"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mentees.map((mentee) => (
          <Card
            key={mentee.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleMenteeClick(mentee)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{mentee.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{mentee.email}</p>
              {mentee.goals && (
                <p className="text-sm line-clamp-2">
                  <span className="font-medium">Goals:</span> {mentee.goals}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {mentees.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No mentees found. Register a new mentee to get started.</p>
        </div>
      )}

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Mentee Details</span>
              <Button variant="ghost" size="icon" onClick={() => setDetailsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedMentee && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedMentee.name}</h3>
                  <p className="text-muted-foreground">{selectedMentee.email}</p>
                </div>
              </div>

              <div className="grid gap-2">
                <h4 className="font-medium">Goals</h4>
                <p className="text-sm">{selectedMentee.goals || "No goals provided"}</p>
              </div>

              <div className="grid gap-2">
                <h4 className="font-medium">Joined</h4>
                <p className="text-sm">{new Date(selectedMentee.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
