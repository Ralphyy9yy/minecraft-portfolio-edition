import React, { useState } from 'react';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { mcAudio } from '../utils/audio';
import { useDialog } from '../hooks/useDialog';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const dev = PORTFOLIO_DATA.developer;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isDraftPrepared, setIsDraftPrepared] = useState(false);
  const closeDialog = () => { setIsDraftPrepared(false); onClose(); };
  const dialogRef = useDialog(isOpen, closeDialog);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mcAudio.playClick();
    setIsDraftPrepared(true);
    const mailto = `mailto:${dev.email}?subject=Message from ${encodeURIComponent(name)}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}`;
    window.location.href = mailto;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none animate-fadeIn">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="contact-title" aria-describedby="contact-description" tabIndex={-1} className="mc-window modal-content w-full max-w-md p-4 sm:p-6 text-black shadow-2xl relative">
        <h2 id="contact-title" className="text-xl font-bold mb-3 text-center text-black">
          Contact Me
        </h2>

        <p id="contact-description" className="reading-text text-sm text-center text-gray-800 mb-4">
          Want to collaborate? Compose a message below, then review and send it in your email app.
        </p>
        <a className="reading-text block text-center text-sm underline mb-4 break-all" href={`mailto:${dev.email}`}>{dev.email}</a>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label htmlFor="contact-name" className="block font-bold text-gray-800 mb-1">Name</label>
            <input
              id="contact-name"
              name="name"
              autoComplete="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full p-2 bg-black text-white border-2 border-[#555] focus:outline-none focus:border-white font-mono text-xs"
            />
          </div>

          <div>
            <label htmlFor="contact-email" className="block font-bold text-gray-800 mb-1">Email</label>
            <input
              id="contact-email"
              name="email"
              autoComplete="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="w-full p-2 bg-black text-white border-2 border-[#555] focus:outline-none focus:border-white font-mono text-xs"
            />
          </div>

          <div>
            <label htmlFor="contact-message" className="block font-bold text-gray-800 mb-1">Message</label>
            <textarea
              id="contact-message"
              name="message"
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your message..."
              className="w-full p-2 bg-black text-white border-2 border-[#555] focus:outline-none focus:border-white font-mono text-xs resize-none"
            />
          </div>

          {isDraftPrepared && (
            <div role="status" className="reading-text p-2 bg-green-200 border border-green-700 text-green-900 text-center">
              Your email app should open with a draft. Review and send it there. If nothing opens, use the email link above.
            </div>
          )}
            <div className="flex flex-wrap justify-center gap-3 pt-3">
              <button
                type="submit"
                className="minecraft-button"
                style={{ minWidth: '150px', height: '44px', fontSize: '12px', paddingInline: '12px' }}
              >
                Open Email App
              </button>

              <button
                type="button"
                onClick={() => {
                  mcAudio.playClick();
                  closeDialog();
                }}
                className="minecraft-button"
                style={{ width: '120px', height: '40px', fontSize: '13px' }}
              >
                Cancel
              </button>
            </div>
        </form>
      </div>
    </div>
  );
};

