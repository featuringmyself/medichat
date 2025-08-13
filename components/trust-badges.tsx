import { Shield, Eye, Users, Database } from "lucide-react"

export function TrustBadges() {
  return (
    <section className="py-12 bg-gradient-to-r from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-12">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-primary" />
            <span className="text-slate-700 font-medium">HIPAA Compliant</span>
          </div>
          <div className="flex items-center space-x-3">
            <Database className="w-6 h-6 text-primary" />
            <span className="text-slate-700 font-medium">Zero Data Storage</span>
          </div>
          <div className="flex items-center space-x-3">
            <Eye className="w-6 h-6 text-primary" />
            <span className="text-slate-700 font-medium">AI Transparency</span>
          </div>
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-primary" />
            <span className="text-slate-700 font-medium">Medical Advisor Network</span>
          </div>
        </div>
      </div>
    </section>
  )
}
