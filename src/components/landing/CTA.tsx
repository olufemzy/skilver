import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function CTA() {
  return (
    <section className="section-pad bg-surface">
      <div className="container-app">
        <div className="bg-primary-900 rounded-3xl px-8 md:px-16 py-16 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <h2 className="font-display text-3xl md:text-5xl text-white mb-4 leading-tight">
              Ready to get started?
            </h2>
            <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of students and businesses already using SkilVer to get things done.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/browse" className="btn-accent flex items-center justify-center gap-2">
                Find a Service <ArrowRight size={16} />
              </Link>
              <Link href="/register/student" className="flex items-center justify-center gap-2 border-2 border-white/30 hover:border-white/60 text-white font-semibold px-8 py-3 rounded-xl transition-all">
                Offer Your Skills
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}