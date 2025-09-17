
import 'server-only';

import Header from '@/components/header';
import HeroSection from '@/components/sections/hero-section';
import OpinionSection from '@/components/sections/opinion-section';
import PublicationSection from '@/components/sections/publication-section';
import OngoingSection from '@/components/sections/ongoing-section';
import FeedbackSection from '@/components/sections/feedback-section';
import Footer from '@/components/footer';
import FloatingNavWrapper from '@/components/floating-nav-wrapper';
import { getHomePageData } from '@/lib/data';

export const revalidate = 3600; // Revalidate data every hour

export default async function Home() {
  const data = await getHomePageData();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <FloatingNavWrapper />
      <main>
        <HeroSection 
          profile={data.profile}
          opinions={data.opinions} 
          publications={data.publications} 
        />
        <OpinionSection opinions={data.opinions} profile={data.profile} />
        <PublicationSection publications={data.publications} profile={data.profile} />
        <OngoingSection ongoingResearches={data.ongoingResearches} />
        <FeedbackSection />
      </main>
      <Footer />
    </div>
  );
}
