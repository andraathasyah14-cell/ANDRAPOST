import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getHomePageData } from '@/lib/data';
import { Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import AnimatedCard from '@/components/animated-card';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function AllOngoingPage() {
  const { ongoingResearches } = await getHomePageData();

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
            <h1 className="text-3xl md:text-4xl font-bold font-headline">Semua Riset Ongoing</h1>
            <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
              Sekilas tentang upaya penelitian saya saat ini dan proyek yang sedang dikembangkan.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {ongoingResearches.map((research) => {
            const runningTime = `Berjalan ${formatDistanceToNow(research.startedOn, { locale: id })}`;

            return (
              <AnimatedCard key={research.id}>
                <Card className="flex flex-col overflow-hidden bg-card/50 h-full">
                  <div className="aspect-video overflow-hidden">
                    <Image
                      src={research.image.imageUrl}
                      alt={research.image.description}
                      width={600}
                      height={400}
                      data-ai-hint={research.image.imageHint}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg leading-tight h-14 line-clamp-2">
                      {research.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-3">
                    <p className="text-sm text-muted-foreground h-20 line-clamp-4">
                      {research.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {research.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="text-sm text-muted-foreground font-medium">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    <span>{runningTime}</span>
                  </CardFooter>
                </Card>
              </AnimatedCard>
            );
          })}
        </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
