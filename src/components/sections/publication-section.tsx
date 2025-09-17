import { Button } from '@/components/ui/button';
import { publications } from '@/lib/data';
import PublicationList from './publication-list';
import Link from 'next/link';

export default function PublicationSection() {
  return (
    <section id="publikasi" className="py-16 md:py-24 bg-card/50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">
            Publikasi
          </h2>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            A curated list of my published works, from academic papers to
            industry reports.
          </p>
        </div>

        <PublicationList publications={publications} />

        <div className="text-center mt-12">
          <Button asChild size="lg">
            <Link href="#">Selengkapnya</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
