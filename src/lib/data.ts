
'use server';
import 'server-only';
import { db } from '@/lib/mysql';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

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
  id?: number;
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
  id: number;
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
    { name: "Stata", imageUrl: "/tool-logos/stata.svg" },
    { name: "MySQL", imageUrl: "/tool-logos/mysql.svg" },
    { name: "Jupyter", imageUrl: "/tool-logos/jupyter.svg" },
    { name: "Anaconda", imageUrl: "/tool-logos/anaconda.svg" },
    { name: "AWS", imageUrl: "/tool-logos/aws.svg" },
  ],
  imageUrl: "https://picsum.photos/seed/profile/400/400",
};


// --- Main Data Fetching Functions ---

export async function getProfile(): Promise<Profile> {
  if (!db) {
    console.warn('MySQL is not available, returning default profile.');
    return defaultProfile;
  }
  try {
    const [profileRows] = await db.query<RowDataPacket[]>(
        `SELECT name, description, image_url as imageUrl FROM profile WHERE id = 1`
    );
    
    if (profileRows.length === 0) {
      console.warn("Profile not found in database, returning default.");
      return defaultProfile;
    }

    const [toolRows] = await db.query<RowDataPacket[]>(
        `SELECT name, image_url as imageUrl FROM tools`
    );

    return {
        name: profileRows[0].name,
        description: profileRows[0].description,
        imageUrl: profileRows[0].imageUrl,
        tools: toolRows as Tool[],
    };
  } catch (error) {
    console.error('Error fetching profile from MySQL, returning default profile:', error);
    return defaultProfile;
  }
}

export async function getAllContent(): Promise<ContentPost[]> {
  if (!db) {
    console.warn('MySQL is not available, returning empty content array.');
    return [];
  }
  try {
    const [rows] = await db.query<RowDataPacket[]>(`
      SELECT 
        id, 
        content_type as contentType, 
        title, 
        tags, 
        image_url as imageUrl,
        posted_on as postedOn,
        content,
        published_on as publishedOn,
        status,
        file_url as fileUrl,
        view_url as viewUrl,
        description,
        started_on as startedOn
      FROM content
    `);

    return rows.map(row => {
        const base = {
            id: row.id,
            contentType: row.contentType,
            title: row.title,
            tags: JSON.parse(row.tags), // Assuming tags are stored as a JSON string array
            image: { imageUrl: row.imageUrl },
        };
        if (row.contentType === 'opinion') {
            return {
                ...base,
                postedOn: row.postedOn,
                content: row.content
            } as OpinionContent;
        }
        if (row.contentType === 'publication') {
            return {
                ...base,
                publishedOn: row.publishedOn,
                status: row.status,
                fileUrl: row.fileUrl,
                viewUrl: row.viewUrl,
                description: row.description
            } as PublicationContent;
        }
        if (row.contentType === 'ongoing') {
            return {
                ...base,
                startedOn: new Date(row.startedOn),
                description: row.description
            } as OngoingContent;
        }
        return null;
    }).filter(Boolean) as ContentPost[];

  } catch (error) {
      console.error("Error fetching all content from MySQL, returning empty array:", error);
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
