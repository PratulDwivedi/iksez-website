'use client';

import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button type="button" onClick={handleShare} className="blog-post__share">
      {copied ? <Check size={14} /> : <Share2 size={14} />}
      {copied ? 'Link copied!' : 'Share'}
    </button>
  );
}
