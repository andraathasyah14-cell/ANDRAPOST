// src/lib/data.ts
'use server';
import 'server-only';
import { db } from '@/lib/firebase-admin';

// --- Data Type Definitions ---

export type Tag =
  | 'Repost'
  | 'Original'
  | 'Technology'
  | 'Government'
  | 'International'
  | 'Domestic'
  | 'Quantitative'
  | 'Qualitative';

export interface ImageDetails {
  id: string;
  imageUrl: string;
  description: string;
  imageHint: string;
}

export interface Tool {
  name: string;
  icon: string;
}

export interface Profile {
  name: string;
  description: string;
  tools: Tool[];
  imageUrl?: string;
}

export type ContentType = 'opinion' | 'publication' | 'ongoing';

// Base interface for all content
export interface ContentBase {
  id: string;
  contentType: ContentType;
  title: string;
  tags: Tag[];
  image: ImageDetails;
}

// Specific content types extending the base
export interface OpinionContent extends ContentBase {
  contentType: 'opinion';
  postedOn: string; // "YYYY-MM-DD"
  content: string;
}

export interface PublicationContent extends ContentBase {
  contentType: 'publication';
  publishedOn: string; // "Q2 2024", etc.
  status: 'public' | 'private';
  fileUrl: string;
  viewUrl: string;
  description: string;
}

export interface OngoingContent extends ContentBase {
  contentType: 'ongoing';
  startedOn: Date;
  description: string;
}

export type ContentPost = OpinionContent | PublicationContent | OngoingContent;

// --- MOCK DATA ---
const defaultProfile: Profile = {
  name: "Diandra Athasyah Subagja",
  description: "Seorang analis kebijakan publik dengan minat pada teknologi dan pemerintahan. Saat ini bekerja sebagai peneliti di sebuah lembaga think tank independen di Jakarta.",
  tools: [
    { name: "Stata", icon: "Stata" },
    { name: "MySQL", icon: "MySQL" },
    { name: "Jupyter", icon: "Jupyter" },
    { name: "Anaconda", icon: "Anaconda" },
  ],
  imageUrl: "https://picsum.photos/seed/profile/400/400",
};

const mockImages: Record<string, ImageDetails> = {
    opinion1: { id: "opinion1", imageUrl: "https://picsum.photos/seed/opinion1/600/400", description: "writing desk", imageHint: "writing desk" },
    publication1: { id: "publication1", imageUrl: "https://picsum.photos/seed/pub1/600/400", description: "academic journals", imageHint: "academic journals" },
    ongoing1: { id: "ongoing1", imageUrl: "https://picsum.photos/seed/ongoing1/600/400", description: "whiteboard equations", imageHint: "whiteboard equations" }
};

const mockContent: ContentPost[] = [
    {
        id: "1",
        contentType: 'opinion',
        title: "Pentingnya Literasi Digital di Era Disinformasi",
        postedOn: "2024-05-10",
        tags: ["Original", "Technology", "Domestic"],
        image: mockImages['opinion1'],
        content: "Di tengah derasnya arus informasi, kemampuan untuk memilah berita benar dan hoaks menjadi krusial. Pemerintah dan masyarakat perlu bersinergi untuk meningkatkan literasi digital."
    },
    {
        id: "2",
        contentType: 'publication',
        title: "Analisis Dampak Kebijakan Kendaraan Listrik di Jakarta",
        publishedOn: "Q1 2024",
        tags: ["Quantitative", "Government", "Technology"],
        image: mockImages['publication1'],
        status: 'public',
        fileUrl: '#',
        viewUrl: '#',
        description: 'Penelitian ini mengukur dampak insentif fiskal terhadap adopsi kendaraan listrik dan pengaruhnya terhadap kualitas udara di DKI Jakarta.'
    },
    {
        id: "3",
        contentType: 'ongoing',
        title: "Pemetaan Tata Kelola Data di Sektor Pemerintahan",
        startedOn: new Date("2024-03-15"),
        tags: ["Government", "Qualitative"],
        image: mockImages['ongoing1'],
        description: 'Riset yang sedang berjalan untuk memetakan tantangan dan peluang dalam implementasi kebijakan satu data di tingkat nasional dan daerah.'
    }
];


// --- Main Data Fetching Functions ---

export async function getProfile(): Promise<Profile> {
  try {
    const doc = await db.collection('app-data').doc('profile').get();
    if (!doc.exists) {
      // If profile doesn't exist in Firestore, create it from default
      await db.collection('app-data').doc('profile').set(defaultProfile);
      return defaultProfile;
    }
    return doc.data() as Profile;
  } catch (error) {
    console.error("Error fetching profile, returning default:", error);
    return defaultProfile;
  }
}

export async function getAllContent(): Promise<ContentPost[]> {
  return Promise.resolve(mockContent);
}


/**
 * Fetches all necessary data for the main page in a single operation.
 */
export async function getHomePageData() {
    const [profile, allContent] = await Promise.all([
      getProfile(),
      getAllContent()
    ]);

    const opinions = allContent.filter(c => c.contentType === 'opinion') as OpinionContent[];
    const publications = allContent.filter(c => c.contentType === 'publication') as PublicationContent[];
    const ongoingResearches = allContent.filter(c => c.contentType === 'ongoing') as OngoingContent[];

    return {
      profile,
      opinions,
      publications,
      ongoingResearches,
    };
}
