import React from 'react';

export default function StatsGraph({ users, posts, subscriptions = [], currentUser }) {
  const isTeacher = currentUser?.role === 'teacher';

  // State calculations based on user role
  let title = 'სისტემის სტატისტიკა & ვერიფიკაცია';
  let primaryLabel1 = 'სულ წევრი';
  let primaryValue1 = users.length;
  let primaryLabel2 = 'ვერიფიცირებული';
  let primaryValue2 = users.filter(u => u.personalId && u.personalId.length === 11).length;
  
  let subLabel1 = 'მოსწავლეები:';
  let subValue1 = users.filter(u => u.role === 'student').length;
  let subLabel2 = 'მასწავლებლები:';
  let subValue2 = users.filter(u => u.role === 'teacher').length;
  
  let avgRating = '0.0';
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  if (isTeacher) {
    title = 'თქვენი კურსების სტატისტიკა';
    
    // Teacher's specific active subscriptions
    const mySubs = subscriptions.filter(s => s.teacherId === currentUser.id);
    primaryLabel1 = 'აქტიური მოსწავლე';
    primaryValue1 = mySubs.length;
    
    // Monthly estimated earnings: 150 GEL per student
    primaryLabel2 = 'ყოველთვიური შემოსავალი';
    primaryValue2 = `${mySubs.length * 150} ₾`;

    // Teacher's specific posts & ratings
    const myPosts = posts.filter(p => p.userId === currentUser.id);
    let totalRatingsCount = 0;
    let ratingsSum = 0;

    myPosts.forEach(p => {
      if (p.ratings) {
        Object.values(p.ratings).forEach(val => {
          const rounded = Math.round(val);
          if (ratingDistribution[rounded] !== undefined) {
            ratingDistribution[rounded]++;
            totalRatingsCount++;
            ratingsSum += val;
          }
        });
      }
    });

    avgRating = totalRatingsCount > 0 ? (ratingsSum / totalRatingsCount).toFixed(1) : '0.0';
    subLabel1 = 'თქვენი კურსები:';
    subValue1 = myPosts.length;
    subLabel2 = 'სულ შეფასება:';
    subValue2 = totalRatingsCount;
  } else {
    // System-wide general statistics
    const ratedPosts = posts.filter(p => p.ratings && Object.keys(p.ratings).length > 0);
    avgRating = ratedPosts.length > 0
      ? (ratedPosts.reduce((acc, p) => {
          const vals = Object.values(p.ratings);
          return acc + (vals.reduce((s, v) => s + v, 0) / vals.length);
        }, 0) / ratedPosts.length).toFixed(1)
      : '0.0';

    posts.forEach(p => {
      if (p.ratings) {
        Object.values(p.ratings).forEach(val => {
          const rounded = Math.round(val);
          if (ratingDistribution[rounded] !== undefined) {
            ratingDistribution[rounded]++;
          }
        });
      }
    });
  }

  const maxVal = Math.max(...Object.values(ratingDistribution), 1);
  const chartHeight = 120;
  const chartWidth = 320;
  const barPadding = 16;
  const barWidth = (chartWidth - barPadding * 6) / 5;

  return (
    <div className="glass-panel rounded-2xl p-5 mb-6 border border-[#ffffff10] relative overflow-hidden font-['Noto_Sans_Georgian']">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/10 to-transparent pointer-events-none rounded-full blur-2xl"></div>

      <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
        <i className="fas fa-chart-bar text-indigo-400"></i>
        <span>{title}</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Left Side: Stats info */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/35 rounded-xl p-3 border border-[#27272a]/60">
              <span className="text-[11px] text-[#71717a] block uppercase font-medium">{primaryLabel1}</span>
              <span className="text-xl font-bold text-white mt-1 block">{primaryValue1}</span>
            </div>
            <div className="bg-black/35 rounded-xl p-3 border border-[#27272a]/60">
              <span className="text-[11px] text-[#71717a] block uppercase font-medium">{primaryLabel2}</span>
              <span className={`text-xl font-bold mt-1 block flex items-center gap-1.5 ${isTeacher ? 'text-brand-glow' : 'text-emerald-400'}`}>
                {primaryValue2}
                {!isTeacher && <i className="fas fa-shield-alt text-xs"></i>}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-xs text-[#a1a1aa] bg-black/20 p-3 rounded-xl border border-[#27272a]/40">
            <div className="flex justify-between items-center">
              <span>{subLabel1}</span>
              <span className="font-semibold text-white">{subValue1}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>{subLabel2}</span>
              <span className="font-semibold text-white">{subValue2}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>საშუალო რეიტინგი:</span>
              <span className="font-semibold text-amber-400 flex items-center gap-1">
                {avgRating} <i className="fas fa-star text-[10px]"></i>
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Beautiful SVG bar graph */}
        <div className="flex flex-col items-center">
          <span className="text-xs text-[#71717a] mb-2 font-medium">შეფასებების განაწილება (ვარსკვლავები)</span>
          
          <svg width={chartWidth} height={chartHeight} className="overflow-visible">
            {/* Grid Lines */}
            <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#27272a" strokeWidth="1" />
            <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="#27272a" strokeDasharray="3,3" />

            {/* Bars */}
            {[1, 2, 3, 4, 5].map((star, idx) => {
              const count = ratingDistribution[star];
              const percent = count / maxVal;
              const barHeight = percent * (chartHeight - 20) || 4; // minimum height for visibility
              const x = barPadding + idx * (barWidth + barPadding);
              const y = chartHeight - barHeight;

              return (
                <g key={star}>
                  {/* Tooltip text on hover */}
                  <text
                    x={x + barWidth / 2}
                    y={y - 6}
                    textAnchor="middle"
                    fill="#a1a1aa"
                    fontSize="10"
                    className="opacity-0 hover:opacity-100 transition-opacity duration-200"
                  >
                    {count}
                  </text>
                  {/* Glowing background bar */}
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill="url(#barGradient)"
                    rx="4"
                    className="chart-bar"
                  />
                  {/* Star index label below */}
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight + 14}
                    textAnchor="middle"
                    fill="#71717a"
                    fontSize="10"
                    className="font-semibold"
                  >
                    {star}★
                  </text>
                </g>
              );
            })}

            {/* Gradients definitions */}
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.4" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}
