import React from 'react';

interface HoverZoomImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  zoomScale?: number;
  onClick?: () => void;
}

export const HoverZoomImage: React.FC<HoverZoomImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  referrerPolicy = 'no-referrer',
  onClick,
}) => {
  return (
    <div
      className={`relative overflow-hidden select-none ${containerClassName}`}
      onClick={onClick}
    >
      <img
        src={src}
        alt={alt}
        referrerPolicy={referrerPolicy}
        className={`w-full h-full ${className.includes('object-') ? '' : 'object-cover'} ${className}`}
      />
    </div>
  );
};

