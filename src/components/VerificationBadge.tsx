
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
    <div className="inline-flex items-center justify-center px-2 py-1 ml-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 shadow-lg backdrop-blur-sm">
      <Check size={12} className="text-white" strokeWidth={2.5} />
    </div>
  );
};

export default VerificationBadge;
