
import { verifySession, handleLogout } from '@/lib/actions';
import { getHomePageData } from '@/lib/data';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, PlusCircle, User, Settings, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OpinionForm from '@/components/admin/opinion-form';
import PublicationForm from '@/components/admin/publication-form';
import OngoingForm from '@/components/admin/ongoing-form';
import ContentList from '@/components/admin/content-list';
import ProfileForm from '@/components/admin/profile-form';

import {
  handleOpinionUpload,
  handlePublicationUpload,
  handleOngoingUpload,
} from '@/lib/actions';

export default async function AdminPage() {
  const { isLoggedIn, user } = await verifySession();

  if (!isLoggedIn) {
    redirect('/login');
  }

  const { profile, opinions, publications, ongoingResearches } = await getHomePageData();
  
  // This object is now safe because getProfile ensures `profile` is never null/undefined.
  const profileWithTotals = {
    ...(profile || {}),
    totalPublications: publications.length,
    totalOpinions: opinions.length,
  };


  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-xl font-semibold">Admin Panel</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Welcome, {user?.name || user?.email}
            </span>
            <form action={handleLogout}>
              <Button type="submit" variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Tabs defaultValue="dashboard">
          <TabsList className="grid w-full grid-cols-1 sm:w-auto sm:grid-cols-4 mb-6">
            <TabsTrigger value="dashboard">
              <Settings className="mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="upload">
              <PlusCircle className="mr-2" />
              Upload Konten
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="mr-2" />
              Kelola Profil
            </TabsTrigger>
             <TabsTrigger value="ai-tools">
              <BrainCircuit className="mr-2" />
              Perkakas AI
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Card>
              <CardHeader>
                <CardTitle>Manajemen Konten</CardTitle>
                <CardDescription>
                  Kelola semua opini, publikasi, dan riset yang sedang berjalan dari satu tempat.
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

          <TabsContent value="upload">
            <Tabs defaultValue="opinion" className="w-full">
              <TabsList>
                <TabsTrigger value="opinion">Opini</TabsTrigger>
                <TabsTrigger value="publication">Publikasi</TabsTrigger>
                <TabsTrigger value="ongoing">Riset Ongoing</TabsTrigger>
              </TabsList>
              <Card className="mt-4">
                 <CardContent className="p-6">
                    <TabsContent value="opinion">
                      <OpinionForm onUpload={handleOpinionUpload} />
                    </TabsContent>
                    <TabsContent value="publication">
                        <PublicationForm onUpload={handlePublicationUpload} />
                    </TabsContent>
                    <TabsContent value="ongoing">
                        <OngoingForm onUpload={handleOngoingUpload} />
                    </TabsContent>
                 </CardContent>
              </Card>
            </Tabs>
          </TabsContent>

          <TabsContent value="profile">
             <Card>
                <CardHeader>
                    <CardTitle>Profil Publik</CardTitle>
                    <CardDescription>
                        Perbarui informasi yang ditampilkan di halaman utama website Anda.
                    </CardDescription>
                </Header>
                <CardContent>
                   <ProfileForm profileData={profileWithTotals} />
                </CardContent>
             </Card>
          </TabsContent>

           <TabsContent value="ai-tools">
             <Card>
                <CardHeader>
                    <CardTitle>Perkakas Berbasis AI</CardTitle>
                    <CardDescription>
                        Manfaatkan AI untuk membantu alur kerja konten Anda.
                    </CardDescription>
                </Header>
                <CardContent>
                   <p>Gunakan <Link href="/admin01/categorize" className="font-medium text-primary underline">Alat Kategorisasi</Link> untuk mendapatkan saran tag otomatis untuk unggahan Anda berikutnya.</p>
                </CardContent>
             </Card>
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
}
