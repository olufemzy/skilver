import Link from 'next/link'

const LINKS = {
  Platform: [
    { label: 'Browse Services', href: '/browse' },
    { label: 'Post a Job', href: '/customer/post-job' },
    { label: 'Become a Provider', href: '/register/student' },
    { label: 'How It Works', href: '/#how-it-works' },
  ],
  Categories: [
    { label: 'Digital & Tech', href: '/browse?category=digital-tech' },
    { label: 'Education', href: '/browse?category=education' },
    { label: 'Skilled Trades', href: '/browse?category=skilled-trades' },
    { label: 'Events & Media', href: '/browse?category=events-media' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="container-app py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-display text-sm font-bold">SV</span>
              </div>
              <span className="font-display text-xl text-white">SkilVer</span>
            </div>
            <p className="text-sm leading-relaxed">
              The verified skills marketplace connecting talented students and professionals with people who need work done.
            </p>
          </div>
          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group}>
              <p className="text-white font-semibold text-sm mb-4">{group}</p>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm hover:text-white transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p>© {new Date().getFullYear()} SkilVer. All rights reserved.</p>
          <p>Made with ❤️ for Nigerian students and skilled professionals.</p>
        </div>
      </div>
    </footer>
  )
}