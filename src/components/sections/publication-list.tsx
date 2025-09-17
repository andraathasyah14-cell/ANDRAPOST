'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { PublicationPost } from '@/lib/data';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Calendar,
  Download,
  Eye,
  Tag as TagIcon,
  X,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface PublicationListProps {
  publications: PublicationPost[];
}

export default function PublicationList({ publications }: PublicationListProps) {
  const [selectedPub, setSelectedPub] = useState<PublicationPost | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {publications.slice(0, 6).map((pub) => (
          <Card
            key={pub.id}
            className="flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-xl group"
          >
            <div className="aspect-video overflow-hidden relative">
              <Image
                src={pub.image.imageUrl}
                alt={pub.image.description}
                width={600}
                height={400}
                data-ai-hint={pub.image.imageHint}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              />
              <div
                className={cn(
                  'absolute top-3 right-3 h-3 w-3 rounded-full border-2 border-background',
                  pub.status === 'public' ? 'bg-green-500' : 'bg-red-500'
                )}
                title={
                  pub.status === 'public'
                    ? 'Publikasi Umum'
                    : 'Izin Khusus Diperlukan'
                }
              ></div>
            </div>
            <CardHeader>
              <CardTitle className="text-lg leading-tight h-14 line-clamp-2">
                {pub.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex flex-wrap gap-2">
                {pub.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <div className="text-sm text-muted-foreground flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{pub.publishedOn}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setSelectedPub(pub)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  asChild
                  disabled={pub.status === 'private'}
                >
                  <Link href={pub.fileUrl}>
                    <Download className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog
        open={!!selectedPub}
        onOpenChange={(isOpen) => !isOpen && setSelectedPub(null)}
      >
        <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl font-bold">
              {selectedPub?.title}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground pt-2">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{selectedPub?.publishedOn}</span>
                </div>
                <div className="flex items-center flex-wrap gap-2">
                  <TagIcon className="w-4 h-4 mr-2" />
                  {selectedPub?.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-4 overflow-y-auto flex-grow space-y-4">
            <div className="flex items-start space-x-4 bg-muted/50 p-4 rounded-lg">
              <FileText className="w-5 h-5 mt-1 text-primary shrink-0" />
              <p className="text-base leading-relaxed text-foreground/90">
                {selectedPub?.description}
              </p>
            </div>
            <div className="flex gap-4">
              <Button
                asChild
                className="flex-1"
                disabled={selectedPub?.status === 'private'}
              >
                <Link href={selectedPub?.fileUrl || '#'}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href={selectedPub?.viewUrl || '#'}>
                  <Eye className="mr-2 h-4 w-4" />
                  Lihat Sumber
                </Link>
              </Button>
            </div>
            {selectedPub?.status === 'private' && (
              <p className="text-sm text-center text-destructive/80">
                This is a private publication and requires special permission to
                download.
              </p>
            )}
          </div>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}
