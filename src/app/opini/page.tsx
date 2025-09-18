
import { getHomePageData } from '@/lib/data';
import OpinionList from '@/components/sections/opinion-list';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function AllOpinionsPage() {
  const { opinions } = await getHomePageData();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow py-16 md:py-24">
        <div className="container">
          <div className="relative mb-12 text-center">
             <div className="absolute top-0 left-0">
                <Button asChild variant="ghost">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Beranda
                    </Link>
                </Button>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-headline">Semua Opini</h1>
            <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
              Kumpulan lengkap pemikiran, analisis, dan perspektif saya tentang berbagai topik.
            </p>
          </div>

          <OpinionList opinions={opinions} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
