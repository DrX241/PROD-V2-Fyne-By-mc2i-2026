import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"

export default function ScenariosPage() {
  const scenarios = [
    {
      id: "ransomware-attack",
      title: "Ransomware Attack",
      description:
        "A sophisticated ransomware has encrypted critical systems. You must coordinate the response, decide whether to pay the ransom, and manage business continuity.",
      difficulty: "Hard",
      duration: "60-90 minutes",
      focus: ["Incident Response", "Business Continuity", "Stakeholder Management"],
    },
    {
      id: "data-breach",
      title: "Customer Data Breach",
      description:
        "Sensitive customer data has been exfiltrated from your systems. You need to investigate the breach, contain the damage, and manage the public relations fallout.",
      difficulty: "Medium",
      duration: "45-60 minutes",
      focus: ["Forensic Investigation", "Regulatory Compliance", "Crisis Communication"],
    },
    {
      id: "ddos-attack",
      title: "DDoS Attack",
      description:
        "Your public-facing services are under a massive distributed denial-of-service attack. You must mitigate the attack while maintaining essential services.",
      difficulty: "Easy",
      duration: "30-45 minutes",
      focus: ["Technical Mitigation", "Service Prioritization", "Vendor Coordination"],
    },
    {
      id: "insider-threat",
      title: "Insider Threat",
      description:
        "A disgruntled employee with privileged access is sabotaging systems and stealing intellectual property. You must identify and contain the threat without causing panic.",
      difficulty: "Medium",
      duration: "45-60 minutes",
      focus: ["Internal Investigation", "Access Control", "HR Coordination"],
    },
    {
      id: "supply-chain",
      title: "Supply Chain Compromise",
      description:
        "A critical software vendor has been compromised, potentially affecting your systems through a backdoored update. You must assess the impact and respond accordingly.",
      difficulty: "Hard",
      duration: "60-90 minutes",
      focus: ["Vulnerability Assessment", "Patch Management", "Third-party Risk"],
    },
  ]

  const difficultyColors = {
    Easy: "bg-green-600",
    Medium: "bg-yellow-600",
    Hard: "bg-red-600",
  }

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
            <h1 className="text-3xl font-bold tracking-tight text-cyan-400">Crisis Scenarios</h1>
            <p className="text-slate-300">Choose from various cyber attack scenarios to test your CISO skills</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((scenario) => (
            <Card key={scenario.id} className="bg-slate-800 border-slate-700 text-white">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-cyan-400">{scenario.title}</CardTitle>
                  <Badge className={`${difficultyColors[scenario.difficulty]}`}>{scenario.difficulty}</Badge>
                </div>
                <CardDescription className="text-slate-300">Duration: {scenario.duration}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{scenario.description}</p>
                <div>
                  <h4 className="text-xs font-semibold uppercase text-slate-400 mb-2">Focus Areas</h4>
                  <div className="flex flex-wrap gap-1">
                    {scenario.focus.map((area) => (
                      <span
                        key={area}
                        className="inline-block rounded-full bg-slate-700 px-2 py-1 text-xs text-slate-300"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/game?scenario=${scenario.id}`} className="w-full">
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700">Start This Scenario</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
