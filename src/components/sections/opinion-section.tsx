
import { Button } from '@/components/ui/button';
import type { OpinionContent } from '@/lib/data';
import OpinionList from './opinion-list';
import Link from 'next/link';

interface OpinionSectionProps {
    opinions: OpinionContent[];
}

export default function OpinionSection({ opinions }: OpinionSectionProps) {
  return (
    <section id="opini" className="py-16 md:py-24">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">Opini</h2>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            A collection of thoughts, analyses, and perspectives on various
            topics.
          </p>
        </div>

        <OpinionList opinions={opinions.slice(0, 6)} />

        {opinions.length > 6 && (
            <div className="text-center mt-12">
                <Button asChild size="lg" variant="outline">
                    <Link href="/opini">Baca Selengkapnya</Link>
                </Button>
            </div>
        )}
      </div>
    </section>
  );
}
