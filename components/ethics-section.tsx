import { Card } from "@/components/ui/card"
import { Shield, Brain, Users2 } from "lucide-react"
import Image from "next/image"

export function EthicsSection() {
  return (
    <section id="safety" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Human Element */}
          <div className="relative">
            <Image
              src="/healthcare-ai-collaboration.png"
              alt="Healthcare professionals and patients using AI technology"
              className="rounded-2xl shadow-lg w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl"></div>
          </div>

          {/* Right Side - Ethics Content */}
          <div>
            <h2 className="font-serif font-bold text-4xl text-slate-900 mb-6">AI Ethics & Safety First</h2>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              We believe AI should enhance human care, not replace it. Our commitment to ethical AI ensures your health
              information is protected, accurate, and always transparent.
            </p>

            <div className="space-y-6">
              <Card className="p-6 border-l-4 border-l-primary">
                <div className="flex items-start space-x-4">
                  <Shield className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-serif font-bold text-lg text-slate-900 mb-2">Privacy Protection</h3>
                    <p className="text-slate-600">
                      Your health data is encrypted, never stored permanently, and processed with the highest security
                      standards.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-l-4 border-l-sky-500">
                <div className="flex items-start space-x-4">
                  <Brain className="w-6 h-6 text-sky-500 mt-1" />
                  <div>
                    <h3 className="font-serif font-bold text-lg text-slate-900 mb-2">Accuracy & Transparency</h3>
                    <p className="text-slate-600">
                      Every AI response includes sources and confidence levels. We&apos;re clear about what we know and what
                      requires professional consultation.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-l-4 border-l-slate-400">
                <div className="flex items-start space-x-4">
                  <Users2 className="w-6 h-6 text-slate-600 mt-1" />
                  <div>
                    <h3 className="font-serif font-bold text-lg text-slate-900 mb-2">Human-Centered Design</h3>
                    <p className="text-slate-600">
                      MediChat complements your healthcare team, encouraging you to discuss insights with your doctor
                      for the best care.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
