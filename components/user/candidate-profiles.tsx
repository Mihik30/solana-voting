"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ExternalLink } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Candidate {
  id: string
  name: string
  party?: string
  description?: string
  policies?: string[]
  experience?: string
  votes: number
}

interface CandidateProfilesProps {
  votingAccount: string | null
}

export default function CandidateProfiles({ votingAccount }: CandidateProfilesProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)

  // Get candidates from localStorage or use default
  const getCandidatesFromStorage = () => {
    try {
      const storedCandidates = localStorage.getItem("voting_candidates")
      if (storedCandidates) {
        return JSON.parse(storedCandidates)
      }
    } catch (error) {
      console.error("Error parsing stored candidates:", error)
    }

    // Default candidates if none in storage
    return [
      { name: "Alice Johnson", description: "Progressive Party candidate", votes: 12 },
      { name: "Bob Smith", description: "Conservative Alliance candidate", votes: 8 },
      { name: "Charlie Davis", description: "Independent candidate", votes: 15 },
      { name: "Diana Miller", description: "Green Future candidate", votes: 5 },
    ]
  }

  useEffect(() => {
    const fetchCandidates = async () => {
      if (!votingAccount) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      try {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Get candidates from localStorage
        const storedCandidates = getCandidatesFromStorage()

        // Transform to the format needed for this component
        const candidateData = storedCandidates.map((candidate, index) => ({
          id: `cand_${index + 1}`,
          name: candidate.name,
          party:
            candidate.party ||
            (candidate.name.includes("Progressive")
              ? "Progressive Party"
              : candidate.name.includes("Conservative")
                ? "Conservative Alliance"
                : candidate.name.includes("Green")
                  ? "Green Future"
                  : "Independent"),
          description: candidate.description,
          policies: [
            candidate.name.includes("Alice")
              ? "Universal healthcare for all citizens"
              : "Tax cuts for small businesses",
            candidate.name.includes("Alice")
              ? "Green energy transition by 2030"
              : "Increased funding for police and security",
            candidate.name.includes("Alice") ? "Free education through college" : "School choice programs",
          ],
          experience: candidate.name.includes("Alice")
            ? "City Council Member (2018-2022), Community Organizer (2015-2018)"
            : candidate.name.includes("Bob")
              ? "State Senator (2020-Present), Business Owner (2010-2020)"
              : candidate.name.includes("Charlie")
                ? "Economics Professor (2012-Present), Policy Advisor (2008-2012)"
                : "Environmental Activist (2015-Present), Non-profit Director (2018-2022)",
          votes: candidate.votes,
        }))

        setCandidates(candidateData)
        if (candidateData.length > 0) {
          setSelectedCandidate(candidateData[0].id)
        }
      } catch (error) {
        console.error("Failed to fetch candidates:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCandidates()
  }, [votingAccount])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  const selectedCandidateData = candidates.find((c) => c.id === selectedCandidate)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (candidates.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No candidates found for this election.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Candidate Profiles</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="space-y-2">
            {candidates.map((candidate) => (
              <motion.div key={candidate.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card
                  className={`cursor-pointer transition-colors ${selectedCandidate === candidate.id ? "border-primary" : ""}`}
                  onClick={() => setSelectedCandidate(candidate.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(candidate.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{candidate.name}</h3>
                        {candidate.party && <p className="text-sm text-muted-foreground">{candidate.party}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          {selectedCandidateData && (
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <Avatar className="w-24 h-24">
                    <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                      {getInitials(selectedCandidateData.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-4 flex-1">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedCandidateData.name}</h2>
                      {selectedCandidateData.party && (
                        <Badge variant="outline" className="mt-1">
                          {selectedCandidateData.party}
                        </Badge>
                      )}
                    </div>

                    <p className="text-muted-foreground">{selectedCandidateData.description}</p>

                    <Tabs defaultValue="policies" className="w-full">
                      <TabsList>
                        <TabsTrigger value="policies">Key Policies</TabsTrigger>
                        <TabsTrigger value="experience">Experience</TabsTrigger>
                      </TabsList>

                      <TabsContent value="policies" className="pt-4">
                        {selectedCandidateData.policies && (
                          <ul className="space-y-2">
                            {selectedCandidateData.policies.map((policy, index) => (
                              <li key={index} className="flex items-start">
                                <span className="inline-block w-2 h-2 rounded-full bg-primary mt-1.5 mr-2"></span>
                                <span>{policy}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </TabsContent>

                      <TabsContent value="experience" className="pt-4">
                        <p>{selectedCandidateData.experience}</p>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 px-6 py-4">
                <Button variant="outline" size="sm" className="ml-auto" asChild>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Profile
                  </a>
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

