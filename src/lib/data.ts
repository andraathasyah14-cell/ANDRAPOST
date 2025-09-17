
'use server';
import 'server-only';
import { initializeFirebaseAdmin } from '@/lib/firebase-admin';

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
  id?: string; // Firestore uses string IDs
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
  id: string; // Firestore uses string IDs
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
  const firebase = initializeFirebaseAdmin();
  if (!firebase || !firebase.db) {
    console.warn('Firestore is not available, returning default profile.');
    return defaultProfile;
  }
  try {
    const profileDoc = await firebase.db.collection('profile').doc('main').get();
    
    if (!profileDoc.exists) {
      console.warn("Profile document not found in Firestore, returning default.");
      // Optional: Create the default profile if it doesn't exist
      await firebase.db.collection('profile').doc('main').set(defaultProfile);
      return defaultProfile;
    }

    return profileDoc.data() as Profile;

  } catch (error) {
    console.error('Error fetching profile from Firestore, returning default profile:', error);
    return defaultProfile;
  }
}

export async function getAllContent(): Promise<ContentPost[]> {
  const firebase = initializeFirebaseAdmin();
  if (!firebase || !firebase.db) {
    console.warn('Firestore is not available, returning empty content array.');
    return [];
  }
  try {
    const contentSnapshot = await firebase.db.collection('content').get();

    if (contentSnapshot.empty) {
      return [];
    }

    return contentSnapshot.docs.map(doc => {
      const data = doc.data();
      const base = {
        id: doc.id,
        contentType: data.contentType,
        title: data.title,
        tags: data.tags || [],
        image: { imageUrl: data.imageUrl },
      };

      if (data.contentType === 'opinion') {
        return {
          ...base,
          postedOn: data.postedOn,
          content: data.content
        } as OpinionContent;
      }
      if (data.contentType === 'publication') {
        return {
          ...base,
          publishedOn: data.publishedOn,
          status: data.status,
          fileUrl: data.fileUrl,
          viewUrl: data.viewUrl,
          description: data.description
        } as PublicationContent;
      }
      if (data.contentType === 'ongoing') {
        return {
          ...base,
          // Firestore Timestamps need to be converted to JS Dates
          startedOn: (data.startedOn.toDate ? data.startedOn.toDate() : new Date(data.startedOn)),
          description: data.description
        } as OngoingContent;
      }
      return null;
    }).filter(Boolean) as ContentPost[];

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

    const opinions = allContent.filter(c => c.contentType === 'opinion').sort((a,b) => new Date((b as OpinionContent).postedOn).getTime() - new Date((a as OpinionContent).postedOn).getTime()) as OpinionContent[];
    const publications = allContent.filter(c => c.contentType === 'publication') as PublicationContent[];
    const ongoingResearches = allContent.filter(c => c.contentType === 'ongoing').sort((a,b) => (b as OngoingContent).startedOn.getTime() - (a as OngoingContent).startedOn.getTime()) as OngoingContent[];

    return {
      profile,
      opinions,
      publications,
      ongoingResearches,
    };
}
