import { Hero, Features, HowItWorks, CTA } from '@/components/landing'
import { Navbar } from '@/components/shared'

export default function Home() {
  return (
    <main>
      <Navbar variant="landing" />
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
    </main>
  )
}
