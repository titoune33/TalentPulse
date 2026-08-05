'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Inscription</CardTitle>
          <CardDescription>Créez votre compte</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Input type="text" placeholder="Nom" required />
            </div>
            <div className="space-y-2">
              <Input type="email" placeholder="Email" required />
            </div>
            <div className="space-y-2">
              <Input type="password" placeholder="Mot de passe" required />
            </div>
            <Button type="submit" className="w-full">S'inscrire</Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link href="/login" className="text-primary underline">Déjà un compte ? Se connecter</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}