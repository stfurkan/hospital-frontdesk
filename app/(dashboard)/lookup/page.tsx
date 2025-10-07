import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PatientLookup } from '@/components/lookup/patient-lookup';

export default function LookupPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Hasta Sorgula</h1>
        <p className='text-muted-foreground'>
          T.C. Kimlik No ile hasta bilgilerini sorgulayın
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hasta Arama</CardTitle>
        </CardHeader>
        <CardContent>
          <PatientLookup />
        </CardContent>
      </Card>
    </div>
  );
}

