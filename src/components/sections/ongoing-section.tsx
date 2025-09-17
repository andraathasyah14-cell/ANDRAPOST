import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { OngoingContent } from '@/lib/data';
import { Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import AnimatedCard from '../animated-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface OngoingSectionProps {
    ongoingResearches: OngoingContent[];
}

export default function OngoingSection({ ongoingResearches }: OngoingSectionProps) {
  return (
    <section id="ongoing" className="py-16 md:py-24">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">
            Ongoing Research
          </h2>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            A glimpse into my current research endeavors and projects under
            development.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {ongoingResearches.slice(0, 3).map((research) => {
            const runningTime = `Berjalan ${formatDistanceToNow(research.startedOn, { locale: id })}`;

            return (
              <AnimatedCard key={research.id}>
                <Card className="flex flex-col overflow-hidden bg-card/50 h-full">
                  <div className="aspect-video overflow-hidden">
                    <Image
                      src={research.image.imageUrl}
                      alt={research.title}
                      width={600}
                      height={400}
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
        {ongoingResearches.length > 3 && (
            <div className="text-center mt-12">
                <Button asChild size="lg" variant="outline">
                    <Link href="/ongoing">Lihat Semua</Link>
                </Button>
            </div>
        )}
      </div>
    </section>
  );
}
