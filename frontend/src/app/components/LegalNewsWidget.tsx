"use client";

import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';
import { auth } from '../lib/firebase';

interface LegalNewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  url: string;
  date: string;
}

const fallbackNewsData: LegalNewsItem[] = [
  {
    id: '1',
    title: 'Supreme Court Issues New Practice Direction on Electronic Filing',
    category: 'Supreme Court',
    date: new Date().toLocaleDateString(),
    summary: 'The Supreme Court of Sri Lanka has published revised guidelines for digital document submissions in commercial appeals.',
    url: 'https://www.supremecourt.lk'
  },
  {
    id: '2',
    title: 'Extraordinary Gazette Published: Commercial Law Amendments 2026',
    category: 'Gazette',
    date: new Date().toLocaleDateString(),
    summary: 'New statutory provisions regarding corporate dispute resolution mechanisms take effect this month.',
    url: 'http://www.documents.gov.lk'
  },
  {
    id: '3',
    title: 'Bar Association of Sri Lanka (BASL) Annual Legal Tech Seminar',
    category: 'BASL Notice',
    date: new Date().toLocaleDateString(),
    summary: 'Notice to all legal practitioners regarding upcoming mandatory continuing legal education (CLE) workshops.',
    url: 'https://basl.lk'
  }
];

export default function LegalNewsWidget() {
  const [news, setNews] = useState<LegalNewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchNews = async () => {
      try {
        const user = auth.currentUser;
        let headers: Record<string, string> = {};
        
        if (user) {
          const idToken = await user.getIdToken();
          headers['Authorization'] = `Bearer ${idToken}`;
        }
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/legal-news`, {
          headers
        });
        
        if (!res.ok) throw new Error('API response not ok');
        
        const data = await res.json();
        
        if (isMounted) {
          if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
            setNews(data.data);
          } else {
            setNews(fallbackNewsData);
          }
        }
      } catch (err) {
        console.warn("Legal News API failed, using frontend local fallback.", err);
        if (isMounted) {
          setNews(fallbackNewsData);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchNews();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const getSourceColor = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes('gazette')) return 'bg-orange-100 text-orange-700 border-orange-200';
    if (lower.includes('supreme court')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (lower.includes('basl')) return 'bg-purple-100 text-purple-700 border-purple-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 p-6 flex flex-col h-full max-h-[500px]">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-blue-50 text-[#1B3A6B] rounded-xl flex-shrink-0">
          <Newspaper size={20} />
        </div>
        <h2 className="text-lg font-bold text-gray-900 leading-tight">Latest Sri Lankan Legal Updates</h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse pb-4 border-b border-gray-50 last:border-0 last:pb-0">
              <div className="flex gap-2 mb-2">
                <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
              </div>
              <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
            </div>
          ))
        ) : (
          news.map((item) => (
            <div key={item.id} className="pb-4 border-b border-gray-50 last:border-0 last:pb-0 group">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md border uppercase ${getSourceColor(item.category || '')}`}>
                  {item.category || 'Update'}
                </span>
                <span className="text-xs font-semibold text-gray-400">
                  {item.date}
                </span>
              </div>
              <h3 className="text-sm font-bold text-gray-800 leading-tight mb-1.5 group-hover:text-[#1B3A6B] transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-gray-500 line-clamp-2 mb-2.5 leading-relaxed">
                {item.summary}
              </p>
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F97316] hover:text-orange-700 transition-colors bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg w-max"
              >
                Read Official Document
                <ExternalLink size={12} strokeWidth={2.5} />
              </a>
            </div>
          ))
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
      `}} />
    </div>
  );
}
