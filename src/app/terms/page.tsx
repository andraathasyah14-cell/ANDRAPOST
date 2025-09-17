import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Terms of Service',
  description: 'Read our terms of service to understand the rules for using our website.',
};

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow py-16 md:py-24">
        <div className="container max-w-4xl">
           <div className="relative mb-8">
            <div className="absolute top-0 left-0">
              <Button asChild variant="ghost">
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
          <Card className="prose dark:prose-invert max-w-none mx-auto p-4 md:p-6">
            <CardHeader>
              <CardTitle className="text-3xl md:text-4xl text-center">Terms of Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-center text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

              <section>
                <h2>1. Agreement to Terms</h2>
                <p>
                  By accessing and using this website (the "Site"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this Site's particular services, you shall be subject to any posted guidelines or rules applicable to such services. Any participation in this site will constitute acceptance of this agreement.
                </p>
              </section>

              <section>
                <h2>2. Intellectual Property Rights</h2>
                <p>
                  The Site and its original content, features, and functionality are owned by the Site owner and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws. Unless otherwise indicated, all content provided on this Site is the property of the Site owner.
                </p>
              </section>

              <section>
                <h2>3. User Conduct</h2>
                <p>
                  You agree not to use the Site in a way that:
                </p>
                <ul>
                  <li>Is illegal, or promotes illegal activity.</li>
                  <li>Is harmful, fraudulent, deceptive, threatening, harassing, defamatory, obscene, or otherwise objectionable.</li>
                  <li>Jeopardizes the security of your or anyone else’s account (such as allowing someone else to log in to the Services as you).</li>
                  <li>Attempts, in any manner, to obtain the password, account, or other security information from any other user.</li>
                </ul>
              </section>

              <section>
                <h2>4. Disclaimer of Warranties</h2>
                <p>
                  The Site is provided on an "AS IS" and "AS AVAILABLE" basis. The owner makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>
              </section>

              <section>
                <h2>5. Limitation of Liability</h2>
                <p>
                  In no event shall the Site owner or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the Site, even if the owner or an authorized representative has been notified orally or in writing of the possibility of such damage.
                </p>
              </section>
              
              <section>
                <h2>6. Governing Law</h2>
                <p>
                    Any claim relating to the Site shall be governed by the laws of the jurisdiction of the Site owner's location without regard to its conflict of law provisions.
                </p>
              </section>

              <section>
                <h2>7. Changes to This Agreement</h2>
                <p>
                  We reserve the right to modify these Terms of Service at any time. We do so by posting and drawing attention to the updated terms on the Site. Your decision to continue to visit and make use of the Site after such changes have been made constitutes your formal acceptance of the new Terms of Service.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
