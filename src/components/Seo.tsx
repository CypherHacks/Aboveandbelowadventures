// src/components/Seo.tsx
import { Helmet } from 'react-helmet-async';

type Json = Record<string, any>;
type Props = {
  title: string;
  description?: string;
  canonicalPath?: string; // e.g. "/packages/123"
  image?: string;         // absolute or relative path
  noindex?: boolean;
  jsonLd?: Json | Json[]; // additional JSON-LD blocks
};

const SITE_URL =
  import.meta.env.VITE_SITE_URL?.replace(/\/$/, '') ||
  (typeof window !== 'undefined' ? window.location.origin : 'https://example.com');

const toAbs = (url?: string) => {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

export default function Seo({
  title,
  description,
  canonicalPath,
  image,
  noindex,
  jsonLd,
}: Props) {
  const canonical = toAbs(canonicalPath) || (typeof window !== 'undefined' ? window.location.href : undefined);
  const ogImage = toAbs(image);

  const blocks = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

  return (
    <>
      <Helmet prioritizeSeoTags>
        <title>{title}</title>
        {description && <meta name="description" content={description} />}
        {noindex && <meta name="robots" content="noindex,nofollow" />}

        {/* Canonical */}
        {canonical && <link rel="canonical" href={canonical} />}

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        {description && <meta property="og:description" content={description} />}
        {canonical && <meta property="og:url" content={canonical} />}
        {ogImage && <meta property="og:image" content={ogImage} />}

        {/* Twitter */}
        <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
        <meta name="twitter:title" content={title} />
        {description && <meta name="twitter:description" content={description} />}
        {ogImage && <meta name="twitter:image" content={ogImage} />}
      </Helmet>

      {/* Additional JSON-LD blocks */}
      {blocks.map((b, i) => (
        <script key={i} type="application/ld+json" suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', ...b }) }}
        />
      ))}
    </>
  );
}
