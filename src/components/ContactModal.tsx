import React, { useState } from 'react';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { mcAudio } from '../utils/audio';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const dev = PORTFOLIO_DATA.developer;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mcAudio.playClick();
    setIsSent(true);
    const mailto = `mailto:${dev.email}?subject=Message from ${encodeURIComponent(name)}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}`;
    window.open(mailto, '_blank');
    setTimeout(() => {
      setIsSent(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none animate-fadeIn">
      <div className="mc-window w-full max-w-md p-6 text-black shadow-2xl relative">
        <h3 className="text-xl font-bold mb-3 text-center text-black mc-text-shadow-dark">
          Contact Me
        </h3>

        <p className="text-xs text-center text-gray-700 mb-4">
          Want to collaborate or discuss an opportunity? Leave a message!
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-gray-800 mb-1">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full p-2 bg-black text-white border-2 border-[#555] focus:outline-none focus:border-white font-mono text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="w-full p-2 bg-black text-white border-2 border-[#555] focus:outline-none focus:border-white font-mono text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">Message</label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your message..."
              className="w-full p-2 bg-black text-white border-2 border-[#555] focus:outline-none focus:border-white font-mono text-xs resize-none"
            />
          </div>

          {isSent ? (
            <div className="p-2 bg-green-200 border border-green-700 text-green-900 font-bold text-center">
              Message dispatched! Opening mail client...
            </div>
          ) : (
            <div className="flex justify-center gap-3 pt-3">
              <button
                type="submit"
                className="minecraft-button"
                style={{ width: '150px', height: '40px', fontSize: '13px' }}
              >
                Send Message
              </button>

              <button
                type="button"
                onClick={() => {
                  mcAudio.playClick();
                  onClose();
                }}
                className="minecraft-button"
                style={{ width: '120px', height: '40px', fontSize: '13px' }}
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

