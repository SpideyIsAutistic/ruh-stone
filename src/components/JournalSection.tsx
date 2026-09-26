'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { JOURNAL_ARTICLES } from '@/data/journalArticles';
import { JournalArticle } from '@/types';
import JournalArticleModal from './JournalArticleModal';
import ArchitecturalDivider from './ArchitecturalDivider';
import { BookOpen, ArrowUpRight } from 'lucide-react';

export default function JournalSection() {
  const [selectedArticle, setSelectedArticle] = useState<JournalArticle | null>(null);

  return (
    <section id="journal" className="relative py-28 md:py-36 bg-[#F2EBDD] text-[#241A14] overflow-hidden plaster-texture">
      <div className="relative max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="max-w-4xl mb-16">
          <div className="flex items-center space-x-3 mb-6">
            <BookOpen className="w-4 h-4 text-[#6E3027]" />
            <span className="text-[10px] font-sans tracking-[0.4em] uppercase text-[#6E3027] font-semibold">
              THE RUH ARCHIVAL JOURNAL
            </span>
          </div>

          <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl tracking-[0.06em] text-[#241A14] font-light">
            VOICES OF PERMANENCE: <br />
            <span className="italic text-[#9B5540]">THE MONOGRAPHS.</span>
          </h2>

          <p className="font-serif italic text-lg sm:text-xl text-[#6E3027] mt-4">
            Curated essays, geological field studies, and oral archives from the desert workshops.
          </p>
        </div>

        {/* Editorial Journal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {JOURNAL_ARTICLES.map((article, idx) => (
            <article
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              data-cursor="pointer"
              className={`group cursor-pointer border border-[#D8C5A5] bg-[#F9F6F0] p-6 sm:p-8 flex flex-col justify-between transition-all duration-400 hover:border-[#6E3027] hover:shadow-[0_16px_40px_rgba(185,139,98,0.2)] ${
                idx === 0 ? 'md:col-span-2 md:grid md:grid-cols-12 md:gap-10 md:p-10' : ''
              }`}
            >
              {/* Image Container */}
              <div
                className={`relative aspect-[16/10] w-full overflow-hidden border border-[#D8C5A5] bg-[#E7DBCA] ${
                  idx === 0 ? 'md:col-span-7' : 'mb-6'
                }`}
              >
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center filter contrast-105 transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <span className="absolute top-4 left-4 z-10 px-2.5 py-1 text-[9px] uppercase font-sans tracking-[0.2em] bg-[#F2EBDD]/90 text-[#6E3027] border border-[#D8C5A5] font-semibold">
                  {article.category}
                </span>
              </div>

              {/* Text Container */}
              <div
                className={`flex flex-col justify-between ${
                  idx === 0 ? 'md:col-span-5 md:py-2' : ''
                }`}
              >
                <div>
                  <div className="flex items-center space-x-3 text-[10px] uppercase font-sans tracking-[0.25em] text-[#8C613C] mb-3 font-semibold">
                    <span>{article.date}</span>
                    <span>·</span>
                    <span>{article.readTime}</span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl text-[#241A14] tracking-[0.06em] font-light group-hover:text-[#6E3027] transition-colors duration-300">
                    {article.title}
                  </h3>

                  <p className="font-serif italic text-sm text-[#9B5540] mt-2 line-clamp-1">
                    {article.subheading}
                  </p>

                  <p className="text-xs sm:text-sm font-sans text-[#524035] font-light leading-relaxed mt-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#D8C5A5] flex items-center justify-between">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-[#8C613C] font-semibold">
                    BY {article.author}
                  </span>
                  <div className="flex items-center space-x-1 text-xs font-sans uppercase tracking-[0.2em] text-[#6E3027] group-hover:text-[#241A14] transition-colors font-medium">
                    <span>READ MONOGRAPH</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Full Monograph Modal Reader */}
      <JournalArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />

      <ArchitecturalDivider variant="jaali" className="mt-20" />
    </section>
  );
}
