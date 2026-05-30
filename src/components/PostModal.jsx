import React, { useState, useEffect } from 'react';
import Dropdown from './Dropdown';

const CITIES = ["თბილისი", "ბათუმი", "ქუთაისი", "რუსთავი", "გორი", "ზუგდიდი", "ფოთი", "თელავი", "ახალციხე", "დისტანციური"];

export default function PostModal({ editPostData, onSubmit, onClose, addToast }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [city, setCity] = useState(CITIES[0]);
  const [image, setImage] = useState(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  useEffect(() => {
    if (editPostData) {
      setTitle(editPostData.title || '');
      setDesc(editPostData.desc || '');
      setCity(editPostData.location || CITIES[0]);
      setImage(editPostData.image || null);
    } else {
      setTitle('');
      setDesc('');
      setCity(CITIES[0]);
      setImage(null);
    }
  }, [editPostData]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiGenerate = () => {
    if (!title.trim()) {
      addToast('გთხოვთ ჯერ ჩაწეროთ სათაური, რათა AI-მ შეძლოს გენერირება', 'error');
      return;
    }
    setIsAiGenerating(true);
    setDesc('გენერირება...');
    
    setTimeout(() => {
      setDesc(`გამარჯობა, მე ვარ სერტიფიცირებული პედაგოგი. გთავაზობთ ${title}-ის კურსებს თანამედროვე მეთოდებით. ინდივიდუალური მიდგომა, მოქნილი განრიგი. დამიკავშირდით!`);
      setIsAiGenerating(false);
      addToast('AI ტექსტი მზადაა ✓');
    }, 900);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim() || !city) {
      addToast('გთხოვთ შეავსოთ სათაური და აღწერა', 'error');
      return;
    }
    onSubmit({
      title: title.trim(),
      desc: desc.trim(),
      location: city,
      image: image,
    });
  };

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="glass-panel modal-box w-full max-w-[520px] rounded-[20px] p-7 relative border border-[#27272a] text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-transparent border-none text-[#71717a] hover:text-white cursor-pointer text-lg p-1 transition-colors rounded-md"
        >
          <i className="fas fa-times"></i>
        </button>

        <h2 className="text-[18px] font-bold text-white m-0 mb-5 font-['Noto_Sans_Georgian']">
          {editPostData ? 'პოსტის რედაქტირება' : 'პოსტის შექმნა'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-['Noto_Sans_Georgian']">
          <div className="relative">
            <input
              type="text"
              placeholder="სათაური"
              className="tc-input pr-20"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isAiGenerating}
            />
            <button
              type="button"
              onClick={handleAiGenerate}
              className="btn-ai"
              disabled={isAiGenerating}
            >
              <i className="fas fa-magic"></i> AI
            </button>
          </div>

          <textarea
            placeholder="აღწერა..."
            className="tc-input min-h-[110px]"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            disabled={isAiGenerating}
          ></textarea>

          <div className="grid grid-cols-2 gap-3">
            <Dropdown
              options={CITIES}
              selected={city}
              onChange={setCity}
              placeholder="ქალაქი"
              icon="📍"
            />
            <label className="file-label">
              <i className="fas fa-image text-[#6366f1]"></i>
              <span>{image ? 'ფოტო არჩეულია' : 'ფოტო'}</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>

          {image && (
            <div className="relative mt-2">
              <img
                src={image}
                alt="Upload preview"
                className="w-full h-40 object-cover rounded-lg border border-[#27272a]"
              />
              <button
                type="button"
                onClick={() => setImage(null)}
                className="absolute top-2 right-2 bg-[rgba(239,68,68,0.8)] hover:bg-[#ef4444] text-white border-none rounded-full w-[26px] height-[26px] h-[26px] cursor-pointer flex items-center justify-center text-xs transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}

          <button type="submit" className="btn-brand mt-2">
            {editPostData ? 'შენახვა' : 'გამოქვეყნება'}
          </button>
        </form>
      </div>
    </div>
  );
}
