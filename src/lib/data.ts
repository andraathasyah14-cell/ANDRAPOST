
'use server';
import 'server-only';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// --- FIREBASE ADMIN INITIALIZATION (SERVER-SIDE) ---
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
  title: string;
  tags: Tag[];
  imageUrl: string;
}

// Specific content types extending the base
export interface OpinionContent extends ContentBase {
  postedOn: string; // "YYYY-MM-DD"
  content: string;
  author: string;
}

export interface PublicationContent extends ContentBase {
  publishedOn: string; // "Q2 2024", etc.
  status: 'public' | 'private';
  fileUrl: string;
  description: string;
  author: string;
}

export interface OngoingContent extends ContentBase {
  startedOn: Date;
  description: string;
  author: string;
}


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
      await db.collection('profile').doc('main').set(defaultProfile);
      return defaultProfile;
    }

    return profileDoc.data() as Profile;

  } catch (error) {
    console.error('Error fetching profile from Firestore, returning default profile:', error);
    return defaultProfile;
  }
}

async function fetchCollection<T extends ContentBase>(collectionName: string): Promise<T[]> {
    try {
        const snapshot = await db.collection(collectionName).orderBy('createdAt', 'desc').get();
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => {
            const data = doc.data();
            const baseData = {
                id: doc.id,
                title: data.title || 'Untitled',
                tags: data.tags || [],
                imageUrl: data.imageUrl || "https://picsum.photos/seed/default/600/400",
                author: data.author || 'Anonymous'
            };
             if (collectionName === 'ongoing') {
                return {
                    ...baseData,
                    description: data.description || '',
                    startedOn: data.startedOn?.toDate ? data.startedOn.toDate() : new Date(),
                } as T;
            } else if (collectionName === 'publications') {
                 return {
                    ...baseData,
                    description: data.description || '',
                    publishedOn: data.publishedOn || 'N/A',
                    status: data.status || 'private',
                    fileUrl: data.fileUrl || '#'
                } as T;
            } else { // opinions
                 return {
                    ...baseData,
                    content: data.content || '',
                    postedOn: data.postedOn || 'N/A'
                } as T;
            }
        });
    } catch (error) {
        console.error(`Error fetching ${collectionName} from Firestore, returning empty array:`, error);
        return [];
    }
}


export async function getOpinions(): Promise<OpinionContent[]> {
    return fetchCollection<OpinionContent>('opinions');
}

export async function getPublications(): Promise<PublicationContent[]> {
    return fetchCollection<PublicationContent>('publications');
}

export async function getOngoingResearches(): Promise<OngoingContent[]> {
    return fetchCollection<OngoingContent>('ongoing');
}


/**
 * Fetches all necessary data for the main page in a single operation.
 */
export async function getHomePageData() {
    const [profile, opinions, publications, ongoingResearches] = await Promise.all([
      getProfile(),
      getOpinions(),
      getPublications(),
      getOngoingResearches(),
    ]);

    return {
      profile,
      opinions,
      publications,
      ongoingResearches,
    };
}
