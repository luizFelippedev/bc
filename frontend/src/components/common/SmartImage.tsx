'use client';
import React, { useState } from 'react';
import { placeholders, generateSVGDataUrl, PlaceholderType } from '@/utils/placeholder';

interface SmartImageProps {
  src?: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  placeholderType?: PlaceholderType;
  placeholderText?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  placeholderType = 'general',
  placeholderText,
  loading = 'lazy',
  onLoad,
  onError
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Gera placeholder baseado no tipo
  const getPlaceholderSrc = () => {
    switch (placeholderType) {
      case 'profile':
        return placeholders.userAvatar(placeholderText || 'User', Math.max(width, height));
      case 'project':
        return placeholders.projectImage(width, height);
      case 'certificate':
        return placeholders.certificateImage(width, height, placeholderText);
      default:
        return placeholders.general(width, height);
    }
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    
    if (currentSrc !== getPlaceholderSrc()) {
      setCurrentSrc(getPlaceholderSrc());
    } else {
      // Se até o placeholder falhar, usa SVG data URL
      setCurrentSrc(generateSVGDataUrl({ 
        width, 
        height, 
        text: placeholderText || `${width}×${height}` 
      }));
    }
    
    onError?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {/* Loading placeholder */}
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{
            backgroundImage: `url("${generateSVGDataUrl({ width, height, text: '...' })}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}
      
      {/* Main image */}
      <img
        src={currentSrc || getPlaceholderSrc()}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        style={{ width, height, objectFit: 'cover' }}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
      />
      
      {/* Error indicator */}
      {hasError && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full opacity-50" />
      )}
    </div>
  );
};

// Componente específico para avatares
export const AvatarImage: React.FC<{
  src?: string;
  name?: string;
  size?: number;
  className?: string;
}> = ({ src, name = 'User', size = 40, className = '' }) => {
  return (
    <SmartImage
      src={src}
      alt={`Avatar de ${name}`}
      width={size}
      height={size}
      placeholderType="profile"
      placeholderText={name}
      className={`rounded-full ${className}`}
    />
  );
};

// Componente específico para imagens de projeto
export const ProjectImage: React.FC<{
  src?: string;
  title?: string;
  width?: number;
  height?: number;
  className?: string;
}> = ({ src, title = 'Projeto', width = 400, height = 300, className = '' }) => {
  return (
    <SmartImage
      src={src}
      alt={`Imagem do projeto ${title}`}
      width={width}
      height={height}
      placeholderType="project"
      placeholderText={title}
      className={`rounded-lg ${className}`}
    />
  );
};

// Componente específico para certificados
export const CertificateImage: React.FC<{
  src?: string;
  title?: string;
  width?: number;
  height?: number;
  className?: string;
}> = ({ src, title = 'Certificado', width = 300, height = 200, className = '' }) => {
  return (
    <SmartImage
      src={src}
      alt={`Certificado ${title}`}
      width={width}
      height={height}
      placeholderType="certificate"
      placeholderText={title}
      className={`rounded-lg ${className}`}
    />
  );
};