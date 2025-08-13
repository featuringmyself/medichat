import { Button } from "@/components/ui/button"
import { MessageCircle, Sparkles, Zap } from "lucide-react"

export function HeroSection() {
  return (
    <section className="pt-32 pb-24 px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-transparent to-pink-50/30"></div>
      <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-primary/10 to-purple-300/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-tr from-pink-200/20 to-primary/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center max-w-5xl mx-auto">
          <div className="mb-12 flex justify-center">
            <div className="relative p-6 glass-effect rounded-2xl">
              <div className="flex items-center space-x-2">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-gradient-to-t from-primary to-purple-400 rounded-full luxury-glow"
                    style={{
                      height: `${Math.random() * 50 + 25}px`,
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
              <div className="absolute -top-3 -right-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Sparkles className="w-5 h-5 text-primary float-elegant" />
                </div>
              </div>
              <div className="absolute -bottom-2 -left-2">
                <div className="p-1.5 bg-purple-100 rounded-full">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
              </div>
            </div>
          </div>

          <h1 className="font-serif font-bold text-6xl lg:text-7xl text-slate-900 mb-8 leading-[1.1]">
            Your AI Healthcare
            <span className="text-luxury-gradient block mt-2 gradient-animate">Companion</span>
          </h1>

          <p className="md:text-2xl text-lg text-balance  text-slate-600 mb-12 leading-relaxed max-w-4xl mx-auto font-light">
            MediChat intelligently reads prescriptions, analyzes medical information, and explains everything in clear,
            understandable language — empowering you to take control of your health journey.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-lg px-10 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 luxury-glow"
            >
              <MessageCircle className="w-6 h-6 mr-3" />
              Upload Prescription
            </Button>
          </div>

          <div className="max-w-3xl mx-auto bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-purple-100/50 shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white text-sm font-bold">AI</span>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm flex-1 border border-purple-100/30">
                  <p className="text-slate-700 md:text-lg text-xs md:leading-relaxed text-right">
                    Hello! I&apos;m here to help you understand your prescription. Upload a photo or PDF, and I&apos;ll provide
                    detailed insights about your medication, dosage, and important considerations.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4 justify-end">
                <div className="bg-gradient-to-r from-primary to-purple-600 text-white rounded-2xl p-4 shadow-lg max-w-sm">
                  <p className="text-left md:text-lg text-xs">
                    I have a prescription for Lisinopril. What should I know about potential side effects?
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-slate-600 text-sm font-bold">You</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
