export type ProductCategory = 'STONE' | 'GERMAN SILVER' | 'ARTIFACTS' | 'COLLECTOR\'S EDITIONS';

export interface ProductDetailSection {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  macroCaption?: string;
}

export interface CraftObject {
  id: string;
  name: string;
  subtitle: string;
  category: ProductCategory;
  material: string;
  origin: string;
  dimensions: string;
  weight: string;
  craft: string;
  edition: string;
  leadTime: string;
  priceFormatted: string;
  priceNumeric: number;
  shortDescription: string;
  heroImage: string;
  galleryImages: string[];
  theMaterial: ProductDetailSection;
  theHand: ProductDetailSection;
  theDetail: ProductDetailSection;
  theStory: ProductDetailSection;
  conservationCare: string[];
  provenance: {
    quarryLocation: string;
    artisanGuild: string;
    yearCrafted: string;
    certificateNumber: string;
  };
}

export interface RajasthanLocation {
  id: string;
  name: string;
  coordinates: { x: number; y: number }; // percentage on SVG map
  tagline: string;
  quote: string;
  story: string;
  materials: string[];
  artisanLegacy: string;
  imageUrl: string;
  featuredArtifactName: string;
}

export interface CraftProcessStep {
  step: string;
  title: string;
  stageName: string;
  subtitle: string;
  description: string;
  artisanQuote: string;
  artisanRole: string;
  toolsUsed: string[];
  imageUrl: string;
  audioAtmosphere?: string;
}

export interface MaterialSpec {
  id: 'stone' | 'silver' | 'artifacts';
  name: string;
  subhead: string;
  heritageStory: string;
  tactileDescription: string;
  aestheticQualities: string[];
  originRegions: string[];
  textureType: 'sandstone' | 'silver' | 'patina';
  bgClass: string;
  heroImage: string;
}

export interface JournalArticle {
  id: string;
  title: string;
  category: string;
  readTime: string;
  date: string;
  excerpt: string;
  author: string;
  authorTitle: string;
  coverImage: string;
  contentParagraphs: string[];
  pullQuote: string;
  subheading: string;
  secondaryImage: string;
}

export interface AcquisitionItem {
  product: CraftObject;
  quantity: number;
  notes?: string;
}
