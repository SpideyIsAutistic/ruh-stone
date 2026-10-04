'use client';

import React, { useState } from 'react';
import { ChevronDown, Mail, MessageSquare, ShieldCheck, Truck, Sparkles, HelpCircle } from 'lucide-react';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string | React.ReactNode;
}

const FAQS: FAQItem[] = [
  {
    id: 'handmade-provenance',
    category: 'Craft & Provenance',
    question: 'Are all RUH STONE pieces genuinely handcrafted?',
    answer:
      'Yes, without exception. Every piece in our catalogue is individually shaped, hand-chiselled, cast, or hand-burnished by hereditary master artisans across historical craft clusters in Jaipur, Moradabad, and regional Indian guilds. We reject high-speed mechanization. Natural variations in stone veining, hand-chisel marks, and metallic lustre are intentional hallmarks of genuine human craft.',
  },
  {
    id: 'materials-finishes',
    category: 'Craft & Provenance',
    question: 'What materials and finishes do you work with?',
    answer:
      'We curate noble, living materials: heirloom German silver alloys, pure Makrana calcitic marble, Thar desert sandstone, architectural natural mineral fiber, and seasoned teak and shisham hardwoods. All surfaces receive organic, hand-burnished finishes that breathe and develop a rich, authentic patina over years of domestic ritual.',
  },
  {
    id: 'white-glove-shipping',
    category: 'Shipping & Delivery',
    question: 'How does complimentary shipping and fragile transit work?',
    answer:
      'We offer complimentary insured white-glove shipping on every order across India. Because our pieces are solid stone, metal, and natural fiber, each item is packed in custom impact-cushioned multi-layer enclosures engineered for zero transit vibration. Real-time tracking with SMS and email dispatch updates is provided through our national logistics partners upon shipment.',
  },
  {
    id: 'bespoke-commissions',
    category: 'Custom & Gifting',
    question: 'Can I commission a custom size, monogram, or bespoke piece?',
    answer: (
      <span>
        Yes. Our artisan guilds welcome bespoke commissions for private collectors, architectural residences, luxury hospitality, and wedding gift registries. Please reach out to our concierge at{' '}
        <a
          href="mailto:support@ruhstone.com"
          className="text-[#23201D] font-medium underline underline-offset-4 hover:text-[#AA9B87] transition-colors"
        >
          support@ruhstone.com
        </a>{' '}
        or use the Atelier Inquiry form with your dimensional preferences and timeline.
      </span>
    ),
  },
  {
    id: 'care-and-maintenance',
    category: 'Care & Maintenance',
    question: 'How should I care for my German silver and natural stone objects?',
    answer: (
      <div className="space-y-2">
        <p>
          <strong className="font-medium text-[#23201D]">German Silver:</strong> Dust gently with a soft microfibre cloth. Avoid acidic chemicals, abrasive powders, or standing water. A gentle dry buff restores its quiet silver sheen.
        </p>
        <p>
          <strong className="font-medium text-[#23201D]">Natural Marble & Sandstone:</strong> Wipe with a clean, slightly damp lint-free cloth. Do not leave acidic liquids (vinegar, lemon, wine) on natural stone surfaces.
        </p>
        <p>
          <strong className="font-medium text-[#23201D]">Timber & Brass:</strong> Keep away from prolonged high-moisture areas. Nourish natural timber periodically with raw beeswax balm.
        </p>
      </div>
    ),
  },
  {
    id: 'returns-and-breakage',
    category: 'Orders & Policies',
    question: 'What is your return and transit protection policy?',
    answer: (
      <span>
        We accept returns within 14 days of delivery for all standard catalogue pieces returned unused in their original protective packaging. In the rare event of transit damage, notify our concierge within 48 hours of delivery at{' '}
        <a
          href="mailto:support@ruhstone.com"
          className="text-[#23201D] font-medium underline underline-offset-4 hover:text-[#AA9B87] transition-colors"
        >
          support@ruhstone.com
        </a>{' '}
        with photographs of the packaging, and our team will arrange an expedited replacement or full reimbursement.
      </span>
    ),
  },
  {
    id: 'payment-security',
    category: 'Orders & Policies',
    question: 'Which payment methods are accepted and is checkout secure?',
    answer:
      'We accept all major payment methods processed via Razorpay with 256-bit bank-grade encryption: UPI (Google Pay, PhonePe, Paytm, BHIM), all major Credit and Debit Cards (Visa, Mastercard, RuPay, American Express), Net Banking across 50+ banks, and cardless EMI options.',
  },
  {
    id: 'contact-support',
    category: 'Support Concierge',
    question: 'How can I connect with RUH STONE support?',
    answer: (
      <span>
        Our client support desk is available Monday through Saturday (9:00 AM – 7:00 PM IST). You can email us directly at{' '}
        <a
          href="mailto:support@ruhstone.com"
          className="text-[#23201D] font-semibold underline underline-offset-4 hover:text-[#AA9B87] transition-colors"
        >
          support@ruhstone.com
        </a>
        , message our verified Instagram handle{' '}
        <a
          href="https://instagram.com/ruhstonee"
          target="_blank"
          rel="noreferrer"
          className="text-[#23201D] font-medium underline underline-offset-4 hover:text-[#AA9B87] transition-colors"
        >
          @ruhstonee
        </a>
        , or open the Atelier Inquiry window on our website.
      </span>
    ),
  },
];

interface FAQSectionProps {
  onOpenContact?: () => void;
  className?: string;
}

export default function FAQSection({ onOpenContact, className = '' }: FAQSectionProps) {
  const [openId, setOpenId] = useState<string | null>('handmade-provenance');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Craft & Provenance', 'Shipping & Delivery', 'Care & Maintenance', 'Orders & Policies', 'Custom & Gifting'];

  const filteredFaqs =
    activeCategory === 'All'
      ? FAQS
      : FAQS.filter((item) => item.category === activeCategory);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className={`py-24 md:py-36 bg-[#FAF7F2] border-b border-[#E8E0D2]/70 ${className}`}>
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 md:mb-18">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#7A746C] font-medium block mb-3">
            ATELIER INQUIRIES & CLIENT CARE
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#23201D] font-light tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs md:text-sm text-[#7A746C] font-light mt-4 leading-relaxed">
            Essential information regarding artisanal provenance, noble materials, fragile white-glove transport, and bespoke commissions. Reach us directly at{' '}
            <a
              href="mailto:support@ruhstone.com"
              className="text-[#23201D] font-medium underline underline-offset-4 hover:text-[#AA9B87] transition-colors"
            >
              support@ruhstone.com
            </a>
            .
          </p>

          {/* Minimal Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-8">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`text-[10px] sm:text-[11px] font-sans tracking-[0.2em] uppercase px-3 py-1.5 transition-all duration-200 cursor-pointer ${
                  activeCategory === cat
                    ? 'text-[#23201D] font-semibold border-b border-[#23201D]'
                    : 'text-[#7A746C] hover:text-[#23201D]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion List */}
        <div className="max-w-3xl mx-auto space-y-3.5">
          {filteredFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`border transition-colors duration-200 ${
                  isOpen ? 'border-[#23201D]/40 bg-[#F4EFE6]/60' : 'border-[#E8E0D2] bg-[#FAF7F2] hover:border-[#D1C2AC]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full text-left py-5 px-6 sm:px-8 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                >
                  <div className="flex flex-col pr-4">
                    <span className="text-[9px] uppercase tracking-[0.25em] text-[#7A746C] font-medium mb-1">
                      {faq.category}
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl text-[#23201D] font-normal leading-snug">
                      {faq.question}
                    </h3>
                  </div>
                  <div
                    className={`w-7 h-7 shrink-0 rounded-full border border-[#D1C2AC] flex items-center justify-center transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-[#23201D] text-[#FAF7F2] border-[#23201D]' : 'text-[#23201D]'
                    }`}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 sm:px-8 pb-6 pt-1 text-xs md:text-sm text-[#7A746C] leading-relaxed font-light border-t border-[#E8E0D2]/50 animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Dedicated Support Card */}
        <div className="max-w-3xl mx-auto mt-16 p-8 sm:p-10 bg-[#F4EFE6] border border-[#E8E0D2] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-md">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#7A746C] font-semibold block">
              STILL HAVE QUESTIONS?
            </span>
            <h4 className="font-serif text-2xl text-[#23201D] font-light">
              Speak Directly with Our Concierge
            </h4>
            <p className="text-xs text-[#7A746C] font-light leading-relaxed">
              For bespoke artisan dimensions, custom gifting, or delivery assistance, our team is at your service.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
            <a
              href="mailto:support@ruhstone.com"
              className="inline-flex items-center justify-center space-x-2 bg-[#23201D] text-[#FAF7F2] text-[10px] font-sans tracking-[0.22em] uppercase px-5 py-3 font-medium hover:bg-[#3A3027] transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>EMAIL SUPPORT</span>
            </a>

            {onOpenContact && (
              <button
                type="button"
                onClick={onOpenContact}
                className="inline-flex items-center justify-center space-x-2 border border-[#23201D] text-[#23201D] text-[10px] font-sans tracking-[0.22em] uppercase px-5 py-3 font-medium hover:bg-[#23201D] hover:text-[#FAF7F2] transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>INQUIRE NOW</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
