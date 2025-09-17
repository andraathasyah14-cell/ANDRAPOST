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
import { opinions, publications, profile, tools } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OpinionForm from '@/components/admin/opinion-form';
import { handleOpinionUpload } from '@/lib/actions';

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

        <Tabs defaultValue="profile" className="w-full">
          <div className="flex justify-center mb-4">
            <TabsList>
              <TabsTrigger value="profile">Profile Management</TabsTrigger>
              <TabsTrigger value="content">Content Management</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="profile">
            <Card className="w-full shadow-lg">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Profile Management</CardTitle>
                    <CardDescription>
                      Edit your personal information, professional summary, and
                      the tools you showcase.
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
          </TabsContent>
          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
                <CardDescription>
                  Upload and manage your opinions, publications, and ongoing
                  research.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="opinion" className="w-full">
                  <TabsList>
                    <TabsTrigger value="opinion">Upload Opini</TabsTrigger>
                    <TabsTrigger value="publication" disabled>
                      Upload Publikasi
                    </TabsTrigger>
                    <TabsTrigger value="ongoing" disabled>
                      Upload Ongoing
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="opinion">
                    <div className="p-4 border rounded-lg mt-4">
                       <h3 className="text-lg font-semibold mb-2">Upload New Opinion</h3>
                      <OpinionForm onUpload={handleOpinionUpload} />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
