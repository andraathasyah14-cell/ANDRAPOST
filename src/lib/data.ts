import opinionsData from '@/content/opinions.json';
import publicationsData from '@/content/publications.json';
import ongoingData from '@/content/ongoing.json';
import toolsData from '@/content/tools.json';
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

const allImages = PlaceHolderImages;

// The issue is that the image objects in your JSON data files are just strings, 
// but the application expects them to be objects with an id, description, imageUrl, and imageHint.
const mapData = (item: any) => ({
  ...item,
  image: allImages.find(i => i.id === item.image)!,
  ...(item.startedOn && { startedOn: new Date(item.startedOn) }),
});

export const opinions: OpinionPost[] = opinionsData.map(mapData);
export const publications: PublicationPost[] = publicationsData.map(mapData);
export const ongoingResearches: OngoingResearch[] = ongoingData.map(mapData);
export const tools: Tool[] = toolsData;
