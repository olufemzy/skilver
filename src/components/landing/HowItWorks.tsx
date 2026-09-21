import { UserPlus, Search, Briefcase, Star } from 'lucide-react'

const STEPS = [
  {
    icon: UserPlus,
    step: '01',
    title: 'Create Your Account',
    description: 'Register as a customer or student/provider. Verification takes under 24 hours.',
  },
  {
    icon: Search,
    step: '02',
    title: 'Find or Post',
    description: 'Search for verified talent or post a job. Our AI matches you with the best providers.',
  },
  {
    icon: Briefcase,
    step: '03',
    title: 'Hire & Work',
    description: 'Hire your chosen provider. Track progress and communicate directly through the platform.',
  },
  {
    icon: Star,
    step: '04',
    title: 'Pay & Review',
    description: 'Approve the work, release payment securely. 10% platform fee, 90% goes to your provider.',
  },
]

export default function HowItWorks() {
  return (
    <section className="section-pad bg-surface">
      <div className="container-app">
        <div className="text-center mb-14">
          <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-3">Simple Process</p>
          <h2 className="font-display text-3xl md:text-4xl text-gray-900 mb-4">How SkilVer works</h2>
          <p className="text-gray-500 max-w-xl mx-auto">From finding talent to completing work — everything happens on one platform, securely and transparently.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <div key={step.step} className="relative">
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-full w-full h-px bg-gray-200 z-0" style={{ width: 'calc(100% - 5rem)', left: '5rem' }} />
              )}
              <div className="card-base p-6 relative z-10">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary-900 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <step.icon size={20} className="text-white" />
                  </div>
                  <span className="font-display text-3xl text-gray-100 font-bold">{step.step}</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-base mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}