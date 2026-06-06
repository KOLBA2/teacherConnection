import React, { useState } from 'react';
import ReportModal from './ReportModal';

export default function PostCard({
  post,
  currentUser,
  users,
  subscriptions = [],
  reports = [],
  highlightedPostId = null,
  onResolveReportByPostId,
  onResolveReportByCommentId,
  onEditPost,
  onDeletePost,
  onRatePost,
  onToggleSave,
  onAddComment,
  onDeleteComment,
  onStartPayment,
  onCancelCourse,
  addToast,
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [reportTarget, setReportTarget] = useState(null); // { type: 'post'|'comment', id, text }

  const author = users.find(u => u.id === post.userId) || { fullName: 'უცნობი', avatar: '', role: 'student' };
  const isOwner = currentUser?.id === post.userId;
  const isSaved = (currentUser?.saved || []).includes(post.id);

  const isAdmin = currentUser?.email === 'gkolbaia2008@gmail.com';
  const postReports = reports.filter(r => r.targetId === post.id && r.targetType === 'post');

  // Compute 5-star rating data
  const postRatings = post.ratings || {};
  const ratingKeys = Object.keys(postRatings);
  const ratingCount = ratingKeys.length;
  const ratingSum = ratingKeys.reduce((sum, key) => sum + postRatings[key], 0);
  const avgRating = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : '0.0';
  const currentUserRating = postRatings[currentUser?.id] || 0;

  React.useEffect(() => {
    if (post.id === highlightedPostId) {
      const hasCommentReports = reports.some(r => r.targetType === 'comment' && post.comments?.some(c => c.id === r.targetId));
      if (hasCommentReports) {
        setShowComments(true);
      }
    }
  }, [highlightedPostId, post.id, reports]);

  // Determine if payment button should be visible
  const showPaymentBtn = author.role === 'teacher' && currentUser && currentUser.id !== post.userId;
  const isSubscribed = subscriptions.some(s => s.studentId === currentUser?.id && s.postId === post.id);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText.trim());
    setCommentText('');
  };

  return (
    <>
      <div id={`post-${post.id}`} className="glass-panel post-card p-5 rounded-2xl border border-[#ffffff08] transition-all duration-200">
        
        {/* Admin Action Banner */}
        {isAdmin && postReports.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 font-['Noto_Sans_Georgian']">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider mb-1">
                <i className="fas fa-exclamation-triangle text-xs animate-pulse"></i> რეპორტირებული განცხადება ({postReports.length})
              </div>
              <div className="text-[13px] text-red-300">
                <span className="font-semibold text-white">მიზეზი:</span>{' '}
                {postReports.map((r) => r.reason || 'დაზუსტების გარეშე').join(', ')}
              </div>
              {postReports.some((r) => r.details) && (
                <div className="text-[11px] text-[#a1a1aa] mt-1">
                  <span className="font-semibold text-[#71717a]">დეტალები:</span>{' '}
                  {postReports.map((r) => r.details).filter(Boolean).join(' | ')}
                </div>
              )}
            </div>
            <div className="flex gap-2 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
              <button
                onClick={() => onResolveReportByPostId && onResolveReportByPostId(post.id)}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 font-semibold text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <i className="fas fa-check text-[10px]"></i> დატოვება
              </button>
              <button
                onClick={() => onDeletePost && onDeletePost(post.id)}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 font-semibold text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <i className="fas fa-trash text-[10px]"></i> წაშლა
              </button>
            </div>
          </div>
        )}

        {/* Card Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-3 items-center">
            <img
              src={author.avatar || 'https://ui-avatars.com/api/?name=User'}
              alt={author.fullName}
              className="w-10 h-10 rounded-full object-cover border-2 border-[#27272a] shrink-0"
            />
            <div>
              <h3 className="font-semibold text-white m-0 text-[15px] leading-tight font-['Noto_Sans_Georgian']">
                {post.title}
              </h3>
              <p className="text-[12px] text-[#71717a] mt-1 m-0 font-['Noto_Sans_Georgian']">
                {author.fullName} · {new Date(post.timestamp).toLocaleDateString('ka-GE')}
              </p>
            </div>
          </div>

          {/* Dropdown Options — Owner sees Edit/Delete, Others see Report */}
          <div className="post-menu">
            <button className="bg-transparent border-none text-[#71717a] hover:text-white cursor-pointer px-2 py-1 rounded-md transition-colors text-[15px]">
              <i className="fas fa-ellipsis-v"></i>
            </button>
            <div className="post-menu-dropdown font-['Noto_Sans_Georgian']">
              {isOwner ? (
                <>
                  <button
                    onClick={() => onEditPost(post)}
                    className="text-[#60a5fa] hover:bg-white/5 w-full text-left py-2 px-3 border-none bg-transparent cursor-pointer flex items-center gap-2"
                  >
                    <i className="fas fa-edit text-xs"></i> რედაქტირება
                  </button>
                  <button
                    onClick={() => onDeletePost(post.id)}
                    className="text-[#f87171] hover:bg-white/5 w-full text-left py-2 px-3 border-none bg-transparent cursor-pointer flex items-center gap-2"
                  >
                    <i className="fas fa-trash text-xs"></i> წაშლა
                  </button>
                </>
              ) : (
                currentUser && (
                  <button
                    onClick={() => setReportTarget({ type: 'post', id: post.id, text: `${post.title} — ${post.desc}` })}
                    className="text-[#fb923c] hover:bg-white/5 w-full text-left py-2 px-3 border-none bg-transparent cursor-pointer flex items-center gap-2"
                  >
                    <i className="fas fa-flag text-xs"></i> შეტყობინება
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Post Image */}
        {post.image && (
          <img
            src={post.image}
            alt={post.title}
            className="post-image"
          />
        )}

        {/* Description */}
        <p className="text-[#a1a1aa] text-[14px] leading-relaxed mb-4 whitespace-pre-wrap font-['Noto_Sans_Georgian']">
          {post.desc}
        </p>

        {/* Location Badge */}
        <div className="mb-4">
          <span className="badge-brand font-['Noto_Sans_Georgian']">
            <i className="fas fa-map-marker-alt text-[10px] mr-1"></i>
            {post.location}
          </span>
        </div>

        {/* Start Learning / Payment CTA Widget */}
        {showPaymentBtn && (
          <div className="mt-1 mb-4 animate-fade-in">
            {isSubscribed ? (
              <div className="flex flex-col gap-2">
                {/* Active course badge */}
                <div className="w-full text-center py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-semibold text-xs flex items-center justify-center gap-1.5 font-['Noto_Sans_Georgian'] shadow-sm">
                  <i className="fas fa-check-circle text-xs"></i> სწავლა დაწყებულია (აქტიური კურსი ✓)
                </div>
                {/* Cancel course button */}
                <button
                  onClick={() => onCancelCourse && onCancelCourse(post.id)}
                  className="w-full text-center py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 hover:border-red-500/40 text-red-400 font-semibold text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5 font-['Noto_Sans_Georgian']"
                >
                  <i className="fas fa-times-circle text-xs"></i> კურსის გაუქმება
                </button>
              </div>
            ) : (
              <button
                onClick={() => onStartPayment(post)}
                className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs cursor-pointer border-none shadow-md hover:shadow-indigo-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 font-['Noto_Sans_Georgian']"
              >
                <i className="fas fa-graduation-cap text-xs"></i> სწავლის დაწყება (150 ₾ / თვეში)
              </button>
            )}
          </div>
        )}

        {/* Action Footer */}
        <div className="flex items-center justify-between border-t border-[#ffffff06] pt-3 mt-2">
          <div className="flex gap-6 items-center">
            {/* Interactive 5-Star Rating System */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => onRatePost(post.id, star)}
                    className="star-rating-btn"
                    title={`${star} ვარსკვლავით შეფასება`}
                  >
                    <i
                      className={`${
                        star <= (hoverRating || currentUserRating) ? 'fas' : 'far'
                      } fa-star text-[14px] transition-all`}
                      style={{
                        color: star <= (hoverRating || currentUserRating) ? '#fbbf24' : '#71717a',
                        textShadow: star <= (hoverRating || currentUserRating) ? '0 0 8px rgba(251,191,36,0.3)' : 'none'
                      }}
                    ></i>
                  </button>
                ))}
              </div>
              <span className="text-[12px] text-[#a1a1aa] font-semibold mt-0.5">
                {avgRating} <span className="text-[#71717a] font-normal">({ratingCount} შეფასება)</span>
              </span>
            </div>

            {/* Comment Drawer Toggle */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer text-xs text-[#71717a] hover:text-[#818cf8] p-1 rounded transition-colors font-['Noto_Sans_Georgian']"
            >
              <i className="far fa-comment text-sm"></i>
              <span>{post.comments?.length || 0} კომენტარი</span>
            </button>
          </div>

          {/* Saved bookmark */}
          <button
            onClick={() => onToggleSave(post.id)}
            className="bg-transparent border-none cursor-pointer text-lg p-1 transition-colors rounded hover:text-[#eab308]"
            style={{ color: isSaved ? '#eab308' : '#71717a' }}
            title={isSaved ? 'შენახვიდან ამოღება' : 'პოსტის შენახვა'}
          >
            <i className={`${isSaved ? 'fas' : 'far'} fa-bookmark`}></i>
          </button>
        </div>

        {/* Expanded Comments Panel */}
        {showComments && (
          <div className="mt-4 pt-3 border-t border-[#ffffff06] animate-fade-in">
            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto mb-3 pr-1">
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment) => {
                  const commentUser = users.find(u => u.id === comment.userId) || { fullName: 'უცნობი', avatar: '' };
                  const isCommentOwner = comment.userId === currentUser?.id;
                  const isCommentReported = reports.some(r => r.targetId === comment.id && r.targetType === 'comment');

                  return (
                    <div key={comment.id} className="flex gap-2 text-left">
                      <img
                        src={commentUser.avatar || 'https://ui-avatars.com/api/?name=User'}
                        alt={commentUser.fullName}
                        className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                      />
                      <div className={`rounded-xl p-2 flex-1 border transition-colors ${
                        isCommentReported 
                          ? 'bg-red-500/10 border-red-500/25' 
                          : 'bg-black/35 border-[#27272a]/60'
                      }`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[12px] font-semibold text-[#818cf8] font-['Noto_Sans_Georgian']">
                            {commentUser.fullName}
                            {isCommentReported && (
                              <span className="text-red-400 text-[10px] ml-1.5 font-bold uppercase tracking-wider">
                                ⚠️ შეტყობინებული
                              </span>
                            )}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {/* Report comment button — for non-owners, non-admins */}
                            {currentUser && !isCommentOwner && !isAdmin && (
                              <button
                                onClick={() => setReportTarget({ type: 'comment', id: comment.id, text: comment.text })}
                                className="bg-transparent border-none cursor-pointer text-[#52525b] hover:text-[#fb923c] text-[10px] p-0.5 transition-colors"
                                title="კომენტარის შეტყობინება"
                              >
                                <i className="fas fa-flag"></i>
                              </button>
                            )}
                            
                            {/* Admin Resolve / Keep comment */}
                            {isAdmin && isCommentReported && (
                              <button
                                onClick={() => onResolveReportByCommentId && onResolveReportByCommentId(comment.id)}
                                className="bg-transparent border-none cursor-pointer text-emerald-400 hover:text-emerald-300 text-[10px] p-0.5 transition-colors"
                                title="დატოვება (რეპორტის წაშლა)"
                              >
                                <i className="fas fa-check"></i>
                              </button>
                            )}

                            {/* Delete comment (own or admin override) */}
                            {(isCommentOwner || isAdmin) && (
                              <button
                                onClick={() => {
                                  if (isAdmin) {
                                    if (window.confirm('დარწმუნებული ხართ, რომ გსურთ ამ კომენტარის წაშლა?')) {
                                      onDeleteComment(post.id, comment.id);
                                      onResolveReportByCommentId && onResolveReportByCommentId(comment.id);
                                    }
                                  } else {
                                    onDeleteComment(post.id, comment.id);
                                  }
                                }}
                                className="bg-transparent border-none cursor-pointer text-[#71717a] hover:text-[#f87171] text-[10px] p-0.5 transition-colors"
                                title="კომენტარის წაშლა"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-[13px] text-[#a1a1aa] m-0 font-['Noto_Sans_Georgian'] leading-snug">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-[#52525b] text-center my-2 font-['Noto_Sans_Georgian']">კომენტარები ჯერ არ არის</p>
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="კომენტარი..."
                className="comment-input font-['Noto_Sans_Georgian']"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button
                type="submit"
                className="bg-transparent border-none cursor-pointer text-[#6366f1] hover:text-[#818cf8] text-base p-1 shrink-0 transition-colors"
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Report Modal Portal */}
      {reportTarget && (
        <ReportModal
          type={reportTarget.type}
          targetId={reportTarget.id}
          targetText={reportTarget.text}
          reporterName={currentUser?.fullName}
          onClose={() => setReportTarget(null)}
          addToast={addToast || (() => {})}
        />
      )}
    </>
  );
}
