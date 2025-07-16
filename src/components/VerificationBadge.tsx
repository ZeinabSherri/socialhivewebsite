
import React from 'react';
import { Check } from 'lucide-react';

interface VerificationBadgeProps {
  username?: string;
}

const VerificationBadge = ({ username }: VerificationBadgeProps) => {
  // Only show badge for socialhive.agency usernames
  if (!username || !username.includes('socialhive')) {
    return null;
  }

  return (
    <div className="inline-flex items-center justify-center w-4 h-4 bg-blue-500 rounded-full ml-1 flex-shrink-0">
      <Check size={10} className="text-white" strokeWidth={3} />
    </div>
  );
};

export default VerificationBadge;
