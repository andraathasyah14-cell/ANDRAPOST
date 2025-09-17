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
import { getAllContent, getProfile } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OpinionForm from '@/components/admin/opinion-form';
import PublicationForm from '@/components/admin/publication-form';
import OngoingForm from '@/components/admin/ongoing-form';
import { handleOpinionUpload, handlePublicationUpload, handleOngoingUpload } from '@/lib/actions';
import ContentList from '@/components/admin/content-list';

export default async function AdminPage() {
  const [profile, allContent] = await Promise.all([
    getProfile(),
    getAllContent()
  ]);

  const profileData = {
    name: profile.name,
    description: profile.description,
    totalPublications: allContent.filter(c => c.contentType === 'publication').length,
    totalOpinions: allContent.filter(c => c.contentType === 'opinion').length,
    tools: profile.tools,
  };
  
  const opinions = allContent.filter(c => c.contentType === 'opinion');
  const publications = allContent.filter(c => c.contentType === 'publication');
  const ongoingResearches = allContent.filter(c => c.contentType === 'ongoing');

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
              <TabsTrigger value="upload">Content Upload</TabsTrigger>
              <TabsTrigger value="edit">Edit & Delete Content</TabsTrigger>
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
          <TabsContent value="upload">
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
                    <TabsTrigger value="publication">
                      Upload Publikasi
                    </TabsTrigger>
                    <TabsTrigger value="ongoing">
                      Upload Ongoing
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="opinion">
                    <div className="p-4 border rounded-lg mt-4">
                       <h3 className="text-lg font-semibold mb-2">Upload New Opinion</h3>
                      <OpinionForm onUpload={handleOpinionUpload} />
                    </div>
                  </TabsContent>
                   <TabsContent value="publication">
                    <div className="p-4 border rounded-lg mt-4">
                       <h3 className="text-lg font-semibold mb-2">Upload New Publication</h3>
                      <PublicationForm onUpload={handlePublicationUpload} />
                    </div>
                  </TabsContent>
                   <TabsContent value="ongoing">
                    <div className="p-4 border rounded-lg mt-4">
                       <h3 className="text-lg font-semibold mb-2">Upload New Ongoing Research</h3>
                      <OngoingForm onUpload={handleOngoingUpload} />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
           <TabsContent value="edit">
            <Card>
              <CardHeader>
                <CardTitle>Edit & Delete Content</CardTitle>
                <CardDescription>
                  Review, edit, or delete your existing content here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContentList 
                  opinions={opinions}
                  publications={publications}
                  ongoingResearches={ongoingResearches}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
