import { CraftProduct, CollectionCategory } from '@/types';

// Zero hardcoded/mock/seed products on frontend. All product data is fetched exclusively from Supabase.
export const CRAFT_PRODUCTS: CraftProduct[] = [];

export const COLLECTION_CATEGORIES: CollectionCategory[] = [
  {
    id: 'german-silver',
    name: 'GERMAN SILVER',
    tagline: 'Hand-beaten artisanal German silver vessels, platters & heirloom objects',
    itemCount: 0,
    image: '/images/collection-german-silver.jpg',
    filterCategory: 'German Silver',
  },
  {
    id: 'marble',
    name: 'MARBLE',
    tagline: 'Pure Makrana & calcitic stone hand-sculpted centerpieces & plinths',
    itemCount: 0,
    image: '/images/collection-marble.jpg',
    filterCategory: 'Marble',
  },
  {
    id: 'fibre',
    name: 'FIBRE',
    tagline: 'Hand-formed architectural fiber vessels & tactile sculptural creations',
    itemCount: 0,
    image: '/images/collection-fibre.jpg',
    filterCategory: 'Fibre',
  },
  {
    id: 'brass-and-wood',
    name: 'BRASS AND WOOD',
    tagline: 'Hand-gouged seasoned timber, reclaimed teak joinery & cast brass accents',
    itemCount: 0,
    image: '/images/collection-brass-wood-box.jpg',
    filterCategory: 'Brass and Wood',
  },
];
