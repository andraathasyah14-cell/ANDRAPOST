import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { publications, opinions, tools } from '@/lib/data';

import { BookOpen, MessageSquare } from 'lucide-react';
import { ToolLogos } from '../icons/tool-logos';

export default function HeroSection() {
  const profileImage = PlaceHolderImages.find((p) => p.id === 'profile');
  const totalPublications = publications.length;
  const totalOpinions = opinions.length;

  return (
    <section id="profile" className="py-16 md:py-24 bg-card/50">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-center">
          <div className="md:col-span-1 flex justify-center">
            {profileImage && (
              <Image
                src={profileImage.imageUrl}
                alt={profileImage.description}
                width={250}
                height={250}
                data-ai-hint={profileImage.imageHint}
                className="rounded-full aspect-square object-cover border-4 border-background shadow-lg"
              />
            )}
          </div>
          <div className="md:col-span-2 space-y-4 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight text-primary">
              Your Name
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto md:mx-0">
              A brief, compelling description about your professional identity,
              expertise, and passion goes here.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 max-w-md mx-auto md:mx-0">
              <Card className="bg-primary/10 border-primary/20">
                <CardContent className="p-4 flex items-center">
                  <BookOpen className="h-8 w-8 text-primary mr-4" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {totalPublications}
                    </p>
                    <p className="text-sm text-muted-foreground">Publikasi</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-accent/10 border-accent/20">
                <CardContent className="p-4 flex items-center">
                  <MessageSquare className="h-8 w-8 text-accent mr-4" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {totalOpinions}
                    </p>
                    <p className="text-sm text-muted-foreground">Opini</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 md:gap-x-12">
                {tools.map((tool) => {
                  const Icon = ToolLogos[tool.icon as keyof typeof ToolLogos];
                  return (
                    <div
                      key={tool.name}
                      className="flex items-center space-x-3 text-muted-foreground"
                      title={tool.name}
                    >
                      {Icon && <Icon className="h-6 w-6" />}
                      <span className="hidden sm:inline text-sm font-medium">
                        {tool.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
