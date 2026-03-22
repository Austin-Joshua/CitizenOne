import React, { useId, useState } from 'react';
import { cn } from '../ui';

const PNG_CANDIDATES = ['/branding/citizen-one-logo.png', '/branding/citizen-one-logo.png.png'];

/**
 * Brand lockup: `public/branding/citizen-one-logo.png` (transparent PNG recommended).
 * Falls back to `citizen-one-logo.png.png` if the OS doubled the extension, then inline SVG.
 * `variant="onDark"` is for logos on dark hero panels (e.g. auth visual column).
 */
export function CitizenOneLogo({ className, height: _height, decorative = true, variant = 'default' }) {
  const [pngFailed, setPngFailed] = useState(false);
  const [pngIndex, setPngIndex] = useState(0);
  const uid = useId().replace(/:/g, '');
  const gidShield = `co-shield-${uid}`;
  const gidOne = `co-one-${uid}`;
  const onDark = variant === 'onDark';
  const src = PNG_CANDIDATES[pngIndex];

  if (!pngFailed) {
    return (
      <img
        src={src}
        alt={decorative ? '' : 'CitizenOne'}
        className={cn(
          'h-12 w-auto max-w-full shrink-0 object-contain object-left sm:h-14',
          onDark
            ? 'brightness-[1.22] contrast-[1.08] saturate-[1.06]'
            : 'dark:brightness-[1.16] dark:contrast-[1.06] dark:saturate-[1.04]',
          className
        )}
        onError={() => {
          setPngIndex((i) => {
            if (i < PNG_CANDIDATES.length - 1) return i + 1;
            setPngFailed(true);
            return i;
          });
        }}
        {...(decorative ? { 'aria-hidden': true } : {})}
      />
    );
  }

  return (
    <svg
      className={cn('h-12 w-auto max-w-full shrink-0 sm:h-14', className)}
      viewBox="0 0 320 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={decorative}
      role={decorative ? undefined : 'img'}
    >
      {!decorative ? <title>CitizenOne</title> : null}
      <defs>
        <linearGradient id={gidShield} x1="8" y1="4" x2="52" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5eead4" />
          <stop offset="0.45" stopColor="#14b8a6" />
          <stop offset="1" stopColor="#0f766e" />
        </linearGradient>
        <linearGradient id={gidOne} x1="188" y1="20" x2="308" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22d3ee" />
          <stop offset="0.5" stopColor="#14b8a6" />
          <stop offset="1" stopColor="#0e7490" />
        </linearGradient>
      </defs>
      <path fill={`url(#${gidShield})`} d="M30 4 52 12v26q0 18-22 30Q8 56 8 38V12Z" />
      <path fill="#fff" fillOpacity="0.28" d="M14 14h32v4H14z" />
      <path
        fill="#fff"
        d="M30 7.5 31.8 11.2l3.7.5-2.7 2.6.6 3.9-3.4-1.8-3.4 1.8.6-3.9-2.7-2.6 3.7-.5z"
      />
      <path fill="#050a30" fillOpacity="0.9" d="M18 44V32h4v-4h16v4h4v12h-8v-6h-8v6z" />
      <path fill="#050a30" fillOpacity="0.9" d="M22 38h16v2H22zm0 4h8v2h-8z" />
      <circle cx="30" cy="36" r="5" fill="#fff" />
      <path fill="#fff" d="M24 46q6-4 12 0v4H24z" />
      <text
        x="72"
        y="49"
        className={onDark ? 'fill-white' : 'fill-[hsl(220_40%_10%)] dark:fill-white'}
        style={{ fontFamily: 'Outfit, Inter, system-ui, sans-serif', fontSize: 26, fontWeight: 800, letterSpacing: '-0.04em' }}
      >
        Citizen
      </text>
      <text
        x="188"
        y="49"
        fill={`url(#${gidOne})`}
        style={{ fontFamily: 'Outfit, Inter, system-ui, sans-serif', fontSize: 26, fontWeight: 800, letterSpacing: '-0.04em' }}
      >
        One
      </text>
    </svg>
  );
}
