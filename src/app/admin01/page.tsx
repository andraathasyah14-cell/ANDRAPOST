
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import ProfileForm from '@/components/admin/profile-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BrainCircuit } from 'lucide-react';
import Logo from '@/components/logo';
import { getProfile, getOpinions, getPublications, getOngoingResearches, type OpinionContent, type PublicationContent, type OngoingContent, type Profile } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OpinionForm from '@/components/admin/opinion-form';
import PublicationForm from '@/components/admin/publication-form';
import OngoingForm from '@/components/admin/ongoing-form';
import { handleOpinionUpload, handlePublicationUpload, handleOngoingUpload } from '@/lib/actions';
import ContentList from '@/components/admin/content-list';
import { useAuth } from '@/components/auth-provider';


export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [opinions, setOpinions] = useState<OpinionContent[]>([]);
  const [publications, setPublications] = useState<PublicationContent[]>([]);
  const [ongoingResearches, setOngoingResearches] = useState<OngoingContent[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
    if (!loading && user) {
      const fetchData = async () => {
        setIsDataLoading(true);
        const [profileData, opinionsData, publicationsData, ongoingData] = await Promise.all([
          getProfile(),
          getOpinions(),
          getPublications(),
          getOngoingResearches()
        ]);
        setProfile(profileData);
        setOpinions(opinionsData);
        setPublications(publicationsData);
        setOngoingResearches(ongoingData);
        setIsDataLoading(false);
      };
      fetchData();
    }
  }, [user, loading, router]);


  if (loading || isDataLoading || !user || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const profileData = {
    name: profile.name,
    description: profile.description,
    totalPublications: publications.length,
    totalOpinions: opinions.length,
    tools: profile.tools,
    imageUrl: profile.imageUrl,
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
                <CardTitle>Edit &amp; Delete Content</CardTitle>
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
