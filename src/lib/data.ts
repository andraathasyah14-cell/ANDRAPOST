'use server';
import 'server-only';
import { Timestamp } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';

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

// --- Helper Functions ---

async function getDocumentData<T>(collectionName: string, docId: string): Promise<T | null> {
  try {
    const db = getFirestore();
    const docRef = db.collection(collectionName).doc(docId);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      return docSnap.data() as T;
    } else {
      console.warn(`Document ${docId} not found in ${collectionName}. Returning default.`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching document ${docId} from ${collectionName}:`, error);
    return null;
  }
}

// --- Main Data Fetching Functions ---

export async function getProfile(): Promise<Profile> {
    const profileData = await getDocumentData<Profile>('profile', 'user_profile');
    // Provide a sensible default if the profile document doesn't exist.
    return profileData || { 
        name: "Nama Belum Diatur", 
        description: "Deskripsi profil belum ditambahkan. Silakan edit di halaman admin.",
        tools: [] 
    };
}

export async function getAllContent(): Promise<ContentPost[]> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('content').get();
    if (snapshot.empty) {
      return [];
    }
    
    const data: ContentPost[] = snapshot.docs.map(doc => {
      const docData = doc.data();
      // Convert Firestore Timestamps to JS Dates for ongoing research
      if (docData.contentType === 'ongoing' && docData.startedOn instanceof Timestamp) {
        docData.startedOn = docData.startedOn.toDate();
      }
      return { ...docData, id: doc.id } as ContentPost;
    });

    // Sort all content by date in descending order (newest first)
    return data.sort((a, b) => {
        const dateA = a.contentType === 'ongoing' ? a.startedOn.getTime() : new Date(a.postedOn || a.publishedOn).getTime();
        const dateB = b.contentType === 'ongoing' ? b.startedOn.getTime() : new Date(b.postedOn || b.publishedOn).getTime();
        // Handle invalid dates
        if (isNaN(dateA)) return 1;
        if (isNaN(dateB)) return -1;
        return dateB - dateA;
    });
  } catch (error) {
    console.error(`Error fetching collection content:`, error);
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
