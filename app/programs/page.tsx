"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { programsApi, type Program } from "@/lib/api"
import { LoadingSpinner, ErrorAlert } from "@/components/ui-components"
import { Calendar, Clock, DollarSign, PlusCircle } from "lucide-react"

export default function Programs() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPrograms() {
      try {
        setLoading(true)
        setError(null)
        const response = await programsApi.getAll()
        setPrograms(response.programs)
      } catch (err: any) {
        console.error("Failed to fetch programs:", err)
        setError(err.message || "Failed to load programs. Please ensure the API server is running.")
        setPrograms([])
      } finally {
        setLoading(false)
      }
    }

    fetchPrograms()
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mentorship Programs</h1>
          <p className="text-muted-foreground mt-2">Browse available mentorship programs or create your own</p>
        </div>
        <Button asChild>
          <Link href="/programs/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Program
          </Link>
        </Button>
      </div>

      {error && <ErrorAlert message={error} />}

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : programs.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <Card key={program.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{program.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">By {program.mentor_name || program.mentor_email}</p>
                {program.description && <p className="text-sm line-clamp-2">{program.description}</p>}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(program.session_date).toLocaleDateString()}</span>
                  </div>
                  {program.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{program.duration} mins</span>
                    </div>
                  )}
                  {program.price && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>${program.price}</span>
                    </div>
                  )}
                  {program.session_type && <div className="text-sm capitalize">{program.session_type}</div>}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Apply for Program</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted rounded-lg">
          <h3 className="text-lg font-medium">No programs available yet</h3>
          <p className="text-muted-foreground mt-2">Be the first to create a mentorship program!</p>
          <Button asChild className="mt-4">
            <Link href="/programs/create">Create a Program</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
