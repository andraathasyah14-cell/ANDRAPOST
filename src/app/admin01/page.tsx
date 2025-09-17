import ContentForm from '@/components/admin/content-form';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { handleCategorize } from '@/lib/actions';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Logo from '@/components/logo';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 left-4">
        <Button asChild variant="ghost">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      <div className="text-center mb-8">
        <div className="inline-block">
          <Logo />
        </div>
        <p className="text-muted-foreground mt-2">Admin Panel</p>
      </div>

      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle>Content Categorization Tool</CardTitle>
          <CardDescription>
            Use AI to suggest tags for your content. Enter a title and body,
            then click &quot;Categorize&quot;.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContentForm onCategorize={handleCategorize} />
        </CardContent>
      </Card>
    </div>
  );
}
