'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function NetworkPage() {
  return (
    <div className="container p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Réseau DRH</h1>
        <Button>Créer une discussion</Button>
      </div>
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Avatar>
                  <AvatarFallback>DRH</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">Discussion {i}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Contenu de la discussion {i} sur les bonnes pratiques RH.
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                    <span>12 likes</span>
                    <span>5 commentaires</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}