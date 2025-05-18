import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function TeamPage() {
  const teamMembers = [
    {
      name: "Alex Chen",
      role: "Security Operations Lead",
      expertise: ["Incident Response", "Threat Hunting", "SIEM Management"],
      description:
        "Alex leads the SOC team and excels at real-time threat detection and incident response. They have a military background and approach security with precision and discipline.",
      image: "/security-operations-lead.png",
    },
    {
      name: "Morgan Taylor",
      role: "Threat Intelligence Analyst",
      expertise: ["Threat Intelligence", "Malware Analysis", "Dark Web Monitoring"],
      description:
        "Morgan specializes in analyzing emerging threats and providing actionable intelligence. They have a background in intelligence agencies and bring a strategic perspective to the team.",
      image: "/placeholder-txu4e.png",
    },
    {
      name: "Jordan Rivera",
      role: "Technical Security Specialist",
      expertise: ["Network Security", "Endpoint Protection", "Vulnerability Management"],
      description:
        "Jordan is your technical expert who understands the infrastructure inside and out. They can quickly implement technical controls and provide detailed analysis of attack vectors.",
      image: "/technical-security-specialist.png",
    },
    {
      name: "Sam Washington",
      role: "Communications Director",
      expertise: ["Crisis Communications", "Stakeholder Management", "Regulatory Compliance"],
      description:
        "Sam handles all communications during a crisis, from internal stakeholders to media and regulatory bodies. They help craft the right message at the right time.",
      image: "/placeholder.svg?height=200&width=200&query=professional communications director portrait",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto py-8">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon" className="border-slate-600 text-white hover:bg-slate-700">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-cyan-400">Your Security Team</h1>
            <p className="text-slate-300">Meet the AI team members who will assist you during cyber crises</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member) => (
            <Card key={member.name} className="bg-slate-800 border-slate-700 text-white overflow-hidden">
              <div className="aspect-square relative overflow-hidden">
                <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-cyan-400">{member.name}</CardTitle>
                <CardDescription className="text-slate-300">{member.role}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm mb-3">{member.description}</p>
                <div>
                  <h4 className="text-xs font-semibold uppercase text-slate-400 mb-2">Expertise</h4>
                  <div className="flex flex-wrap gap-1">
                    {member.expertise.map((skill) => (
                      <span
                        key={skill}
                        className="inline-block rounded-full bg-slate-700 px-2 py-1 text-xs text-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="mb-4 text-slate-300">
            During the game, these team members will provide insights, recommendations, and carry out your instructions.
            Each has unique strengths that will be valuable in different crisis scenarios.
          </p>
          <Link href="/game">
            <Button className="bg-cyan-600 hover:bg-cyan-700">Start Game with Your Team</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
