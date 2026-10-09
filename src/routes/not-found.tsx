import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/PageHeader';

export default function NotFound() {
  return (
    <>
      <PageHeader
        title="Dieser Versuch existiert nicht."
        description="Die angeforderte Seite wurde im Labor nicht gefunden."
        icon={<Compass className="h-5 w-5" />}
      />
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <CardTitle>Zurück zur Arbeitsfläche</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-5 text-sm text-muted-foreground">
            Starte mit dem Periodensystem, erkunde ein Molekül oder öffne eine Übungsrunde.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild><Link to="/">Startseite</Link></Button>
            <Button asChild variant="outline"><Link to="/periodic-table">Periodensystem</Link></Button>
            <Button asChild variant="outline"><Link to="/quiz">Üben</Link></Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
