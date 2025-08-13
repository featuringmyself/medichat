import { Card } from "@/components/ui/card"
import { Heart, Users, Stethoscope } from "lucide-react"

export function ForWhomWeCare() {
  const audiences = [
    {
      icon: Heart,
      title: "Patients",
      description:
        "Get clear explanations of your medications, understand side effects, and know what to expect from your treatment plan.",
      story: '"Finally, I understand what my doctor prescribed and why it matters for my health."',
    },
    {
      icon: Users,
      title: "Caregivers",
      description:
        "Help your loved ones manage their medications safely with easy-to-understand information and reminders.",
      story: '"I can now confidently help my elderly mother with her complex medication routine."',
    },
    {
      icon: Stethoscope,
      title: "Healthcare Professionals",
      description:
        "Enhance patient education and communication with AI-powered explanations that patients can easily understand.",
      story: '"My patients are more engaged and compliant when they truly understand their treatment."',
    },
  ]

  return (
    <section id="for-whom" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif font-bold text-4xl text-slate-900 mb-4">For Whom We Care</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            MediChat serves everyone in the healthcare journey, making medical information accessible to all
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {audiences.map((audience, index) => {
            const Icon = audience.icon
            return (
              <Card key={index} className="p-8 text-center hover:shadow-lg transition-shadow duration-300">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif font-bold text-2xl text-slate-900 mb-4">{audience.title}</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">{audience.description}</p>
                <blockquote className="text-primary italic font-medium">{audience.story}</blockquote>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
