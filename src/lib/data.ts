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
  imageUrl: string;
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
  image: {
    imageUrl: string;
  };
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
  description: "Independent researcher and analyst on technology, government, corporate, and community topics, from domestic to international.",
  tools: [
    { name: "Stata", imageUrl: "/tool-logos/stata.svg" },
    { name: "MySQL", imageUrl: "/tool-logos/mysql.svg" },
    { name: "Jupyter", imageUrl: "/tool-logos/jupyter.svg" },
    { name: "Anaconda", imageUrl: "/tool-logos/anaconda.svg" },
  ],
  imageUrl: "https://picsum.photos/seed/profile/400/400",
};


// --- Main Data Fetching Functions ---

export async function getProfile(): Promise<Profile> {
  // try {
  //   const doc = await db.collection('app-data').doc('profile').get();
  //   if (!doc.exists) {
  //     // If profile doesn't exist in Firestore, create it from default
  //     console.log('Profile document not found, creating from default.');
  //     await db.collection('app-data').doc('profile').set(defaultProfile);
  //     return defaultProfile;
  //   }
  //   return doc.data() as Profile;
  // } catch (error) {
  //   console.error('Error fetching profile, returning default:', error);
  //   // Return default profile as a fallback if Firestore is unreachable
  //   return defaultProfile;
  // }
  return defaultProfile;
}

export async function getAllContent(): Promise<ContentPost[]> {
  // try {
  //   const snapshot = await db.collection('content').get();
  //   if (snapshot.empty) {
  //     return [];
  //   }
  //   const content = snapshot.docs.map(doc => {
  //     const data = doc.data();
  //     // Firestore `Timestamp` objects need to be converted to JS `Date` objects
  //     if (data.contentType === 'ongoing' && data.startedOn?.toDate) {
  //       return {
  //         id: doc.id,
  //         ...data,
  //         startedOn: data.startedOn.toDate(),
  //       } as OngoingContent;
  //     }
  //     return { id: doc.id, ...data } as ContentPost;
  //   });
  //   return content;
  // } catch (error) {
  //     console.error("Error fetching all content, returning empty array:", error);
  //     return [];
  // }
  return [];
}


/**
 * Fetches all necessary data for the main page in a single operation.
 */
export async function getHomePageData() {
    const [profile, allContent] = await Promise.all([
      getProfile(),
      getAllContent()
    ]);

    const opinions = allContent.filter(c => c.contentType === 'opinion').sort((a,b) => new Date(b.postedOn).getTime() - new Date(a.postedOn).getTime()) as OpinionContent[];
    const publications = allContent.filter(c => c.contentType === 'publication') as PublicationContent[];
    const ongoingResearches = allContent.filter(c => c.contentType === 'ongoing').sort((a,b) => b.startedOn.getTime() - a.startedOn.getTime()) as OngoingContent[];

    return {
      profile,
      opinions,
      publications,
      ongoingResearches,
    };
}
