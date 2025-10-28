"use client";
import { useEffect, useState } from 'react';

type UserInfo = {
  name: string;
  balance: number; // cents
  birthday: string; // YYYY-MM-DD
  avatar: string; // emoji or image URL
  isEmoji?: boolean; // default true
};

function formatBalance(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatBirthday(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString();
}

export default function UserAvatar({ userInfo }: { userInfo: UserInfo }) {
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showProfile && !target.closest('.user-avatar-container')) {
        setShowProfile(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showProfile) setShowProfile(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showProfile]);

  return (
    <div className="relative user-avatar-container">
      <button
        onClick={() => setShowProfile(!showProfile)}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-burger-yellow to-burger-red hover:from-yellow-400 hover:to-red-500 transition-all duration-300 flex items-center justify-center overflow-hidden border-2 border-white shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-burger-yellow focus:ring-offset-2"
        aria-label="User avatar"
      >
        {userInfo.isEmoji !== false ? (
          <span className="text-lg">{userInfo.avatar}</span>
        ) : (
          <img
            src={userInfo.avatar}
            alt={userInfo.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling!.classList.remove('hidden');
            }}
          />
        )}
        {userInfo.isEmoji === false && (
          <span className="text-lg hidden">👤</span>
        )}
      </button>

      {showProfile && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-l border-t border-gray-100 transform rotate-45" />
          <div className="bg-gradient-to-r from-burger-yellow to-burger-red p-5 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center border-2 border-white shadow-md">
                {userInfo.isEmoji !== false ? (
                  <span className="text-3xl">{userInfo.avatar}</span>
                ) : (
                  <img src={userInfo.avatar} alt={userInfo.name} className="w-full h-full rounded-full object-cover" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-xl">{userInfo.name}</h3>
                <p className="text-white text-opacity-90 text-sm">Burger Shop Member</p>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-3">
                <span className="text-green-600 text-xl">💰</span>
                <span className="font-semibold text-gray-700">Account Balance</span>
              </div>
              <span className="font-bold text-green-600 text-xl">{formatBalance(userInfo.balance)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3">
                <span className="text-blue-600 text-xl">🎂</span>
                <span className="font-semibold text-gray-700">Birthday</span>
              </div>
              <span className="text-blue-600 font-semibold">{formatBirthday(userInfo.birthday)}</span>
            </div>
          </div>
          <button
            onClick={() => setShowProfile(false)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

