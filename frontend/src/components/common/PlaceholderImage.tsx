'use client';
import React, { useState } from 'react';
import { User, Image as ImageIcon } from 'lucide-react';

interface PlaceholderImageProps {
  width: number;
  height: number;
  className?: string;
  alt?: string;
  type?: 'profile' | 'project' | 'certificate' | 'general';
  text?: string;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

export const PlaceholderImage: React.FC<PlaceholderImageProps> = ({
  width,
  height,
  className = '',
  alt = 'Placeholder',
  type = 'general',
  text,
  borderRadius = 'md'
}) => {
  const [useExternal, setUseExternal] = useState(true);
  const [imageError, setImageError] = useState(false);

  const borderRadiusClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };

  const getGradientColors = () => {
    switch (type) {
      case 'profile':
        return 'from-blue-500 to-purple-500';
      case 'project':
        return 'from-green-500 to-blue-500';
      case 'certificate':
        return 'from-yellow-500 to-orange-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'profile':
        return <User className="w-8 h-8 text-white" />;
      case 'project':
      case 'certificate':
      case 'general':
      default:
        return <ImageIcon className="w-8 h-8 text-white" />;
    }
  };

  const displayText = text || `${width}×${height}`;

  // Tentar usar serviço externo primeiro
  if (useExternal && !imageError) {
    const externalUrl = type === 'profile' 
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(displayText)}&size=${width}&background=60a5fa&color=ffffff&rounded=${borderRadius === 'full'}`
      : `https://picsum.photos/${width}/${height}?random=${type}`;

    return (
      <img
        src={externalUrl}
        alt={alt}
        width={width}
        height={height}
        className={`${borderRadiusClasses[borderRadius]} ${className}`}
        onError={() => {
          setImageError(true);
          setUseExternal(false);
        }}
        loading="lazy"
      />
    );
  }

  // Fallback para SVG gerado
  return (
    <div
      className={`
        flex items-center justify-center 
        bg-gradient-to-br ${getGradientColors()}
        ${borderRadiusClasses[borderRadius]}
        ${className}
      `}
      style={{ width, height }}
    >
      <div className="flex flex-col items-center justify-center text-center p-2">
        {getIcon()}
        {width > 100 && height > 100 && (
          <span className="text-white text-xs mt-1 font-medium">
            {displayText}
          </span>
        )}
      </div>
    </div>
  );
};

// Hook para gerar URL de placeholder
export const usePlaceholderImage = (
  width: number, 
  height: number, 
  type: 'profile' | 'project' | 'general' = 'general'
) => {
  const getPlaceholderUrl = () => {
    switch (type) {
      case 'profile':
        return `https://ui-avatars.com/api/?name=User&size=${width}&background=60a5fa&color=ffffff&rounded=true`;
      case 'project':
        return `https://picsum.photos/${width}/${height}?random=project`;
      default:
        return `https://picsum.photos/${width}/${height}?random=general`;
    }
  };

  return {
    src: getPlaceholderUrl(),
    fallback: `/api/placeholder/${width}/${height}`
  };
};