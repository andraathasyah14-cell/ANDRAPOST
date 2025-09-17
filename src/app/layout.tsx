
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { getProfile, type Profile } from '@/lib/data';
import { AuthProvider } from '@/components/auth-provider';

const defaultProfile: Profile = {
  name: "Diandra Athasyah Subagja",
  description: "Independent researcher and analyst on technology, government, corporate, and community topics, from domestic to international.",
  tools: [],
  imageUrl: "https://picsum.photos/seed/profile/400/400",
};

export async function generateMetadata(): Promise<Metadata> {
  let profile: Profile;
  try {
    profile = await getProfile();
  } catch (error) {
    console.error("Failed to fetch profile for metadata, using default. Error:", error);
    profile = defaultProfile;
  }
  
  const siteName = "ANDRAPOST";
  const title = `${profile.name} | ${siteName}`;
  const description = profile.description;

  return {
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },
    description: description,
    openGraph: {
        title: title,
        description: description,
        type: 'website',
        locale: 'en_US',
        url: 'https://andrapost.com', // Replace with your actual domain
        siteName: siteName,
        images: [
            {
                url: profile.imageUrl || '/og-image.png', // Provide a fallback OG image
                width: 1200,
                height: 630,
                alt: profile.name,
            },
        ],
    },
     twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      // creator: '@yourtwitterhandle', // Optional: add your Twitter handle
      images: [profile.imageUrl || '/og-image.png'], // Must be an absolute URL
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
