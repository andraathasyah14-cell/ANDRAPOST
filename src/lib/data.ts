
'use server';
import 'server-only';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// --- FIREBASE ADMIN INITIALIZATION (SERVER-SIDE) ---
// This ensures Firebase Admin is initialized only once.
if (!getApps().length) {
  initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
   console.log("Firebase Admin SDK initialized in data.ts.");
}
const db = getFirestore();

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
  id?: string;
  name: string;
  imageUrl: string;
}

export interface Profile {
  name:string;
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

// --- DEFAULT DATA for fallback ---
const defaultProfile: Profile = {
  name: "Diandra Athasyah Subagja",
  description: "Independent researcher and analyst on technology, government, corporate, and community topics, from domestic to international.",
  tools: [
    { id: '1', name: "Stata", imageUrl: "/tool-logos/stata.svg" },
    { id: '2', name: "MySQL", imageUrl: "/tool-logos/mysql.svg" },
    { id: '3', name: "Jupyter", imageUrl: "/tool-logos/jupyter.svg" },
    { id: '4', name: "Anaconda", imageUrl: "/tool-logos/anaconda.svg" },
    { id: '5', name: "AWS", imageUrl: "/tool-logos/aws.svg" },
  ],
  imageUrl: "https://picsum.photos/seed/profile/400/400",
};


// --- Main Data Fetching Functions ---

export async function getProfile(): Promise<Profile> {
  try {
    const profileDoc = await db.collection('profile').doc('main').get();
    
    if (!profileDoc.exists) {
      console.warn("Profile document not found in Firestore, returning default.");
      // Optional: Create the default profile if it doesn't exist
      await db.collection('profile').doc('main').set(defaultProfile);
      return defaultProfile;
    }

    return profileDoc.data() as Profile;

  } catch (error) {
    console.error('Error fetching profile from Firestore, returning default profile:', error);
    return defaultProfile;
  }
}

export async function getAllContent(): Promise<ContentPost[]> {
  try {
    // Order by creation date descending to get newest content first
    const contentSnapshot = await db.collection('content').orderBy('createdAt', 'desc').get();

    if (contentSnapshot.empty) {
      return [];
    }

    return contentSnapshot.docs.map(doc => {
      const data = doc.data();
      // Ensure there is an ID and a valid content type
      if (!doc.id || !data.contentType) return null;

      const base = {
        id: doc.id,
        contentType: data.contentType,
        title: data.title || 'Untitled',
        tags: data.tags || [],
        image: { imageUrl: data.imageUrl || "https://picsum.photos/seed/default/600/400" },
      };

      if (data.contentType === 'opinion') {
        return {
          ...base,
          postedOn: data.postedOn || 'N/A',
          content: data.content || ''
        } as OpinionContent;
      }
      if (data.contentType === 'publication') {
        return {
          ...base,
          publishedOn: data.publishedOn || 'N/A',
          status: data.status || 'private',
          fileUrl: data.fileUrl || '#',
          viewUrl: data.viewUrl || '#',
          description: data.description || ''
        } as PublicationContent;
      }
      if (data.contentType === 'ongoing') {
        // Firestore Timestamps need to be converted to JS Dates
        const startedOnDate = data.startedOn?.toDate ? data.startedOn.toDate() : new Date();
        return {
          ...base,
          startedOn: startedOnDate,
          description: data.description || ''
        } as OngoingContent;
      }
      return null;
    }).filter((item): item is ContentPost => item !== null); // Type guard to filter out nulls

  } catch (error) {
      console.error("Error fetching all content from Firestore, returning empty array:", error);
      return [];
  }
}


/**
 * Fetches all necessary data for the main page in a single operation.
 */
export async function getHomePageData() {
    const [profile, allContent] = await Promise.all([
      getProfile(),
      getAllContent()
    ]);

    // Sorting is now handled by the Firestore query for more efficiency,
    // but we still need to filter.
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
