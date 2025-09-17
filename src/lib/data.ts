import opinionsData from '@/content/opinions.json';
import publicationsData from '@/content/publications.json';
import ongoingData from '@/content/ongoing.json';
import toolsData from '@/content/tools.json';
import profileData from '@/content/profile.json';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { ImagePlaceholder } from './placeholder-images';

export type Tag =
  | 'Repost'
  | 'Original'
  | 'Technology'
  | 'Government'
  | 'International'
  | 'Domestic'
  | 'Quantitative'
  | 'Qualitative';

export interface OpinionPost {
  id: string;
  title: string;
  author: string;
  tags: Tag[];
  postedOn: string;
  content: string;
  image: ImagePlaceholder;
}

export interface PublicationPost {
  id:string;
  title: string;
  author: string;
  tags: Tag[];
  publishedOn: string;
  status: 'public' | 'private';
  fileUrl: string;
  viewUrl: string;
  description: string;
  image: ImagePlaceholder;
}

export interface OngoingResearch {
  id: string;
  title: string;
  author: string;
  tags: Tag[];
  startedOn: Date;
  description: string;
  image: ImagePlaceholder;
}

export interface Tool {
  name: string;
  icon: string;
}

export interface Profile {
  name: string;
  description: string;
}

const allImages = PlaceHolderImages;

const mapDataWithImage = (data: any[]) => data.map(item => {
    const image = allImages.find(i => i.id === item.image);
    if (!image) {
        console.warn(`Image with id "${item.image}" not found. Assigning a default placeholder.`);
        // Assign a default placeholder if not found, to prevent crashes
        const defaultImage = allImages[0] || { id: 'default', description: 'Default Image', imageUrl: 'https://placehold.co/600x400', imageHint: 'placeholder' };
        return { ...item, image: defaultImage };
    }
    return { ...item, image };
});

const mapOngoingData = (data: any[]) => data.map(item => {
    const image = allImages.find(i => i.id === item.image);
    const mappedItem = {
      ...item,
      image: image || allImages[0], // fallback to default
      startedOn: new Date(item.startedOn),
    };
    return mappedItem;
});


export const opinions: OpinionPost[] = mapDataWithImage(opinionsData);
export const publications: PublicationPost[] = mapDataWithImage(publicationsData);
export const ongoingResearches: OngoingResearch[] = mapOngoingData(ongoingData);
export const tools: Tool[] = toolsData;
export const profile: Profile = profileData;
