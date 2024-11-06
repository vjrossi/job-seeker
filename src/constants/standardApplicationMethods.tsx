import React from 'react';

// Import all logos
import LinkedInLogo from '../assets/logos/linkedin.png';
import IndeedLogo from '../assets/logos/indeed.png';
import SeekLogo from '../assets/logos/seek.png';
import BuildingLogo from '../assets/logos/building.png';
import HandshakeLogo from '../assets/logos/handshake.png';
import BriefcaseLogo from '../assets/logos/briefcase.png';
import RecruiterLogo from '../assets/logos/recruiter.png';
import QuestionLogo from '../assets/logos/question.png';

export const STANDARD_APPLICATION_METHODS = [
  'LinkedIn',
  'Indeed',
  'Seek',
  'Company Website',
  'Referral',
  'Job Fair',
  'Recruiter',
  'Other'
] as const;

interface ImageIconProps {
  src: string;
  alt: string;
}

const ImageIcon: React.FC<ImageIconProps> = ({ src, alt }) => (
  <img 
    src={src} 
    alt={alt} 
    width={40} 
    height={40} 
    style={{ 
      objectFit: 'contain',
      verticalAlign: 'middle'
    }} 
  />
);

type MethodIconsType = {
  [K in (typeof STANDARD_APPLICATION_METHODS)[number]]: () => JSX.Element;
};

export const METHOD_ICONS: MethodIconsType = {
  'LinkedIn': () => <ImageIcon src={LinkedInLogo} alt="LinkedIn" />,
  'Indeed': () => <ImageIcon src={IndeedLogo} alt="Indeed" />,
  'Seek': () => <ImageIcon src={SeekLogo} alt="Seek" />,
  'Company Website': () => <ImageIcon src={BuildingLogo} alt="Company Website" />,
  'Referral': () => <ImageIcon src={HandshakeLogo} alt="Referral" />,
  'Job Fair': () => <ImageIcon src={BriefcaseLogo} alt="Job Fair" />,
  'Recruiter': () => <ImageIcon src={RecruiterLogo} alt="Recruiter" />,
  'Other': () => <ImageIcon src={QuestionLogo} alt="Other" />
};

export type ApplicationMethod = typeof STANDARD_APPLICATION_METHODS[number];