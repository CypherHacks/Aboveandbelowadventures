// src/components/BreadcrumbsSchema.tsx
import { useLocation, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useMemo } from 'react';

const SITE_URL =
  import.meta.env.VITE_SITE_URL?.replace(/\/$/, '') ||
  (typeof window !== 'undefined' ? window.location.origin : 'https://example.com');

function titleFromSlug(slug: string) {
  const s = decodeURIComponent(slug).replace(/[-_]+/g, ' ').trim();
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function BreadcrumbsSchema() {
  const { pathname } = useLocation();
  const { packageId } = useParams();

  const items = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const crumbs: { name: string; item: string }[] = [{ name: 'Home', item: `${SITE_URL}/` }];
    if (segments.length === 0) return crumbs;

    let acc = '';
    segments.forEach((seg, idx) => {
      acc += `/${seg}`;
      let name = seg;

      if (seg === 'packages') name = 'Packages';
      else if (seg === 'gallery') name = 'Gallery';
      else if (seg === 'about') name = 'About';
      else if (seg === 'contact') name = 'Contact';
      else if (segments[0] === 'packages' && idx === 1 && packageId) {
        name = titleFromSlug(packageId); // prettify the package id/slug
      } else {
        name = titleFromSlug(seg);
      }

      crumbs.push({ name, item: `${SITE_URL}${acc}` });
    });

    return crumbs;
  }, [pathname, packageId]);

  const jsonLd = {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.item,
    })),
  };

  return (
    <Helmet>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', ...jsonLd }) }}
      />
    </Helmet>
  );
}
