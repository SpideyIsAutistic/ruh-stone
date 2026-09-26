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
    <section id="journal" className="relative py-28 md:py-36 bg-[#0c0b0a] text-[#f4ecdf] overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="max-w-4xl mb-16">
          <div className="flex items-center space-x-3 mb-6">
            <BookOpen className="w-4 h-4 text-[#bba172]" />
            <span className="text-[10px] font-sans tracking-[0.4em] uppercase text-[#bba172] font-semibold">
              THE RUH ARCHIVAL JOURNAL
            </span>
          </div>

          <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl tracking-[0.06em] text-[#faf6f0] font-light">
            VOICES OF PERMANENCE: <br />
            <span className="italic text-[#d4b584]">THE MONOGRAPHS.</span>
          </h2>

          <p className="font-serif italic text-lg sm:text-xl text-[#c2a37f] mt-4">
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
              className={`group cursor-pointer border border-[#2c2722] bg-[#141311] p-6 sm:p-8 flex flex-col justify-between transition-all duration-500 hover:border-[#bba172]/80 hover:shadow-[0_16px_48px_rgba(0,0,0,0.7)] ${
                idx === 0 ? 'md:col-span-2 md:grid md:grid-cols-12 md:gap-10 md:p-10' : ''
              }`}
            >
              {/* Image Container */}
              <div
                className={`relative aspect-[16/10] w-full overflow-hidden border border-[#2c2722] bg-[#0c0b0a] ${
                  idx === 0 ? 'md:col-span-7' : 'mb-6'
                }`}
              >
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center filter brightness-90 contrast-105 transition-transform duration-1000 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0d0c] via-transparent to-transparent opacity-60" />
                <span className="absolute top-4 left-4 z-10 px-2.5 py-1 text-[9px] uppercase font-sans tracking-[0.2em] bg-[#0c0b0a]/80 text-[#d4b584] border border-[#2c2722]">
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
                  <div className="flex items-center space-x-3 text-[10px] uppercase font-sans tracking-[0.25em] text-[#835c40] mb-3">
                    <span>{article.date}</span>
                    <span>·</span>
                    <span>{article.readTime}</span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl text-[#faf6f0] tracking-[0.06em] font-light group-hover:text-[#d4b584] transition-colors duration-300">
                    {article.title}
                  </h3>

                  <p className="font-serif italic text-sm text-[#c2a37f] mt-2 line-clamp-1">
                    {article.subheading}
                  </p>

                  <p className="text-xs sm:text-sm font-sans text-[#a78056] font-light leading-relaxed mt-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#26221d] flex items-center justify-between">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-[#835c40]">
                    BY {article.author}
                  </span>
                  <div className="flex items-center space-x-1 text-xs font-sans uppercase tracking-[0.2em] text-[#d4b584] group-hover:text-[#faf6f0] transition-colors">
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
