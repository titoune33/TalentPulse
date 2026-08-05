'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function EmployeesPage() {
  return (
    <div className="container p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employés</h1>
        <Link href="/employees/new">
          <Button>Ajouter un employé</Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Liste des employés</CardTitle>
          <CardDescription>Gérez vos employés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Employé {i}</div>
                  <div className="text-sm text-muted-foreground">employe{i}@entreprise.com</div>
                </div>
                <div>
                  <Badge variant={i === 1 ? 'destructive' : i === 2 ? 'warning' : 'success'}>
                    {i === 1 ? 'High Risk' : i === 2 ? 'At Risk' : 'Stable'}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Voir</Button>
                  <Button variant="outline" size="sm">Modifier</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}