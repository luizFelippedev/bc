// Placeholder utility for generating consistent placeholder images
export type PlaceholderType = 'general' | 'profile' | 'project' | 'certificate';

interface PlaceholderOptions {
  width: number;
  height: number;
  text?: string;
  background?: string;
  textColor?: string;
  type?: PlaceholderType;
}

/**
 * Generate SVG data URL for placeholder images
 */
export function generateSVGDataUrl(options: PlaceholderOptions): string {
  const {
    width,
    height,
    text = `${width}×${height}`,
    background = '#374151',
    textColor = '#9CA3AF',
    type = 'general'
  } = options;

  const fontSize = Math.min(width, height) / 8;
  const typeColors = getTypeColors(type);

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad${type}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${typeColors.primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${typeColors.secondary};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad${type})"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${fontSize}" 
            fill="${textColor}" text-anchor="middle" dominant-baseline="middle" font-weight="500">
        ${text}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Get type-specific colors
 */
function getTypeColors(type: PlaceholderType) {
  const colors = {
    general: { primary: '#374151', secondary: '#4B5563' },
    profile: { primary: '#3B82F6', secondary: '#6366F1' },
    project: { primary: '#10B981', secondary: '#059669' },
    certificate: { primary: '#F59E0B', secondary: '#D97706' }
  };

  return colors[type] || colors.general;
}

/**
 * Placeholder image generators
 */
export const placeholders = {
  // General placeholder
  general: (width: number, height: number, text?: string): string => {
    return generateSVGDataUrl({ width, height, text, type: 'general' });
  },

  // User avatar placeholder
  userAvatar: (name: string = 'User', size: number = 40): string => {
    const initials = name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');

    return generateSVGDataUrl({
      width: size,
      height: size,
      text: initials,
      type: 'profile'
    });
  },

  // Project image placeholder
  projectImage: (width: number, height: number, title?: string): string => {
    return generateSVGDataUrl({
      width,
      height,
      text: title || 'Project',
      type: 'project'
    });
  },

  // Certificate image placeholder
  certificateImage: (width: number, height: number, title?: string): string => {
    return generateSVGDataUrl({
      width,
      height,
      text: title || 'Certificate',
      type: 'certificate'
    });
  },

  // Get API endpoint for placeholder
  apiEndpoint: (width: number, height: number): string => {
    return `/api/placeholder/${width}/${height}`;
  },

  // External fallback URLs
  external: {
    picsum: (width: number, height: number, id?: number): string => {
      const seedParam = id ? `?random=${id}` : `?random=${Math.floor(Math.random() * 1000)}`;
      return `https://picsum.photos/${width}/${height}${seedParam}`;
    },

    placeholder: (width: number, height: number, text?: string): string => {
      const textParam = text ? `&text=${encodeURIComponent(text)}` : '';
      return `https://via.placeholder.com/${width}x${height}/374151/9CA3AF${textParam}`;
    },

    uiAvatars: (name: string, size: number = 40): string => {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=${size}&background=3B82F6&color=ffffff&rounded=true`;
    }
  },

  // Smart fallback that tries multiple sources
  smartFallback: (
    width: number, 
    height: number, 
    type: PlaceholderType = 'general',
    name?: string
  ): string[] => {
    const fallbacks: string[] = [];

    // Primary: API endpoint
    fallbacks.push(placeholders.apiEndpoint(width, height));

    // Secondary: External services
    if (type === 'profile' && name) {
      fallbacks.push(placeholders.external.uiAvatars(name, Math.max(width, height)));
    } else {
      fallbacks.push(placeholders.external.picsum(width, height));
      fallbacks.push(placeholders.external.placeholder(width, height));
    }

    // Tertiary: SVG fallback
    fallbacks.push(generateSVGDataUrl({ width, height, type }));

    return fallbacks;
  }
};

/**
 * Hook for managing placeholder images with fallbacks
 */
export function usePlaceholderImage(
  originalSrc: string | undefined,
  width: number,
  height: number,
  type: PlaceholderType = 'general',
  name?: string
) {
  const fallbacks = placeholders.smartFallback(width, height, type, name);
  
  // Return original src if available, otherwise first fallback
  return originalSrc || fallbacks[0];
}

/**
 * Generate placeholder for different content types
 */
export const contentPlaceholders = {
  // Project card placeholder
  projectCard: (title: string): string => {
    return placeholders.projectImage(400, 300, title);
  },

  // Project gallery placeholder
  projectGallery: (index: number): string => {
    return placeholders.external.picsum(800, 600, index);
  },

  // Certificate placeholder
  certificate: (title: string): string => {
    return placeholders.certificateImage(300, 200, title);
  },

  // User avatar in different sizes
  avatar: {
    small: (name: string): string => placeholders.userAvatar(name, 32),
    medium: (name: string): string => placeholders.userAvatar(name, 48),
    large: (name: string): string => placeholders.userAvatar(name, 80),
    xl: (name: string): string => placeholders.userAvatar(name, 120)
  },

  // Technology icons placeholder
  techIcon: (techName: string): string => {
    return generateSVGDataUrl({
      width: 32,
      height: 32,
      text: techName.charAt(0).toUpperCase(),
      type: 'general'
    });
  }
};

/**
 * Validate image URL and provide fallback
 */
export async function validateImageUrl(url: string, fallbackOptions: PlaceholderOptions): Promise<string> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (response.ok) {
      return url;
    }
  } catch (error) {
    console.warn('Image validation failed:', error);
  }
  
  return generateSVGDataUrl(fallbackOptions);
}

/**
 * Preload placeholder images
 */
export function preloadPlaceholderImages(images: string[]): Promise<void[]> {
  return Promise.all(
    images.map(src => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load ${src}`));
        img.src = src;
      });
    })
  );
}

/**
 * Responsive placeholder based on device
 */
export function responsivePlaceholder(
  baseWidth: number,
  baseHeight: number,
  type: PlaceholderType = 'general'
): { mobile: string; tablet: string; desktop: string } {
  return {
    mobile: generateSVGDataUrl({ 
      width: Math.round(baseWidth * 0.5), 
      height: Math.round(baseHeight * 0.5), 
      type 
    }),
    tablet: generateSVGDataUrl({ 
      width: Math.round(baseWidth * 0.75), 
      height: Math.round(baseHeight * 0.75), 
      type 
    }),
    desktop: generateSVGDataUrl({ 
      width: baseWidth, 
      height: baseHeight, 
      type 
    })
  };
}

/**
 * Generate placeholder for OpenGraph/Social Media
 */
export function socialMediaPlaceholder(title: string, description?: string): string {
  const width = 1200;
  const height = 630;
  const fontSize = 48;
  const descFontSize = 24;

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="socialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#socialGrad)"/>
      <text x="50%" y="40%" font-family="Arial, sans-serif" font-size="${fontSize}" 
            fill="white" text-anchor="middle" dominant-baseline="middle" font-weight="bold">
        ${title}
      </text>
      ${description ? `
        <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="${descFontSize}" 
              fill="rgba(255,255,255,0.8)" text-anchor="middle" dominant-baseline="middle">
          ${description.substring(0, 100)}${description.length > 100 ? '...' : ''}
        </text>
      ` : ''}
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}