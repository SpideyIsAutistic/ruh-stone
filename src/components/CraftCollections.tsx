'use client';

import React from 'react';
import Image from 'next/image';
import { COLLECTION_CATEGORIES } from '@/data/craftData';
import { CraftCategory, CraftProduct } from '@/types';

interface CraftCollectionsProps {
  products?: CraftProduct[];
  onSelectCategory?: (category: CraftCategory) => void;
}

export default function CraftCollections({
  products: initialProducts,
  onSelectCategory,
}: CraftCollectionsProps) {
  const [internalProducts, setInternalProducts] = React.useState<CraftProduct[]>(
    initialProducts || []
  );

  React.useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setInternalProducts(initialProducts);
    } else {
      fetch('/api/products')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (Array.isArray(data)) {
            setInternalProducts(data);
          }
        })
        .catch(() => {});
    }
  }, [initialProducts]);

  const activeProducts =
    initialProducts && initialProducts.length > 0 ? initialProducts : internalProducts;

  const getCategoryCount = (categoryName: CraftCategory) => {
    return activeProducts.filter((p) => p.category === categoryName).length;
  };

  const handleCategoryClick = (category: CraftCategory) => {
    if (onSelectCategory) {
      onSelectCategory(category);
    }
    const shopEl = document.getElementById('shop');
    shopEl?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="collections" className="py-24 md:py-32 bg-[#FAF7F2] border-b border-[#E8E0D2]/70">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="mb-14 md:mb-20 flex flex-col md:flex-row md:items-end justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#7A746C] font-medium block mb-3">
              EXPLORE BY DISCIPLINE
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#23201D] font-light">
              Craft Collections
            </h2>
          </div>
          <p className="text-xs md:text-sm text-[#7A746C] max-w-sm mt-4 md:mt-0 font-light tracking-wide">
            Categorized by natural material, ancestral discipline, and domestic ritual.
          </p>
        </div>

        {/* Collections Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {COLLECTION_CATEGORIES.map((cat) => {
            const count = getCategoryCount(cat.filterCategory);
            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.filterCategory)}
                className="group cursor-pointer flex flex-col"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCategoryClick(cat.filterCategory);
                }}
                aria-label={`Explore ${cat.name}`}
              >
                {/* Category Image */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#ECE4D6] mb-4">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent group-hover:from-black/75 transition-colors duration-500" />

                  {/* Overlaid Title on Mobile/Hover */}
                  <div className="absolute bottom-4 left-4 right-4 text-[#FAF7F2]">
                    <span className="text-[9px] uppercase tracking-[0.25em] font-medium opacity-80 block">
                      {count} {count === 1 ? 'PIECE' : 'PIECES'}
                    </span>
                    <h3 className="font-serif text-lg text-[#FAF7F2] font-normal tracking-wider mt-0.5">
                      {cat.name}
                    </h3>
                  </div>
                </div>

                {/* Tagline */}
                <p className="text-[11px] text-[#7A746C] leading-snug font-light">
                  {cat.tagline}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
