// src/app/admin01/categorize/page.tsx
import { handleCategorize } from '@/lib/actions';
import CategorizeForm from '@/components/admin/categorize-form';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Logo from '@/components/logo';

export default function CategorizePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4">
      <div className="w-full max-w-2xl">
        <div className="relative py-4">
          <div className="absolute top-4 left-0">
            <Button asChild variant="ghost">
              <Link href="/admin01">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Admin
              </Link>
            </Button>
          </div>
          <div className="text-center">
            <div className="inline-block">
              <Logo />
            </div>
            <p className="text-muted-foreground mt-2">AI Content Categorizer</p>
          </div>
        </div>

        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle>Categorize Content</CardTitle>
            <CardDescription>
              Enter a title and body to get AI-powered tag suggestions for your content. This helps streamline the content upload process.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategorizeForm onCategorize={handleCategorize} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
