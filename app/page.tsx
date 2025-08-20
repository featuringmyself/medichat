import { HeroSection } from "@/components/hero-section"
import { TrustBadges } from "@/components/trust-badges"
import { FileUpload } from "@/components/file-upload"
import { InteractiveDemo } from "@/components/interactive-demo"
import { ForWhomWeCare } from "@/components/for-whom-we-care"
import { EthicsSection } from "@/components/ethics-section"
import { Navigation } from "@/components/navigation"
import Footer from "@/components/Footer"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-white">
      <Navigation />
      <HeroSection />
      <TrustBadges />

      <section className="md:py-32 py-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-100/20 via-transparent to-purple-100/20"></div>
        <div className="container mx-auto px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center mb-20" id="pres_upload">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              AI-Powered Analysis
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-8 font-serif leading-tight">
              Transform Your
              <span className="text-luxury-gradient block mt-2">Prescription Experience</span>
            </h2>
            <p className="md:text-xl text-base text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Upload your prescription image or PDF and experience instant, intelligent analysis. Our advanced AI
              provides comprehensive insights, clear explanations, and personalized guidance.
            </p>
          </div>
          <FileUpload />
        </div>
      </section>

      <InteractiveDemo />
      <ForWhomWeCare />
      <EthicsSection />
      <Footer />


    </main>
  )
}
