import React, { useState, useRef, useEffect } from 'react';

export default function Auth({ onLogin, onRegister, addToast }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [showTutorialHelp, setShowTutorialHelp] = useState(false); // საინფორმაციო შეტყობინების სტეიტი
  
  // Ref იმისთვის, რომ მივხვდეთ სად დააკლიკა მომხმარებელმა
  const helpContainerRef = useRef(null);

  // Login Form States
  const [logUser, setLogUser] = useState('');
  const [logPass, setLogPass] = useState('');

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regSurname, setRegSurname] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regRole, setRegRole] = useState('student');
  const [personalId, setPersonalId] = useState(''); // 11-character personal ID
  const [selfieData, setSelfieData] = useState('');
  const [idFileUploaded, setIdFileUploaded] = useState(false);

  // Webcam states
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // ეფექტი, რომელიც უსმენს გარეთ დაწკაპუნებას
  useEffect(() => {
    function handleClickOutside(event) {
      if (helpContainerRef.current && !helpContainerRef.current.contains(event.target)) {
        setShowTutorialHelp(false);
      }
    }
    
    // ვამატებთ ივენთს ეკრანზე
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // ვასუფთავებთ ივენთს კომპონენტის წაშლისას
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!logUser || !logPass) {
      addToast('გთხოვთ შეავსოთ ყველა ველი', 'error');
      return;
    }
    onLogin(logUser, logPass);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regName || !regSurname || !regEmail || !regPhone || !regPass || !personalId) {
      addToast('გთხოვთ შეავსოთ ყველა ველი', 'error');
      return;
    }

    // Phone validation: 9 digits, starting with 5 (e.g. 5XXXXXXXX)
    if (!/^5\d{8}$/.test(regPhone)) {
      addToast('ტელეფონის ნომერი უნდა იყოს 9 ციფრიანი და იწყებოდეს 5-ით (5XXXXXXXX)', 'error');
      return;
    }

    // Strict 11-digit Personal ID validation
    if (!/^\d{11}$/.test(personalId)) {
      addToast('პირადი ნომერი უნდა შედგებოდეს ზუსტად 11 ციფრისგან!', 'error');
      return;
    }

    // Email validation
    if (!/\S+@\S+\.\S+/.test(regEmail)) {
      addToast('გთხოვთ შეიყვანოთ სწორი ელ-ფოსტა', 'error');
      return;
    }

    // Teacher verification check
    if (regRole === 'teacher') {
      if (!idFileUploaded) {
        addToast('მასწავლებლისთვის ID ბარათის ატვირთვა სავალდებულოა', 'error');
        return;
      }
      if (!selfieData) {
        addToast('მასწავლებლისთვის სელფი ვერიფიკაცია სავალდებულოა', 'error');
        return;
      }
    }

    const userData = {
      name: regName,
      surname: regSurname,
      fullName: `${regName} ${regSurname}`,
      email: regEmail,
      phone: regPhone,
      pass: regPass,
      role: regRole,
      personalId: personalId,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(regName)}+${encodeURIComponent(regSurname)}&background=6366f1&color=fff`,
    };

    onRegister(userData);
    
    // Reset fields
    setRegName('');
    setRegSurname('');
    setRegEmail('');
    setRegPhone('');
    setRegPass('');
    setRegRole('student');
    setPersonalId('');
    setSelfieData('');
    setIdFileUploaded(false);
    setActiveTab('login');
  };

  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
    } catch (err) {
      addToast('კამერა ვერ ჩაირთო. გთხოვთ შეამოწმოთ ნებართვები.', 'error');
      setCameraActive(false);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      setSelfieData(dataUrl);
      
      // Stop webcam stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      setCameraActive(false);
      addToast('სელფი წარმატებით გადაღებულია ✓');
    }
  };

  const handleIdFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setIdFileUploaded(true);
      addToast('ID ბარათის ასლი ატვირთულია ✓');
    }
  };

  return (
    <section id="auth-section">
      <div className="glass-panel w-full max-w-4xl rounded-2xl overflow-hidden flex flex-col md:flex-row" style={{ border: '1px solid #27272a' }}>
        
        {/* Left Panel */}
        <div className="hidden md:flex flex-col justify-center p-10 auth-left-gradient" style={{ width: '45%', position: 'relative' }}>
          <h1 className="text-3xl font-extrabold text-white mb-2 font-['Noto_Sans_Georgian']">TeacherConnect</h1>
          <p className="text-[#71717a] mb-8 text-[15px]">პლატფორმა განათლებისთვის.</p>
          <div className="flex flex-col gap-4 text-sm text-[#a1a1aa]">
            <div className="flex items-center gap-3">
              <i className="fas fa-check-circle text-[#6366f1] text-base"></i> 11-ნიშნა პირადი ნომრის ვერიფიკაცია
            </div>
            <div className="flex items-center gap-3">
              <i className="fas fa-check-circle text-[#6366f1] text-base"></i> სელფი ვერიფიკაცია
            </div>
            <div className="flex items-center gap-3">
              <i className="fas fa-check-circle text-[#6366f1] text-base"></i> AI ასისტენტი პოსტებისთვის
            </div>
            <div className="flex items-center gap-3">
              <i className="fas fa-check-circle text-[#6366f1] text-base"></i> 5-ვარსკვლავიანი შეფასების სისტემა
            </div>
          </div>
          {/* Decorative circle */}
          <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(99,102,241,0.06)', pointerEvents: 'none' }}></div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 p-6 md:p-10 bg-[rgba(9,9,11,0.5)] relative">
          
          {/* Tutorial / Registration Help Button (კონტეინერი ref-ით) */}
          <div className="absolute top-4 right-4 z-20" ref={helpContainerRef}>
            <button
              type="button"
              onClick={() => setShowTutorialHelp(!showTutorialHelp)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-[#27272a] border border-[#3f3f46] text-[#a1a1aa] hover:text-white hover:border-[#52525b] transition-all cursor-pointer"
              title="ვერ რეგისტრირდებით?"
            >
              <i className="fas fa-info-circle text-base"></i>
            </button>
            
            {showTutorialHelp && (
              <div className="absolute right-0 mt-2 p-4 bg-[#18181b] border border-[#27272a] rounded-xl shadow-2xl w-64 text-xs text-[#a1a1aa] leading-relaxed z-50 font-['Noto_Sans_Georgian']">
                <p className="font-semibold text-white mb-1.5 flex items-center gap-1.5">
                  <i className="fas fa-tools text-[#6366f1]"></i> რეგისტრაციის დახმარება
                </p>
                ვერ ახერხებთ რეგისტრაციას? გაცნობებთ, რომ ჩვენ აქტიურად ვმუშაობთ ამ ფუნქციონალის გაუმჯობესებაზე და ის მალე სრულად ხელმისაწვდომი იქნება!
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-6 border-b border-[#27272a] mb-7">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`auth-tab ${activeTab === 'login' ? 'active' : 'inactive'}`}
            >
              შესვლა
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`auth-tab ${activeTab === 'register' ? 'active' : 'inactive'}`}
            >
              რეგისტრაცია
            </button>
          </div>

          {/* Login Form */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="ელ-ფოსტა ან ნომერი"
                className="tc-input"
                value={logUser}
                onChange={(e) => setLogUser(e.target.value)}
              />
              <input
                type="password"
                placeholder="პაროლი"
                className="tc-input"
                value={logPass}
                onChange={(e) => setLogPass(e.target.value)}
              />
              <button type="submit" className="btn-brand">შესვლა</button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} id="register-form" className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="სახელი"
                  className="tc-input"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="გვარი"
                  className="tc-input"
                  value={regSurname}
                  onChange={(e) => setRegSurname(e.target.value)}
                />
              </div>
              <input
                type="email"
                placeholder="ელ-ფოსტა"
                className="tc-input"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
              <div>
                <input
                  type="text"
                  placeholder="ტელეფონი (5XX XX XX XX)"
                  maxLength={9}
                  className="tc-input"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                />
                <p className="text-[11px] text-[#52525b] mt-1 ml-1">მხოლოდ ციფრები, 9 ნიშნა</p>
              </div>

              {/* Personal ID input field ("გრაფა") */}
              <div>
                <input
                  type="text"
                  placeholder="პირადი ნომერი (11 ნიშნა)"
                  maxLength={11}
                  className="tc-input"
                  value={personalId}
                  onChange={(e) => setPersonalId(e.target.value.replace(/\D/g, ''))}
                  style={{ borderColor: personalId.length === 11 ? '#10b981' : personalId.length > 0 ? '#ef4444' : '' }}
                />
                <p className="text-[11px] text-[#52525b] mt-1 ml-1">
                  {personalId.length === 11 
                    ? '✓ 11-ნიშნა პირადი ნომერი სწორია' 
                    : `საჭიროა ზუსტად 11 ციფრი (შეყვანილია: ${personalId.length}/11)`
                  }
                </p>
              </div>

              <input
                type="password"
                placeholder="პაროლი"
                className="tc-input"
                value={regPass}
                onChange={(e) => setRegPass(e.target.value)}
              />
              <select
                className="tc-input"
                value={regRole}
                onChange={(e) => setRegRole(e.target.value)}
              >
                <option value="student">მოსწავლე</option>
                <option value="teacher">მასწავლებელი</option>
              </select>

              {/* Teacher verification section */}
              {regRole === 'teacher' && (
                <div id="teacher-verify" className="flex flex-col gap-4 border-t border-[#27272a] pt-4 mt-1">
                  <div className="p-3 bg-[rgba(234,179,8,0.08)] border border-[rgba(234,179,8,0.25)] rounded-xl text-[#ca8a04] text-[12px] flex items-center gap-2">
                    <i className="fas fa-id-card"></i>
                    <span>მასწავლებლებისთვის სავალდებულოა ვერიფიკაცია</span>
                  </div>
                  <div>
                    <label className="block text-[12px] text-[#71717a] mb-2 font-medium">ID ბარათის ასლი</label>
                    <label className="file-label">
                      <i className="fas fa-file-pdf text-[#6366f1]"></i>
                      {idFileUploaded ? 'ატვირთულია ✓' : 'ფაილის არჩევა'}
                      <input
                        type="file"
                        onChange={handleIdFileChange}
                        accept="image/*,application/pdf"
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                  <div>
                    <label className="block text-[12px] text-[#71717a] mb-2 font-medium">სელფი ვერიფიკაცია</label>
                    <div className="flex gap-2 mb-2">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="bg-[#3f3f46] hover:bg-[#52525b] px-4 py-2 rounded-lg text-xs text-white border-none cursor-pointer transition-colors"
                      >
                        კამერა
                      </button>
                      {cameraActive && (
                        <button
                          type="button"
                          onClick={takePhoto}
                          className="bg-[#16a34a] hover:bg-[#15803d] px-4 py-2 rounded-lg text-xs text-white border-none cursor-pointer transition-colors"
                        >
                          გადაღება
                        </button>
                      )}
                    </div>
                    {cameraActive && (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-32 object-cover rounded-lg border border-[#27272a] mb-2"
                      />
                    )}
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    {selfieData && (
                      <div className="relative">
                        <img
                          src={selfieData}
                          alt="Selfie verification preview"
                          className="w-full h-32 object-cover rounded-lg border border-[#16a34a]"
                        />
                        <span className="absolute top-2 right-2 bg-[#16a34a] text-white px-2 py-0.5 rounded text-[10px]">
                          სელფი მზადაა ✓
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <button type="submit" className="btn-brand mt-1">რეგისტრაცია</button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}