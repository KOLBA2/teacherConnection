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

// ფილტრის კატეგორიები
const SUBJECT_CATEGORIES = [
  'მათემატიკა', 
  'ინგლისური', 
  'ფიზიკა', 
  'ქართული', 
  'ისტორია',
  'გიტარა', 
  'პროგრამირება/დეველოპმენტი', 
  'დიზაინი', 
  'უცხო ენები', 
  'ხელოვნება'
];

// სატესტო (Mock) მომხმარებლები
const mockUsers = [
  {
    id: 'teacher-qetino',
    name: 'ქეთინო',
    surname: 'ჩანქსელიანი',
    fullName: 'ქეთინო ჩანქსელიანი',
    email: 'qetino@test.ge',
    phone: '555111111',
    pass: '123',
    role: 'teacher',
    personalId: '01010101010',
    avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
    saved: []
  },
  {
    id: 'teacher-marina',
    name: 'მარინა',
    surname: 'კაციტაძე',
    fullName: 'მარინა კაციტაძე',
    email: 'marina@test.ge',
    phone: '555222222',
    pass: '123',
    role: 'teacher',
    personalId: '02020202020',
    avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    saved: []
  },
  {
    id: 'student-luka',
    name: 'ლუკა',
    surname: 'გიორგაძე',
    fullName: 'ლუკა გიორგაძე',
    email: 'luka@test.ge',
    phone: '555333333',
    pass: '123',
    role: 'student',
    personalId: '03030303030',
    avatar: 'https://randomuser.me/api/portraits/men/43.jpg',
    saved: ['mock-post-3'] 
  }
];

// სატესტო პოსტები
const mockPosts = [
  {
    id: 'mock-post-1',
    userId: 'teacher-qetino',
    title: 'მათემატიკის მომზადება ეროვნული გამოცდებისთვის',
    desc: 'ვამზადებ აბიტურიენტებს მათემატიკაში უახლესი პროგრამით. მაქვს 15 წლიანი გამოცდილება. გაკვეთილები ტარდება ონლაინ ან ადგილზე მოსვლით, მოსწავლის სურვილის მიხედვით.',
    subject: 'მათემატიკა',
    location: 'თბილისი',
    price: '150',
    timestamp: Date.now() - 86400000 * 2,
    ratings: {
      'student-luka': 5,
      'teacher-marina': 4
    },
    comments: [
      {
        id: 'mock-comment-1',
        userId: 'student-luka',
        text: 'საუკეთესო მასწავლებელი! ძალიან კარგად და მარტივად ხსნის რთულ მასალას.',
        timestamp: Date.now() - 3600000 * 5
      }
    ]
  },
  {
    id: 'mock-post-2',
    userId: 'teacher-marina',
    title: 'ინგლისური ენის კურსი A1-დან B2 დონემდე',
    desc: 'შეისწავლეთ ინგლისური ენა თანამედროვე მეთოდებით. ფოკუსირება სასაუბრო პრაქტიკაზე, მოსმენასა და გრამატიკაზე. პირველი საცდელი გაკვეთილი უფასოა.',
    subject: 'ინგლისური',
    location: 'ონლაინ',
    price: '120',
    timestamp: Date.now() - 86400000 * 1,
    ratings: {
      'student-luka': 5,
      'teacher-qetino': 5
    },
    comments: [
      {
        id: 'mock-comment-2',
        userId: 'student-luka',
        text: 'სასაუბრო ინგლისური საგრძნობლად გამიუმჯობესდა ამ კურსის დაწყების შემდეგ.',
        timestamp: Date.now() - 7200000
      }
    ]
  },
  {
    id: 'mock-post-3',
    userId: 'teacher-qetino',
    title: 'ფიზიკის ინდივიდუალური გაკვეთილები',
    desc: 'ვამზადებ სკოლის 8-12 კლასის მოსწავლეებს ფიზიკაში. დავეხმარები სასკოლო მასალის ათვისებაში და რთული ამოცანების ამოხსნაში.',
    subject: 'ფიზიკა',
    location: 'რუსთავი',
    price: '100',
    timestamp: Date.now() - 3600000 * 10,
    ratings: {
      'student-luka': 4
    },
    comments: []
  },
  {
    id: 'mock-post-4',
    userId: 'teacher-marina',
    title: 'Front-End ვებ დეველოპმენტი (React.js)',
    desc: 'შეისწავლეთ ვებ-პროგრამირება ნულიდან. ავაწყობთ რეალურ პროექტებს და მოგამზადებთ დასაქმებისთვის.',
    subject: 'პროგრამირება/დეველოპმენტი',
    location: 'ონლაინ',
    price: '250',
    timestamp: Date.now() - 3600000 * 2,
    ratings: {},
    comments: []
  }
];

// სატესტო გააქტიურებული კურსები
const mockSubscriptions = [
  {
    id: 'mock-sub-1',
    studentId: 'student-luka',
    teacherId: 'teacher-marina',
    postId: 'mock-post-2', 
    timestamp: Date.now() - 86400000
  }
];

export default function App() {
  // Global States
  const [users, setUsers] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('tc_users_v2'));
    return saved && saved.length > 0 ? saved : mockUsers;
  });
  const [posts, setPosts] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('tc_posts_v2'));
    return saved && saved.length > 0 ? saved : mockPosts;
  });
  const [currentUser, setCurrentUser] = useState(() => {
    return JSON.parse(localStorage.getItem('tc_curr_v2')) || null;
  });
  const [subscriptions, setSubscriptions] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('tc_subscriptions_v2'));
    return saved && saved.length > 0 ? saved : mockSubscriptions;
  });

  // UI Navigation States
  const [currentView, setCurrentView] = useState('all'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterSubject, setFilterSubject] = useState(''); 
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); 
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
    localStorage.setItem('tc_users_v2', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('tc_posts_v2', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('tc_subscriptions_v2', JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('tc_curr_v2', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('tc_curr_v2');
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

  // Keyboard shortcut
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
    setFilterSubject('');
    addToast('თქვენ გამოხვედით სისტემიდან');
  };

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
      setPosts((prev) =>
        prev.map((p) => (p.id === editPostData.id ? { ...p, ...postData } : p))
      );
      addToast('პოსტი განახლდა ✓');
      setEditPostData(null);
    } else {
      const newPost = {
        ...postData,
        id: Date.now().toString(),
        userId: currentUser.id,
        timestamp: Date.now(),
        ratings: {}, 
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
      const matchesSubject = filterSubject ? p.subject === filterSubject : true; 
      
      return matchesSearch && matchesLocation && matchesSubject;
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
                <div id="feed-container" className="flex flex-col gap-6">
                  
                  {/* Category Dropdown Filter UI - DARK THEME ADAPTED */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#18181b] p-4 sm:p-5 rounded-2xl border border-[#27272a] shadow-lg gap-4 transition-all">
                    <div className="flex items-center gap-3.5">
                      <div className="flex items-center justify-center w-11 h-11 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-200 text-[16px] tracking-tight">განცხადებების ფილტრი</h3>
                        <p className="text-sm text-indigo-400/80 font-medium mt-0.5">აირჩიე სასურველი საგანი</p>
                      </div>
                    </div>
                    
                    <div className="relative w-full sm:w-72 group">
                      <select
                        value={filterSubject}
                        onChange={(e) => setFilterSubject(e.target.value)}
                        className="block w-full appearance-none bg-[#0f0f11] border border-[#27272a] text-gray-200 py-3.5 px-4 pr-10 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 hover:border-[#3f3f46] transition-all cursor-pointer font-semibold shadow-sm"
                      >
                        <option value="" className="bg-[#0f0f11]">ყველა კატეგორია</option>
                        {SUBJECT_CATEGORIES.map(subject => (
                          <option key={subject} value={subject} className="bg-[#0f0f11]">{subject}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 group-hover:text-indigo-400 transition-colors">
                        <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Render Posts */}
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
                    // Empty State - DARK THEME ADAPTED
                    <div className="flex flex-col items-center justify-center bg-[#18181b] border-2 border-dashed border-[#27272a] rounded-3xl p-12 text-center mt-2 shadow-sm">
                      <div className="w-16 h-16 bg-[#0f0f11] rounded-2xl flex items-center justify-center text-[#3f3f46] mb-5 border border-[#27272a]">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <h3 className="text-gray-200 font-bold text-lg mb-2">პოსტები ვერ მოიძებნა</h3>
                      <p className="text-[15px] text-gray-400 max-w-[280px]">
                        არჩეულ კატეგორიაში განცხადებები ჯერჯერობით არ არის.
                      </p>
                      {filterSubject && (
                        <button 
                          onClick={() => setFilterSubject('')}
                          className="mt-6 px-6 py-2.5 bg-indigo-500/10 text-indigo-400 font-semibold rounded-xl hover:bg-indigo-500/20 border border-indigo-500/20 transition-colors"
                        >
                          ფილტრის გასუფთავება
                        </button>
                      )}
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
          posts={posts}
          setPosts={setPosts}
          onDeletePost={handleDeletePost}
          onClose={() => setActiveModal(null)}
          addToast={addToast}
        />
      )}
    </>
  );
}