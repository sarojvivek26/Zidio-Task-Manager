import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaVideo, FaTimes } from 'react-icons/fa';
import { Transition } from '@headlessui/react';

const MeetingNotification = ({ meetingId, onClose }) => {
  const navigate = useNavigate();
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');
  const [error, setError] = useState('');

  const handleJoinClick = () => {
    setShowJoinDialog(true);
  };

  const handleJoinMeeting = () => {
    if (meetingLink) {
      // Extract meeting ID from the link
      const url = new URL(meetingLink);
      const pathParts = url.pathname.split('/');
      const meetingIdFromLink = pathParts[pathParts.length - 1];
      
      if (meetingIdFromLink) {
        navigate(`/meetings/${meetingIdFromLink}`);
      } else {
        setError('Invalid meeting link');
      }
    } else {
      setError('Please enter a meeting link');
    }
  };

  const handlePasteLink = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setMeetingLink(text);
      setError('');
    } catch (err) {
      setError('Could not access clipboard');
    }
  };

  return (
    <>
      {/* Notification */}
      <Transition
        show={!showJoinDialog}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed bottom-4 right-4 bg-dark-card p-4 rounded-lg shadow-lg max-w-md z-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FaVideo className="text-primary" />
              <span className="text-white font-medium">Meeting in Progress</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <FaTimes />
            </button>
          </div>
          <p className="text-gray-300 text-sm mb-4">
            A meeting is currently active. Would you like to join?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleJoinClick}
              className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Join Meeting
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-dark-lighter text-white px-4 py-2 rounded-lg hover:bg-dark-lighter/90 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </Transition>

      {/* Join Dialog */}
      <Transition
        show={showJoinDialog}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-card p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-xl font-medium">Join Meeting</h2>
              <button
                onClick={() => setShowJoinDialog(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-300 text-sm mb-2">
                Meeting Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="Paste meeting link here"
                  className="flex-1 bg-dark-lighter text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={handlePasteLink}
                  className="bg-dark-lighter text-white px-4 py-2 rounded-lg hover:bg-dark-lighter/90 transition-colors"
                >
                  Paste
                </button>
              </div>
              {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleJoinMeeting}
                className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Join
              </button>
              <button
                onClick={() => setShowJoinDialog(false)}
                className="flex-1 bg-dark-lighter text-white px-4 py-2 rounded-lg hover:bg-dark-lighter/90 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </>
  );
};

export default MeetingNotification; 