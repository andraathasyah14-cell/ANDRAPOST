import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ongoingResearches } from '@/lib/data';
import { Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

export default function OngoingSection() {
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
          {ongoingResearches.slice(0, 6).map((research) => {
            const runningTime = `Berjalan ${formatDistanceToNow(research.startedOn, { locale: id })}`;

            return (
              <Card
                key={research.id}
                className="flex flex-col overflow-hidden bg-card/50"
              >
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
