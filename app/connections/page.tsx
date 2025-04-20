"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { connectionsApi, mentorsApi, menteesApi, type Connection, type Mentor, type Mentee } from "@/lib/api"
import { LoadingSpinner, ErrorAlert, SuccessAlert } from "@/components/ui-components"
import { PlusCircle, Trash2, User } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function ConnectionsPage() {
  const searchParams = useSearchParams()
  const [connections, setConnections] = useState<Connection[]>([])
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [mentees, setMentees] = useState<Mentee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(searchParams.get("action") === "create")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    mentor_id: "",
    mentee_id: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      setError(null)

      try {
        const mentorsRes = await mentorsApi.getAll()
        setMentors(mentorsRes.mentors)

        // Only try to get connections if we have mentors
        if (mentorsRes.mentors.length > 0) {
          try {
            const connectionsRes = await connectionsApi.getByMentor(mentorsRes.mentors[0].id)
            setConnections(connectionsRes.connections)
          } catch (err: any) {
            console.error("Failed to fetch connections:", err)
            setError(err.message || "Failed to load connections. Please ensure the API server is running.")
            setConnections([])
          }
        } else {
          setConnections([])
        }
      } catch (err: any) {
        console.error("Failed to fetch mentors:", err)
        setError(err.message || "Failed to load mentors. Please ensure the API server is running.")
        setMentors([])
        setConnections([])
      }

      try {
        const menteesRes = await menteesApi.getAll()
        setMentees(menteesRes.mentees)
      } catch (err) {
        console.error("Failed to fetch mentees:", err)
        setMentees([])
      }
    } catch (err: any) {
      console.error("Failed to load data:", err)
      setError(err.message || "Failed to load data. Please try again later.")
      setMentors([])
      setMentees([])
      setConnections([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData({
      mentor_id: "",
      mentee_id: "",
    })
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const data = {
        mentor_id: Number.parseInt(formData.mentor_id),
        mentee_id: Number.parseInt(formData.mentee_id),
      }

      await connectionsApi.create(data)
      setSuccess("Connection created successfully!")
      resetForm()
      setCreateOpen(false)
      fetchData()
    } catch (err: any) {
      setError(err.message || "Failed to create connection. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (connection: Connection) => {
    setSelectedConnection(connection)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedConnection) return

    try {
      setLoading(true)
      await connectionsApi.delete(selectedConnection.id)
      setSuccess("Connection deleted successfully!")
      setDeleteDialogOpen(false)
      fetchData()
    } catch (err: any) {
      setError(err.message || "Failed to delete connection. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Add a retry function
  const retryFetch = () => {
    setError(null)
    fetchData()
  }

  // Update the error display to include retry button
  if (loading && connections.length === 0) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      {error && <ErrorAlert message={error} retry={retryFetch} />}
      {success && <SuccessAlert message={success} />}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Connections</h1>
          <p className="text-muted-foreground">
            Manage mentor-mentee connections
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Connection
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Connection</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="mentor_id">Mentor *</Label>
                <Select 
                  onValueChange={(value) => handleSelectChange("mentor_id", value)}
                  value={formData.mentor_id}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a mentor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mentors.map((mentor) => (
                      <SelectItem key={mentor.id} value={mentor.id.toString()}>
                        {mentor.name} ({mentor.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mentee_id">Mentee *</Label>
                <Select 
                  onValueChange={(value) => handleSelectChange("mentee_id", value)}
                  value={formData.mentee_id}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a mentee" />
                  </SelectTrigger>
                  <SelectContent>
                    {mentees.map((mentee) => (
                      <SelectItem key={mentee.id} value={mentee.id.toString()}>
                        {mentee.name} ({mentee.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Connection"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {connections.map((connection) => (
          <Card key={connection.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Connection #{connection.id}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{connection.mentor_name || "Mentor"}</p>
                  <p className="text-sm text-muted-foreground">{connection.mentor_email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{connection.mentee_name || "Mentee"}</p>
                  <p className="text-sm text-muted-foreground">{connection.mentee_email}</p>
                </div>
              </div>
              {connection.mentee_goals && (
                <div className="text-sm">
                  <span className="font-medium">Mentee Goals:</span> {connection.mentee_goals}
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                Connected on {new Date(connection.created_at).toLocaleDateString()}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleDeleteClick(connection)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {connections.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No connections found. Create a new connection to get started.</p>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the connection. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
