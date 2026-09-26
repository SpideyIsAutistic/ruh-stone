'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { JournalArticle } from '@/types';
import { X, Clock, Calendar, Bookmark, Share2 } from 'lucide-react';

interface JournalArticleModalProps {
  article: JournalArticle | null;
  onClose: () => void;
}

export default function JournalArticleModal({
  article,
  onClose,
}: JournalArticleModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (article) {
      if (!dialog.open) {
        dialog.showModal();
        document.body.style.overflow = 'hidden';
      }
    } else {
      if (dialog.open) {
        dialog.close();
        document.body.style.overflow = '';
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [article]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const rect = dialog.getBoundingClientRect();
    const isInside =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width;
    if (!isInside) {
      onClose();
    }
  };

  if (!article) return null;

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onCancel={onClose}
      className="fixed inset-0 m-auto z-50 w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#0c0b0a] text-[#f4ecdf] border border-[#332d26] p-0 shadow-[0_24px_80px_rgba(0,0,0,0.95)] backdrop:bg-[#060504]/90 backdrop:backdrop-blur-md rounded-sm focus:outline-none"
    >
      {/* Sticky Bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-6 md:px-10 py-5 bg-[#0e0d0c]/95 backdrop-blur-md border-b border-[#2c2722]">
        <div className="flex items-center space-x-3 text-[10px] uppercase font-sans tracking-[0.3em] text-[#bba172]">
          <Bookmark className="w-3.5 h-3.5" />
          <span>RUH MONOGRAPHS · {article.category}</span>
        </div>

        <button
          onClick={onClose}
          data-cursor="pointer"
          aria-label="Close article modal"
          className="p-2 text-[#c2a37f] hover:text-[#faf6f0] hover:bg-[#1a1815] transition-colors rounded-sm"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Article Content */}
      <article className="px-6 md:px-14 py-10 md:py-16 space-y-12 max-w-3xl mx-auto">
        {/* Header Metadata */}
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center space-x-4 text-[10px] uppercase font-sans tracking-[0.25em] text-[#a17652]">
            <span className="flex items-center space-x-1.5">
              <Calendar className="w-3 h-3 text-[#d4b584]" />
              <span>{article.date}</span>
            </span>
            <span>·</span>
            <span className="flex items-center space-x-1.5">
              <Clock className="w-3 h-3 text-[#d4b584]" />
              <span>{article.readTime}</span>
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl text-[#faf6f0] tracking-[0.06em] font-light leading-tight">
            {article.title}
          </h1>

          <p className="font-serif italic text-lg sm:text-xl text-[#d4b584]">
            {article.subheading}
          </p>

          <div className="pt-2 text-xs font-sans text-[#835c40] tracking-[0.2em] uppercase">
            BY {article.author} · {article.authorTitle}
          </div>
        </div>

        {/* Hero Article Image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden border border-[#332d26] bg-[#141311]">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            sizes="(max-width: 1024px) 100vw, 80vw"
            className="object-cover object-center filter brightness-95"
          />
        </div>

        {/* Pull Quote */}
        <div className="py-6 border-y border-[#2c2722] text-center px-4">
          <blockquote className="font-serif italic text-2xl sm:text-3xl text-[#d4b584] leading-relaxed">
            "{article.pullQuote}"
          </blockquote>
        </div>

        {/* Body Text Paragraphs */}
        <div className="space-y-6 text-base font-sans text-[#c2a37f] font-light leading-relaxed">
          {article.contentParagraphs.map((para, idx) => (
            <p key={idx} className={idx === 0 ? 'first-letter:font-serif first-letter:text-5xl first-letter:text-[#d4b584] first-letter:float-left first-letter:mr-3 first-letter:leading-none' : ''}>
              {para}
            </p>
          ))}
        </div>

        {/* Secondary Editorial Image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden border border-[#332d26] bg-[#141311]">
          <Image
            src={article.secondaryImage}
            alt="Secondary craftsmanship archival capture"
            fill
            sizes="(max-width: 1024px) 100vw, 80vw"
            className="object-cover object-center filter brightness-95"
          />
        </div>

        {/* Article Footer & Author Signature */}
        <div className="pt-8 border-t border-[#2c2722] flex items-center justify-between text-xs text-[#a17652]">
          <div>
            <span className="font-serif text-[#faf6f0] text-sm block">{article.author}</span>
            <span className="text-[10px] tracking-[0.15em] text-[#835c40] uppercase">{article.authorTitle}</span>
          </div>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: article.title,
                  url: window.location.href,
                }).catch(() => {});
              }
            }}
            data-cursor="pointer"
            className="flex items-center space-x-2 text-[10px] font-sans tracking-[0.2em] uppercase text-[#d4b584] hover:text-[#faf6f0] p-2"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>SHARE MONOGRAPH</span>
          </button>
        </div>
      </article>
    </dialog>
  );
}
