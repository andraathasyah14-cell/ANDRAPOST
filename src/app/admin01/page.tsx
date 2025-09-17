import ProfileForm from '@/components/admin/profile-form';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BrainCircuit } from 'lucide-react';
import Logo from '@/components/logo';
import { opinions, publications, tools, profile } from '@/lib/data';

export default function AdminPage() {
  const profileData = {
    name: profile.name,
    description: profile.description,
    totalPublications: publications.length,
    totalOpinions: opinions.length,
    tools: tools,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4">
      <div className="w-full max-w-6xl">
        <div className="relative py-4">
          <div className="absolute top-4 left-0">
            <Button asChild variant="ghost">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
          <div className="text-center">
            <div className="inline-block">
              <Logo />
            </div>
            <p className="text-muted-foreground mt-2">Admin Panel</p>
          </div>
        </div>

        <Card className="w-full shadow-lg mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Profile Management</CardTitle>
                <CardDescription>
                  Edit your personal information, professional summary, and the tools you showcase.
                </CardDescription>
              </div>
              <Button asChild variant="outline" className="mt-4 sm:mt-0">
                <Link href="/admin01/categorize">
                  <BrainCircuit className="mr-2 h-4 w-4" />
                  AI Content Categorizer
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ProfileForm profileData={profileData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
