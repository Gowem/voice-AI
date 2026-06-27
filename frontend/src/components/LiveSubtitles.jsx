import { useEffect, useRef, useState } from 'react';

function Typewriter({ text, speed = 18 }) {
  const [shown, setShown] = useState('');
  const idRef = useRef(null);

  useEffect(() => {
    clearInterval(idRef.current);
    setShown('');
    if (!text) return;
    let i = 0;
    idRef.current = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(idRef.current);
    }, speed);
    return () => clearInterval(idRef.current);
  }, [text, speed]);

  return (
    <span className={shown.length < (text?.length || 0) ? 'caption-cursor' : ''}>
      {shown}
    </span>
  );
}

/**
 * Full scrolling conversation subtitles overlay — shows every message.
 */
export default function LiveSubtitles({ messages = [], interimText, isListening }) {
  const endRef      = useRef(null);
  const lastBotId   = [...messages].reverse().find((m) => m.role === 'assistant')?.id;

  // Scroll to bottom whenever messages change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, interimText]);

  if (!messages.length && !(isListening && interimText)) return null;

  return (
    <div className="w-full max-w-lg mx-auto px-4 flex flex-col gap-1.5 max-h-[38vh] overflow-y-auto subtitle-scroll">

      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`caption-in flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`rounded-2xl px-3.5 py-2 text-sm leading-snug max-w-[88%] ${
              msg.role === 'user'
                ? 'bg-white/12 text-white/65 italic rounded-br-sm'
                : 'bg-black/75 backdrop-blur-sm text-white font-medium rounded-bl-sm'
            }`}
          >
            {/* Only typewriter on the latest bot message */}
            {msg.role === 'assistant' && msg.id === lastBotId
              ? <Typewriter key={msg.id} text={msg.text} speed={18} />
              : msg.text
            }
          </div>
        </div>
      ))}

      {/* Live interim — what user is saying right now */}
      {isListening && interimText && (
        <div className="caption-in flex justify-end">
          <div className="rounded-2xl rounded-br-sm px-3.5 py-2 max-w-[88%] border border-white/10">
            <p className="text-white/30 text-sm italic leading-snug">{interimText}</p>
          </div>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}
