import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { params: string[] } }
) {
  const [width, height] = params.params;
  const w = parseInt(width) || 400;
  const h = parseInt(height) || 300;
  
  // Validação de tamanhos para evitar abuse
  if (w > 2000 || h > 2000 || w < 1 || h < 1) {
    return NextResponse.json({ error: 'Invalid dimensions' }, { status: 400 });
  }

  try {
    // Usar serviço externo como picsum.photos
    const imageUrl = `https://picsum.photos/${w}/${h}?random=${Math.floor(Math.random() * 1000)}`;
    
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      // Fallback para placeholder.com
      const fallbackUrl = `https://via.placeholder.com/${w}x${h}/1f2937/60a5fa?text=Portfolio`;
      const fallbackResponse = await fetch(fallbackUrl);
      
      if (!fallbackResponse.ok) {
        // Último fallback - gerar SVG
        return generateSVGPlaceholder(w, h);
      }
      
      const imageBuffer = await fallbackResponse.arrayBuffer();
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400', // Cache por 24h
        },
      });
    }

    const imageBuffer = await response.arrayBuffer();
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=86400', // Cache por 24h
      },
    });
  } catch (error) {
    console.error('Error fetching placeholder image:', error);
    return generateSVGPlaceholder(w, h);
  }
}

function generateSVGPlaceholder(width: number, height: number) {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#60a5fa;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#a78bfa;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.min(width, height) / 10}" 
            fill="white" text-anchor="middle" dominant-baseline="middle">
        ${width}×${height}
      </text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}