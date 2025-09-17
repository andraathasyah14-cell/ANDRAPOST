import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { publications, opinions } from '@/lib/data';
import {
  MySQLIcon,
  StataIcon,
  AnacondaPythonIcon,
  JupyterIcon,
} from '@/components/icons/tool-logos';

const tools = [
  { name: 'MySQL', icon: MySQLIcon },
  { name: 'Stata', icon: StataIcon },
  { name: 'Anaconda Python', icon: AnacondaPythonIcon },
  { name: 'Jupyter Notebook', icon: JupyterIcon },
];

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
            <div className="flex justify-center md:justify-start items-center space-x-4 pt-2">
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {totalPublications}
                </p>
                <p className="text-sm text-muted-foreground">Publikasi</p>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {totalOpinions}
                </p>
                <p className="text-sm text-muted-foreground">Opini</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 md:gap-x-12">
                {tools.map((tool) => (
                  <div
                    key={tool.name}
                    className="flex items-center space-x-3 text-muted-foreground"
                    title={tool.name}
                  >
                    <tool.icon className="h-6 w-6" />
                    <span className="hidden sm:inline text-sm font-medium">
                      {tool.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
