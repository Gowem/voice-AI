import { useCallback, useRef } from 'react';
import LiveSubtitles from './LiveSubtitles';

const STATUS_DOT = {
  idle:       { color: 'bg-white/20',                 label: 'Offline' },
  connecting: { color: 'bg-yellow-400 animate-pulse', label: 'Connecting…' },
  ready:      { color: 'bg-green-400 animate-pulse',  label: 'Live' },
  speaking:   { color: 'bg-blue-400 animate-pulse',   label: 'Speaking' },
  error:      { color: 'bg-red-400',                  label: 'Error' },
};

/**
 * Full-screen avatar view.
 *
 * Props:
 *   status        — 'idle'|'connecting'|'ready'|'speaking'|'error'
 *   persona       — active persona object
 *   messages      — conversation history [{role, text, id}]
 *   interimText   — live interim transcript
 *   error         — error string from Anam
 *   isListening   — mic active
 *   personaList   — array of all personas (for dot indicators)
 *   personaIndex  — index of active persona
 *   onNext()      — swipe left callback
 *   onPrev()      — swipe right callback
 */
export default function AvatarView({
  status,
  persona,
  messages = [],
  interimText,
  error,
  isListening,
  personaList = [],
  personaIndex = 0,
  onNext,
  onPrev,
}) {
  const dot = STATUS_DOT[status] || STATUS_DOT.idle;
  const showVideo = status === 'ready' || status === 'speaking' || status === 'connecting';

  // ── Swipe handling ───────────────────────────────────────────────────────
  const touchRef = useRef({ x: 0, y: 0 });
  const mouseRef = useRef({ x: 0, down: false });

  const handleTouchStart = useCallback((e) => {
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback((e) => {
    const dx = e.changedTouches[0].clientX - touchRef.current.x;
    const dy = e.changedTouches[0].clientY - touchRef.current.y;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 48) {
      dx < 0 ? onNext?.() : onPrev?.();
    }
  }, [onNext, onPrev]);

  const handleMouseDown = useCallback((e) => {
    mouseRef.current = { x: e.clientX, down: true };
  }, []);

  const handleMouseUp = useCallback((e) => {
    if (!mouseRef.current.down) return;
    mouseRef.current.down = false;
    const dx = e.clientX - mouseRef.current.x;
    if (Math.abs(dx) > 60) dx < 0 ? onNext?.() : onPrev?.();
  }, [onNext, onPrev]);

  // ────────────────────────────────────────────────────────────────────────

  return (
    <div
      className="relative w-full h-full bg-[#0a0a0f] overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* Avatar video + audio */}
      <audio id="anam-audio" autoPlay hidden />
      <video
        id="anam-video"
        autoPlay
        playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
          showVideo && status !== 'connecting' ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Vignette */}
      <div className="avatar-vignette absolute inset-0 pointer-events-none" />

      {/* Idle / Connecting placeholder */}
      {(status === 'idle' || status === 'connecting') && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6">
          {persona?.avatarImageUrl ? (
            <img
              src={persona.avatarImageUrl}
              alt={persona.name}
              className={`w-32 h-32 sm:w-44 sm:h-44 rounded-full object-cover border-2 border-white/10 shadow-2xl ${
                status === 'connecting' ? 'animate-pulse' : ''
              }`}
            />
          ) : (
            <div className={`text-7xl sm:text-9xl ${status === 'connecting' ? 'animate-pulse' : ''}`}>
              {persona?.emoji || '🤖'}
            </div>
          )}

          <div className="text-center">
            <p className="text-white font-bold text-xl">{persona?.name}</p>
            {persona?.description && (
              <p className="text-white/40 text-sm mt-1">{persona.description}</p>
            )}
          </div>

          {status === 'idle' && (
            <p className="text-white/40 text-xs tracking-wide mt-2">
              Swipe to change avatar · Press <span className="text-white/70 font-semibold">Start</span>
            </p>
          )}

          {status === 'connecting' && (
            <div className="flex gap-2 items-center mt-2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-white/50"
                  style={{ animation: `bounce 0.9s ${i * 0.15}s ease-in-out infinite` }}
                />
              ))}
              <span className="text-white/50 text-sm ml-1">Starting avatar…</span>
            </div>
          )}
        </div>
      )}

      {/* Equalizer — avatar speaking */}
      {status === 'speaking' && (
        <div
          className="absolute left-1/2 -translate-x-1/2 flex items-end gap-[3px]"
          style={{ bottom: '212px', height: '20px' }}
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="w-[3px] bg-white/50 rounded-full origin-bottom"
              style={{ height: '100%', animation: `eq 0.5s ${i * 0.06}s ease-in-out infinite` }}
            />
          ))}
        </div>
      )}

      {/* Bottom gradient */}
      <div className="bottom-fade absolute bottom-0 left-0 right-0 h-80 pointer-events-none" />

      {/* ── Persona dot indicators ── */}
      {personaList.length > 1 && (
        <div
          className="absolute left-0 right-0 flex justify-center items-center gap-1.5"
          style={{ bottom: '136px' }}
        >
          {personaList.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === personaIndex ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      )}

      {/* ── Live conversation subtitles ── */}
      <div
        className="absolute left-0 right-0"
        style={{ bottom: '158px' }}
      >
        <LiveSubtitles
          messages={messages}
          interimText={interimText}
          isListening={isListening}
        />
      </div>

      {/* ── Status badge ── */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
        <span className={`w-1.5 h-1.5 rounded-full ${dot.color}`} />
        <span className="text-white/60 text-xs">{dot.label}</span>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-red-500/20 border border-red-500/30 backdrop-blur-sm text-red-300 text-xs px-4 py-2 rounded-full whitespace-nowrap max-w-[90vw] text-center">
          {error}
        </div>
      )}
    </div>
  );
}
