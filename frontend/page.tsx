'use client';
import Link from 'next/link';
import { Button } from './components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">TalentPulse</h1>
      <p className="text-xl mb-8">SaaS pour les DRH</p>
      <div className="flex gap-4">
        <Link href="/login"><Button>Se connecter</Button></Link>
        <Link href="/register"><Button variant="outline">S'inscrire</Button></Link>
      </div>
    </div>
  );
}