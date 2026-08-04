import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-6">Welcome to TalentPulse</h1>
      <p className="text-lg mb-4">Your talent management SaaS platform.</p>
      <nav className="flex gap-4">
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          Dashboard
        </Link>
        <Link href="/talents" className="text-blue-600 hover:underline">
          Talents
        </Link>
        <Link href="/analytics" className="text-blue-600 hover:underline">
          Analytics
        </Link>
      </nav>
    </main>
  )
}
