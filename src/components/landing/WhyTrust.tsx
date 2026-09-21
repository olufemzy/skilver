import { ShieldCheck, MessageSquare, Lock, Award } from 'lucide-react'

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: 'Verified Student Identities',
    description: 'Every student provider submits their university ID and credentials. Our team manually reviews and approves each profile.',
  },
  {
    icon: Lock,
    title: 'Secure Escrow Payments',
    description: 'Funds are held securely until work is approved. You only pay when you\'re satisfied with the result.',
  },
  {
    icon: MessageSquare,
    title: 'Transparent Communication',
    description: 'All conversations happen on-platform. Complete job history and message logs are always accessible.',
  },
  {
    icon: Award,
    title: 'Verified Work History',
    description: 'Every completed job is recorded permanently on the provider\'s profile — building a genuine track record.',
  },
]

export default function WhyTrust() {
  return (
    <section className="section-pad bg-primary-900">
      <div className="container-app">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-4">Why Customers Trust Us</p>
            <h2 className="font-display text-3xl md:text-4xl text-white mb-6 leading-tight">
              Hire with complete confidence
            </h2>
            <p className="text-white/70 text-lg leading-relaxed">
              We connect you with verified, skilled people — not anonymous strangers. Every provider on SkilVer has been reviewed, verified, and rated by real customers.
            </p>
          </div>

          <div className="grid gap-5">
            {TRUST_POINTS.map(point => (
              <div key={point.title} className="flex gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <point.icon size={18} className="text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm mb-1">{point.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{point.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}