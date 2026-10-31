import React from 'react';
import UnifiedLeaderboardSection from './common/UnifiedLeaderboardSection';
import WeeklyActivitySection from './common/WeeklyActivitySection';

export default function Leaderboard() {
  return (
    <div className="space-y-8 animate-fadeIn">
      <UnifiedLeaderboardSection initialRole="RESTAURANTS" />
      <WeeklyActivitySection role="ADMIN" />
    </div>
  );
}
