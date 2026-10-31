import React, { useState } from 'react';
import { Mic, MicOff, Sparkles, Volume2 } from 'lucide-react';

export default function VoiceAssistant({ onTranscriptReceived }) {
  const [listening, setListening] = useState(false);
  const [statusText, setStatusText] = useState('');

  const handleToggleMic = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Chrome/Edge or type manually.');
      return;
    }

    if (listening) {
      setListening(false);
      setStatusText('');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setListening(true);
      setStatusText('Listening... Speak surplus food details (e.g. 150 meals cooked 2 hours ago)');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setStatusText(`Voice captured: "${transcript}"`);
      if (onTranscriptReceived) {
        onTranscriptReceived(transcript);
      }
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
      setStatusText('Voice input error. Please try speaking again.');
    };

    recognition.start();
  };

  return (
    <div className="flex flex-col items-start space-y-1.5">
      <button
        type="button"
        onClick={handleToggleMic}
        className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
          listening
            ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
        }`}
      >
        {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        <span>{listening ? 'Stop Voice Dictation' : 'Voice Assistant (Deepgram)'}</span>
      </button>

      {statusText && (
        <span className="text-[11px] text-emerald-300 italic">{statusText}</span>
      )}
    </div>
  );
}
