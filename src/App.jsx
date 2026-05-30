import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PostCard from './components/PostCard';
import StatsGraph from './components/StatsGraph';
import PostModal from './components/PostModal';
import ProfileModal from './components/ProfileModal';
import PaymentModal from './components/PaymentModal';
import AdminPanel from './components/AdminPanel';
import Toast from './components/Toast';

export default function App() {
  // Global States loaded from localStorage
  const [users, setUsers] = useState(() => {
    return JSON.parse(localStorage.getItem('tc_users')) || [];
  });
  const [posts, setPosts] = useState(() => {
    return JSON.parse(localStorage.getItem('tc_posts')) || [];
  });
  const [currentUser, setCurrentUser] = useState(() => {
    return JSON.parse(localStorage.getItem('tc_curr')) || null;
  });
  const [subscriptions, setSubscriptions] = useState(() => {
    return JSON.parse(localStorage.getItem('tc_subscriptions')) || [];
  });

  // UI Navigation States
  const [currentView, setCurrentView] = useState('all'); // 'all' | 'mine' | 'saved' | 'stats' | 'subscribed'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'post' | 'profile' | null
  const [editPostData, setEditPostData] = useState(null);
  const [paymentPostData, setPaymentPostData] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Toast Helper
  const addToast = (message, type = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem('tc_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('tc_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('tc_subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('tc_curr', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('tc_curr');
    }
  }, [currentUser]);

  // Mouse Glow positioning effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const glow = document.getElementById('mouse-glow');
      if (glow) {
        glow.style.top = `${e.clientY}px`;
        glow.style.left = `${e.clientX}px`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Keyboard shortcut (Escape closes sidebar & modals)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveModal(null);
        setEditPostData(null);
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Window resize resets mobile sidebar state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handlers
  const handleLogin = (val, pass) => {
    const user = users.find((u) => (u.email === val || u.phone === val) && u.pass === pass);
    if (user) {
      const updatedUser = { ...user, saved: user.saved || [] };
      setCurrentUser(updatedUser);
      addToast(`${user.fullName}, მოგესალმებით!`);
    } else {
      addToast('არასწორი მომხმარებელი ან პაროლი', 'error');
    }
  };

  const handleRegister = (newUserData) => {
    const emailExists = users.some((u) => u.email === newUserData.email);
    if (emailExists) {
      addToast('ელ-ფოსტა უკვე დაკავებულია', 'error');
      return;
    }

    const phoneExists = users.some((u) => u.phone === newUserData.phone);
    if (phoneExists) {
      addToast('ტელეფონის ნომერი უკვე დაკავებულია', 'error');
      return;
    }

    const newUser = {
      ...newUserData,
      id: Date.now().toString(),
      saved: [],
    };

    setUsers((prev) => [...prev, newUser]);
    addToast('რეგისტრაცია წარმატებით დასრულდა ✓');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('all');
    setSearchQuery('');
    setFilterLocation('');
    addToast('თქვენ გამოხვედით სისტემიდან');
  };

  // Star Rating System submission handler
  const handleRatePost = (postId, starValue) => {
    if (!currentUser) return;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const currentRatings = p.ratings || {};
          const isRemoving = currentRatings[currentUser.id] === starValue;
          
          const newRatings = { ...currentRatings };
          if (isRemoving) {
            delete newRatings[currentUser.id];
            addToast('შეფასება გაუქმდა');
          } else {
            newRatings[currentUser.id] = starValue;
            addToast(`შეფასდა ${starValue} ვარსკვლავით ★`);
          }
          return { ...p, ratings: newRatings };
        }
        return p;
      })
    );
  };

  const handleToggleSave = (postId) => {
    if (!currentUser) return;
    const savedList = currentUser.saved || [];
    const idx = savedList.indexOf(postId);
    let updatedSaved = [...savedList];

    if (idx === -1) {
      updatedSaved.push(postId);
      addToast('პოსტი შენახულია');
    } else {
      updatedSaved.splice(idx, 1);
      addToast('შენახვა გაუქმდა');
    }

    const updatedUser = { ...currentUser, saved: updatedSaved };
    setCurrentUser(updatedUser);

    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? updatedUser : u))
    );
  };

  const handleAddComment = (postId, text) => {
    if (!currentUser) return;
    const newComment = {
      id: Date.now().toString(),
      userId: currentUser.id,
      text: text,
      timestamp: Date.now(),
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return { ...p, comments: [...(p.comments || []), newComment] };
        }
        return p;
      })
    );
    addToast('კომენტარი დაემატა');
  };

  const handleDeleteComment = (postId, commentId) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return { ...p, comments: (p.comments || []).filter((c) => c.id !== commentId) };
        }
        return p;
      })
    );
    addToast('კომენტარი წაიშალა');
  };

  const handlePostSubmit = (postData) => {
    if (!currentUser) return;

    if (editPostData) {
      // Editing Mode
      setPosts((prev) =>
        prev.map((p) => (p.id === editPostData.id ? { ...p, ...postData } : p))
      );
      addToast('პოსტი განახლდა ✓');
      setEditPostData(null);
    } else {
      // Creation Mode
      const newPost = {
        ...postData,
        id: Date.now().toString(),
        userId: currentUser.id,
        timestamp: Date.now(),
        ratings: {}, // replaced likes array with ratings object: { [userId]: ratingValue }
        comments: [],
      };
      setPosts((prev) => [newPost, ...prev]);
      addToast('პოსტი წარმატებით გამოქვეყნდა ✓');
    }
    setActiveModal(null);
  };

  const handleDeletePost = (postId) => {
    if (window.confirm('დარწმუნებული ხართ, რომ გსურთ პოსტის წაშლა?')) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      addToast('პოსტი წაიშალა');
    }
  };

  const handleUploadAvatar = (base64Image) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, avatar: base64Image };
    setCurrentUser(updatedUser);

    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? updatedUser : u))
    );
  };

  const handleSubscribe = (postId, teacherId) => {
    if (!currentUser) return;
    const alreadySubbed = subscriptions.some(s => s.studentId === currentUser.id && s.postId === postId);
    if (alreadySubbed) {
      addToast('თქვენ უკვე გააქტიურებული გაქვთ ეს კურსი', 'error');
      return;
    }
    const newSub = {
      id: Date.now().toString(),
      studentId: currentUser.id,
      teacherId: teacherId,
      postId: postId,
      timestamp: Date.now()
    };
    setSubscriptions(prev => [...prev, newSub]);
    addToast('კურსი წარმატებით გააქტიურდა! სწავლა დაიწყო ✓');
  };

  const handleCancelCourse = (postId) => {
    if (!currentUser) return;
    if (!window.confirm('დარწმუნებული ხართ, რომ გსურთ კურსის გაუქმება?')) return;
    setSubscriptions(prev =>
      prev.filter(s => !(s.studentId === currentUser.id && s.postId === postId))
    );
    addToast('კურსი გაუქმდა');
  };

  // Feed Filter computations
  const getFilteredPosts = () => {
    let list = [...posts].sort((a, b) => b.timestamp - a.timestamp);

    if (currentView === 'mine') {
      list = list.filter((p) => p.userId === currentUser?.id);
    } else if (currentView === 'saved') {
      const savedIds = currentUser?.saved || [];
      list = list.filter((p) => savedIds.includes(p.id));
    } else if (currentView === 'subscribed') {
      const activePostIds = subscriptions
        .filter((sub) => sub.studentId === currentUser?.id)
        .map((sub) => sub.postId);
      list = list.filter((p) => activePostIds.includes(p.id));
    }

    return list.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation = filterLocation ? p.location === filterLocation : true;
      return matchesSearch && matchesLocation;
    });
  };

  const filteredPosts = getFilteredPosts();

  return (
    <>
      <div id="mouse-glow"></div>
      <Toast toasts={toasts} setToasts={setToasts} />

      {/* Auth Screen */}
      {!currentUser ? (
        <Auth
          onLogin={handleLogin}
          onRegister={handleRegister}
          addToast={addToast}
        />
      ) : (
        /* Dashboard Screen */
        <div id="dashboard" className="block min-h-screen relative">
          <Sidebar
            currentUser={currentUser}
            currentView={currentView}
            setFeedMode={setCurrentView}
            openPostModal={() => {
              setEditPostData(null);
              setActiveModal('post');
            }}
            onOpenProfile={() => setActiveModal('profile')}
            onOpenAdmin={() => setActiveModal('admin')}
            onLogout={handleLogout}
            sidebarOpen={sidebarOpen}
            closeSidebar={() => setSidebarOpen(false)}
          />

          <div id="main-content">
            <Header
              currentView={currentView}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterLocation={filterLocation}
              setFilterLocation={setFilterLocation}
              sidebarOpen={sidebarOpen}
              toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            />

            {/* Dashboard Workspace */}
            <div className="p-4 md:p-8">
              {currentView === 'stats' ? (
                <StatsGraph
                  users={users}
                  posts={posts}
                  subscriptions={subscriptions}
                  currentUser={currentUser}
                />
              ) : (
                /* Feed Workspace Container */
                <div id="feed-container">
                  {filteredPosts.length > 0 ? (
                    filteredPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        currentUser={currentUser}
                        users={users}
                        subscriptions={subscriptions}
                        onEditPost={(p) => {
                          setEditPostData(p);
                          setActiveModal('post');
                        }}
                        onDeletePost={handleDeletePost}
                        onRatePost={handleRatePost}
                        onToggleSave={handleToggleSave}
                        onAddComment={handleAddComment}
                        onDeleteComment={handleDeleteComment}
                        onStartPayment={(p) => setPaymentPostData(p)}
                        onCancelCourse={handleCancelCourse}
                        addToast={addToast}
                      />
                    ))
                  ) : (
                    <div className="text-center text-[#52525b] mt-12 text-[15px] font-['Noto_Sans_Georgian']">
                      პოსტები არ მოიძებნა
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals Mounting Portal */}
      {activeModal === 'post' && (
        <PostModal
          editPostData={editPostData}
          onSubmit={handlePostSubmit}
          onClose={() => {
            setActiveModal(null);
            setEditPostData(null);
          }}
          addToast={addToast}
        />
      )}

      {activeModal === 'profile' && (
        <ProfileModal
          currentUser={currentUser}
          onUploadAvatar={handleUploadAvatar}
          onClose={() => setActiveModal(null)}
          addToast={addToast}
          onLogout={handleLogout}
        />
      )}

      {/* Payment Modal Portal */}
      {paymentPostData && (
        <PaymentModal
          post={paymentPostData}
          teacher={users.find((u) => u.id === paymentPostData.userId) || {}}
          onConfirm={() => {
            handleSubscribe(paymentPostData.id, paymentPostData.userId);
          }}
          onClose={() => setPaymentPostData(null)}
          addToast={addToast}
        />
      )}

      {/* Admin Panel Modal */}
      {activeModal === 'admin' && (
        <AdminPanel
          currentUser={currentUser}
          onClose={() => setActiveModal(null)}
        />
      )}
    </>
  );
}
