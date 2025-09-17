import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Read our privacy policy to understand how we collect, use, and protect your data.',
};

export default function PrivacyPolicyPage() {
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
              <CardTitle className="text-3xl md:text-4xl text-center">Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-center text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              
              <section>
                <h2>1. Introduction</h2>
                <p>
                  Welcome to ANDRAPOST. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
                </p>
              </section>

              <section>
                <h2>2. Collection of Your Information</h2>
                <p>
                  We may collect information about you in a variety of ways. The information we may collect on the Site includes:
                </p>
                <ul>
                  <li>
                    <strong>Personal Data:</strong> Personally identifiable information, such as your name and email address, that you voluntarily give to us when you use the feedback form.
                  </li>
                  <li>
                    <strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.
                  </li>
                </ul>
              </section>

              <section>
                <h2>3. Use of Your Information</h2>
                <p>
                  Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
                </p>
                <ul>
                    <li>Respond to your feedback and support requests.</li>
                    <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
                    <li>Protect the security and integrity of our platform.</li>
                </ul>
              </section>

              <section>
                <h2>4. Disclosure of Your Information</h2>
                <p>
                  We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information. We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
                </p>
                <ul>
                    <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</li>
                </ul>
              </section>

              <section>
                <h2>5. Security of Your Information</h2>
                <p>
                  We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                </p>
              </section>
              
              <section>
                <h2>6. Policy for Children</h2>
                <p>
                    We do not knowingly solicit information from or market to children under the age of 13. If you become aware of any data we have collected from children under age 13, please contact us using the contact information provided below.
                </p>
              </section>

              <section>
                <h2>7. Contact Us</h2>
                <p>
                  If you have questions or comments about this Privacy Policy, please contact us through the feedback form available on the main page.
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
