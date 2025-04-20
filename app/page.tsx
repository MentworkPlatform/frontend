import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Users, BookOpen, Search } from "lucide-react"

export default function Home() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Find Your Perfect <span className="text-primary">Mentor</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Connect with experienced mentors who can guide you on your journey to success
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button asChild size="lg" className="gap-2">
            <Link href="/find-mentor">
              Find a Mentor
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/become-mentor">Become a Mentor</Link>
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <p className="text-muted-foreground mt-2">Simple steps to connect with the right mentor</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium">Find Matches</h3>
            <p className="text-muted-foreground">
              Share your goals and interests to find mentors who are the perfect match for your needs.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium">Connect</h3>
            <p className="text-muted-foreground">
              Establish a connection with your chosen mentor and begin your mentorship journey.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium">Join Programs</h3>
            <p className="text-muted-foreground">
              Participate in structured mentorship programs designed to help you achieve your goals.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted rounded-xl p-8 text-center space-y-6">
        <h2 className="text-3xl font-bold">Ready to Start Your Journey?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Whether you're looking for guidance or want to share your expertise, Mentwork is the platform for you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button asChild size="lg">
            <Link href="/find-mentor">Find a Mentor</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/become-mentor">Become a Mentor</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
