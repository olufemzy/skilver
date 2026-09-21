import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Providers from '@/components/Providers'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'SkilVer — Find Verified Talent', template: '%s | SkilVer' },
  description: 'Connect with verified university students and skilled professionals for any service — digital, trades, tutoring, and more.',
  keywords: ['freelance', 'students', 'skills', 'marketplace', 'Nigeria', 'verified'],
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    siteName: 'SkilVer',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  )
}


// import type { Metadata } from "next";
// import "./globals.css";

// export const metadata: Metadata = {
//   title: {
//     default: "SkilVer — Find Verified Talent",
//     template: "%s | SkilVer",
//   },
//   description:
//     "Connect with verified university students and skilled professionals for any service — digital, trades, tutoring, and more.",
//   keywords: [
//     "freelance",
//     "students",
//     "skills",
//     "marketplace",
//     "Nigeria",
//     "verified",
//   ],
//   openGraph: {
//     type: "website",
//     locale: "en_NG",
//     siteName: "SkilVer",
//   },
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body>{children}</body>
//     </html>
//   );
// }