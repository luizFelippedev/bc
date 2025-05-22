'use client';
import Head from 'next/head';
import { useRouter } from 'next/navigation';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description = 'Portfolio profissional de João Silva - Desenvolvedor Full Stack especializado em React, Node.js e IA. Criando experiências digitais excepcionais.',
  keywords = ['portfolio', 'desenvolvedor', 'full stack', 'react', 'nodejs', 'javascript', 'typescript'],
  image = '/images/og-image.png',
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'João Silva',
  canonical,
  noindex = false,
  nofollow = false,
}) => {
  const router = useRouter();
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://joaosilva.dev';
  const currentUrl = `${siteUrl}${router.asPath || ''}`;
  
  const pageTitle = title 
    ? `${title} | João Silva - Portfolio`
    : 'João Silva - Full Stack Developer & AI Specialist';

  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta charSet="utf-8" />
      
      {/* Language */}
      <meta httpEquiv="content-language" content="pt-BR" />
      <link rel="alternate" hrefLang="pt-BR" href={currentUrl} />
      <link rel="alternate" hrefLang="en" href={`${currentUrl}?lang=en`} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical || currentUrl} />
      
      {/* Robots */}
      {(noindex || nofollow) && (
        <meta 
          name="robots" 
          content={`${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`} 
        />
      )}
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:alt" content={title || 'João Silva Portfolio'} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="João Silva Portfolio" />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@joaosilva" />
      <meta name="twitter:creator" content="@joaosilva" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      
      {/* Article specific */}
      {type === 'article' && (
        <>
          {publishedTime && (
            <meta property="article:published_time" content={publishedTime} />
          )}
          {modifiedTime && (
            <meta property="article:modified_time" content={modifiedTime} />
          )}
          <meta property="article:author" content={author} />
          <meta property="article:section" content="Technology" />
        </>
      )}
      
      {/* Favicons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#3b82f6" />
      <meta name="msapplication-TileColor" content="#3b82f6" />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "João Silva",
            "url": siteUrl,
            "image": fullImageUrl,
            "jobTitle": "Full Stack Developer",
            "worksFor": {
              "@type": "Organization",
              "name": "Freelancer"
            },
            "alumniOf": "Universidade Federal",
            "knowsAbout": [
              "JavaScript",
              "TypeScript",
              "React",
              "Node.js",
              "Python",
              "Machine Learning",
              "Web Development",
              "Mobile Development"
            ],
            "sameAs": [
              "https://github.com/joaosilva",
              "https://linkedin.com/in/joaosilva",
              "https://twitter.com/joaosilva"
            ]
          })
        }}
      />
      
      {/* Preload critical resources */}
      <link 
        rel="preload" 
        href="/fonts/inter-var.woff2" 
        as="font" 
        type="font/woff2" 
        crossOrigin="anonymous" 
      />
      
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
    </Head>
  );
};