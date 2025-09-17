import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export type Tag = 'Repost' | 'Original' | 'Technology' | 'Government' | 'International' | 'Domestic' | 'Quantitative' | 'Qualitative';

export interface OpinionPost {
  id: string;
  title: string;
  tags: Tag[];
  postedOn: string;
  content: string;
  image: ImagePlaceholder;
}

export interface PublicationPost {
  id: string;
  title: string;
  tags: Tag[];
  publishedOn: string;
  status: 'public' | 'private';
  image: ImagePlaceholder;
  fileUrl: string;
  viewUrl: string;
  description: string;
}

export interface OngoingResearch {
  id: string;
  title: string;
  tags: Tag[];
  startedOn: Date;
  image: ImagePlaceholder;
}

const allImages = PlaceHolderImages;

export const opinions: OpinionPost[] = [
  {
    id: 'op1',
    title: 'The Future of Remote Work in the Tech Industry',
    tags: ['Original', 'Technology'],
    postedOn: '24 Juli 2024',
    content: 'The shift to remote work, accelerated by recent global events, is not a temporary trend but a fundamental change in the tech industry. This article explores the long-term implications, including impacts on productivity, innovation, and corporate culture. We will also delve into the tools and strategies companies are adopting to build successful distributed teams. The discussion will cover aspects from virtual collaboration platforms to maintaining employee engagement and mental well-being in a remote-first environment.',
    image: allImages.find(i => i.id === 'opinion1')!,
  },
  {
    id: 'op2',
    title: 'Data-Driven Policies: A Path to Better Governance',
    tags: ['Government', 'Quantitative'],
    postedOn: '15 Juli 2024',
    content: 'Modern governments have access to unprecedented amounts of data. This opinion piece argues for the systematic integration of data analytics into policymaking. By leveraging quantitative analysis, governments can create more effective, efficient, and equitable public services. We examine case studies where data has transformed policy outcomes, from public health to urban planning, and discuss the ethical considerations and challenges that must be addressed for responsible implementation.',
    image: allImages.find(i => i.id === 'opinion2')!,
  },
  {
    id: 'op3',
    title: 'Navigating Global Supply Chains in a Post-Pandemic World',
    tags: ['International', 'Domestic'],
    postedOn: '02 Juli 2024',
    content: 'The fragility of global supply chains was starkly exposed in recent years. This analysis discusses the shift towards more resilient and localized supply chain models. We explore the balance between domestic production and international trade, arguing that a hybrid approach is necessary for future economic stability. The piece also touches on the role of technology, such as blockchain and AI, in creating more transparent and agile supply networks.',
    image: allImages.find(i => i.id === 'opinion3')!,
  },
  {
    id: 'op4',
    title: 'Qualitative Research: Understanding the Human Element',
    tags: ['Qualitative', 'Original'],
    postedOn: '18 Juni 2024',
    content: 'In a world obsessed with big data, the value of qualitative research is often underestimated. This article champions the importance of understanding context, nuance, and the human stories behind the numbers. Through methods like interviews and ethnographic studies, qualitative research provides deep insights that quantitative data alone cannot capture. We discuss its critical role in fields from product design to social policy.',
    image: allImages.find(i => i.id === 'opinion4')!,
  },
  {
    id: 'op5',
    title: 'The Rise of AI in Creative Industries (Repost)',
    tags: ['Repost', 'Technology'],
    postedOn: '05 Juni 2024',
    content: 'This reposted article from a leading tech journal explores the transformative impact of artificial intelligence on creative fields. From generating music and art to writing scripts, AI is no longer just a tool but a creative partner. The piece examines the opportunities for innovation and the questions it raises about authorship, creativity, and the future role of human artists. It provides a balanced view of both the potential and the perils.',
    image: allImages.find(i => i.id === 'opinion5')!,
  },
  {
    id: 'op6',
    title: 'Urban Planning and the 15-Minute City',
    tags: ['Domestic', 'Government'],
    postedOn: '21 Mei 2024',
    content: 'The concept of the 15-minute city, where residents can access all their essential needs within a short walk or bike ride, is gaining traction worldwide. This opinion piece explores its potential to create more sustainable, equitable, and livable urban environments. We analyze the policy changes and infrastructure investments required to make this vision a reality in domestic contexts, and how it can improve public health and community cohesion.',
    image: allImages.find(i => i.id === 'opinion6')!,
  },
];

export const publications: PublicationPost[] = [
  {
    id: 'pub1',
    title: 'An Econometric Analysis of Post-Merger Market Power',
    tags: ['Quantitative', 'Technology'],
    publishedOn: 'Q2 2024',
    status: 'public',
    image: allImages.find(i => i.id === 'publication1')!,
    fileUrl: '#',
    viewUrl: '#',
    description: 'This paper presents a quantitative study on the effects of mergers and acquisitions on market concentration and consumer prices within the software industry. Using a dataset spanning ten years, we apply econometric models to assess changes in market power. The findings suggest a significant, though not universal, increase in pricing power for consolidated firms.'
  },
  {
    id: 'pub2',
    title: 'Special Report: Digital Transformation in the Public Sector',
    tags: ['Government', 'Domestic'],
    publishedOn: 'Q1 2024',
    status: 'private',
    image: allImages.find(i => i.id === 'publication2')!,
    fileUrl: '#',
    viewUrl: '#',
    description: 'A comprehensive report commissioned for a government agency, assessing the state of digital transformation across domestic public services. This publication requires special authorization to view due to sensitive information regarding national infrastructure and ongoing projects. It provides actionable recommendations for accelerating technology adoption and improving citizen services.'
  },
  {
    id: 'pub3',
    title: 'The Role of International Cooperation in Regulating AI',
    tags: ['International', 'Government'],
    publishedOn: 'Q4 2023',
    status: 'public',
    image: allImages.find(i => i.id === 'publication3')!,
    fileUrl: '#',
    viewUrl: '#',
    description: 'This article explores the challenges and opportunities for international cooperation in developing a global regulatory framework for artificial intelligence. It compares different national approaches and argues for a unified set of ethical guidelines to ensure the safe and equitable development of AI technologies worldwide.'
  },
  {
    id: 'pub4',
    title: 'A Qualitative Study on Developer Productivity in Hybrid Teams',
    tags: ['Qualitative', 'Technology'],
    publishedOn: 'Q3 2023',
    status: 'public',
    image: allImages.find(i => i.id === 'publication4')!,
    fileUrl: '#',
    viewUrl: '#',
    description: 'Through a series of in-depth interviews with software developers and managers, this study investigates the lived experiences of working in hybrid (part-remote, part-office) teams. Key themes identified include challenges in communication, the importance of intentional culture-building, and evolving definitions of productivity.'
  },
  {
    id: 'pub5',
    title: 'Trade Policy and its Impact on Domestic Manufacturing',
    tags: ['Domestic', 'Quantitative'],
    publishedOn: 'Q2 2023',
    status: 'private',
    image: allImages.find(i => i.id === 'publication5')!,
    fileUrl: '#',
    viewUrl: '#',
    description: 'An internal analysis for a private client on the effects of recent international trade policies on the domestic manufacturing sector. Access is restricted. The report uses firm-level data to model impacts on employment, investment, and output, providing a granular view of sector-specific vulnerabilities and opportunities.'
  },
  {
    id: 'pub6',
    title: 'Rethinking Originality in the Age of Generative Models',
    tags: ['Original', 'Technology'],
    publishedOn: 'Q1 2023',
    status: 'public',
    image: allImages.find(i => i.id === 'publication6')!,
    fileUrl: '#',
    viewUrl: '#',
    description: 'This philosophical and technical paper discusses the concept of "originality" in content creation, given the rise of powerful generative AI models. It proposes a new framework for evaluating creative work that accounts for human-AI collaboration, moving beyond traditional notions of sole authorship.'
  },
];

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

export const ongoingResearches: OngoingResearch[] = [
  {
    id: 'res1',
    title: 'Predictive Modeling for Urban Traffic Flow',
    tags: ['Quantitative', 'Technology'],
    startedOn: daysAgo(37),
    image: allImages.find(i => i.id === 'ongoing1')!,
  },
  {
    id: 'res2',
    title: 'The Impact of Telemedicine on Healthcare Accessibility',
    tags: ['Government', 'Domestic'],
    startedOn: daysAgo(82),
    image: allImages.find(i => i.id === 'ongoing2')!,
  },
  {
    id: 'res3',
    title: 'Cross-Cultural Study of Remote Work Etiquette',
    tags: ['International', 'Qualitative'],
    startedOn: daysAgo(12),
    image: allImages.find(i => i.id === 'ongoing3')!,
  },
  {
    id: 'res4',
    title: 'Developing a Framework for Ethical AI Audits',
    tags: ['Original', 'Technology'],
    startedOn: daysAgo(150),
    image: allImages.find(i => i.id === 'ongoing4')!,
  },
  {
    id: 'res5',
    title: 'Natural Language Processing for Legal Document Analysis',
    tags: ['Technology', 'Quantitative'],
    startedOn: daysAgo(55),
    image: allImages.find(i => i.id === 'ongoing5')!,
  },
  {
    id: 'res6',
    title: 'Assessing the Economic Viability of Green Hydrogen',
    tags: ['International', 'Government'],
    startedOn: daysAgo(98),
    image: allImages.find(i => i.id === 'ongoing6')!,
  },
];
