export interface KnowledgeArticle {
  id: string;
  title: string;
  category: 'Understanding BIS' | 'Indian Standards' | 'Certification' | 'Testing' | 'Hallmarking' | 'Consumer Awareness' | 'Compliance Basics';
  description: string;
  readTime: string;
  author: string;
  publishedDate: string;
  tags: string[];
  keyTakeaways: string[];
  contentSections: {
    heading: string;
    body: string;
  }[];
}
