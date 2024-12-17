import React, { useState } from 'react';
import { Copy, Check, Video } from 'lucide-react';

const CreateMeetLink = () => {
  const [meetLink, setMeetLink] = useState('');
  const [copied, setCopied] = useState(false);

  // Generate a random meeting code similar to Google Meet format
  const generateMeetCode = () => {
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    const codeLength = 3;
    const segmentLength = 4;
    let code = '';

    for (let i = 0; i < codeLength; i++) {
      for (let j = 0; j < segmentLength; j++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      if (i < codeLength - 1) code += '-';
    }

    return code;
  };

  const handleCreateMeeting = () => {
    const meetCode = generateMeetCode();
    const newMeetLink = `https://meet.google.com/${meetCode}`;
    setMeetLink(newMeetLink);
    window.open(newMeetLink, '_blank');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(meetLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      {/* Create Meeting Button */}
      <button
        onClick={handleCreateMeeting}
        className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors duration-300 font-poppins flex items-center space-x-2"
      >
        <Video className="w-5 h-5" />
        <span>Create New Meeting</span>
      </button>

      {/* Display Meet Link */}
      {meetLink && (
        <div className="w-full max-w-md bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={meetLink}
              readOnly
              className="flex-1 p-2 bg-white border rounded font-poppins text-sm"
            />
            <button
              onClick={copyToClipboard}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-300"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>
          
          {copied && (
            <p className="text-green-500 text-sm mt-2 font-poppins">
              Link copied to clipboard!
            </p>
          )}
          
          <p className="text-sm text-gray-500 mt-2 font-poppins">
            Share this link with others to join the meeting
          </p>
        </div>
      )}
    </div>
  );
};

export default CreateMeetLink; 