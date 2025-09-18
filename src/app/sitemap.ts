
import { MetadataRoute } from 'next';
import { getOpinions, getPublications } from '@/lib/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Replace with your actual domain
  const baseUrl = 'https://andrapost.com';

  // Get all dynamic content
  const opinions = await getOpinions();
  const publications = await getPublications();

  const opinionEntries: MetadataRoute.Sitemap = opinions.map(({ id }) => ({
    url: `${baseUrl}/opini/${id}`, // Assuming you will have detail pages like /opini/[id]
    lastModified: new Date(),
  }));
  
  const publicationEntries: MetadataRoute.Sitemap = publications.map(({ id }) => ({
    url: `${baseUrl}/publikasi/${id}`, // Assuming you will have detail pages like /publikasi/[id]
    lastModified: new Date(),
  }));
  
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/opini`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/publikasi`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ongoing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
     {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Note: For a real app, you would need to create detail pages for each content type.
  // For now, this structure assumes they might exist. If not, you can remove 'contentEntries'.
  return [
    ...staticPages,
    ...opinionEntries,
    ...publicationEntries,
  ];
}
