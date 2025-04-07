"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"

interface AdminAnalyticsProps {
  wallet: any
  votingAccount: string | null
}

export default function AdminAnalytics({ wallet, votingAccount }: AdminAnalyticsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [candidateData, setCandidateData] = useState<any[]>([])
  const [timeData, setTimeData] = useState<any[]>([])
  const [demographicData, setDemographicData] = useState<any[]>([])

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!votingAccount) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      try {
        // This would be replaced with actual Solana program interaction
        // Simulating fetching analytics data
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Mock data
        const mockCandidateData = [
          { name: "Alice Johnson", votes: 12 },
          { name: "Bob Smith", votes: 8 },
          { name: "Charlie Davis", votes: 15 },
          { name: "Diana Miller", votes: 5 },
        ]

        const mockTimeData = [
          { day: "Day 1", votes: 5 },
          { day: "Day 2", votes: 8 },
          { day: "Day 3", votes: 12 },
          { day: "Day 4", votes: 10 },
          { day: "Day 5", votes: 5 },
        ]

        const mockDemographicData = [
          { name: "18-24", value: 10 },
          { name: "25-34", value: 15 },
          { name: "35-44", value: 8 },
          { name: "45-54", value: 7 },
          { name: "55+", value: 5 },
        ]

        setCandidateData(mockCandidateData)
        setTimeData(mockTimeData)
        setDemographicData(mockDemographicData)
      } catch (error) {
        console.error("Failed to fetch analytics data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [votingAccount])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">40</div>
            <p className="text-xs text-muted-foreground">+12% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unique Voters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">38</div>
            <p className="text-xs text-muted-foreground">95% participation rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Time Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3 days</div>
            <p className="text-xs text-muted-foreground">Ends on April 15, 2025</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="votes" className="w-full">
        <TabsList>
          <TabsTrigger value="votes">Votes by Candidate</TabsTrigger>
          <TabsTrigger value="time">Voting Timeline</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
        </TabsList>

        <TabsContent value="votes" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Votes by Candidate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={candidateData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="votes" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Voting Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="votes" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Voter Demographics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={demographicData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {demographicData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

