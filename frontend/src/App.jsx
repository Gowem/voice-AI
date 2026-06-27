import { useState, useCallback, useEffect } from 'react';
import { useAnam } from './hooks/useAnam';
import { useSpeech } from './hooks/useSpeech';
import { api } from './services/api';
import { PERSONAS, DEFAULT_PERSONA } from './constants/personas';
import AvatarView from './components/AvatarView';
import ControlBar from './components/ControlBar';
import SlidePanel from './components/SlidePanel';
import VoiceSelector from './components/VoiceSelector';
import Conversation from './components/Conversation';

function normalizeAnamPersona(p) {
  const gender  = p.voice?.gender || '';
  const country = p.voice?.country || 'US';
  return {
    id: p.id,
    name: p.name || 'Unknown',
    gender: gender === 'FEMALE' ? 'Female' : 'Male',
    language: 'en',
    langName: 'English',
    accent: country === 'GB' ? 'British' : 'American',
    emoji: gender === 'FEMALE' ? '👩‍💼' : '👨‍💼',
    recognitionLang: country === 'GB' ? 'en-GB' : 'en-US',
    description: p.personaDescription || '',
    voiceName: p.voice?.displayName || '',
    avatarImageUrl: p.avatar?.portraitImageUrl || p.avatar?.imageUrl || null,
    gradient: gender === 'FEMALE' ? 'from-pink-500 to-rose-600' : 'from-blue-600 to-indigo-700',
    _fromApi: true,
  };
}

export default function App() {
  const [personaList,  setPersonaList]  = useState(PERSONAS);
  const [personaIndex, setPersonaIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages,     setMessages]     = useState([]);
  const [panel,        setPanel]        = useState(null);

  const selectedPersona = personaList[personaIndex] || DEFAULT_PERSONA;
  const anam = useAnam();

  // ── Send message → backend → avatar speaks ───────────────────────────────
  const processMessage = useCallback(async (text) => {
    setIsProcessing(true);
    try {
      const result = await api.chat(text);
      addMessage({ role: 'assistant', text: result.response, type: result.type });
      await anam.speak(result.response);
    } catch (err) {
      addMessage({ role: 'assistant', text: err.message || 'Something went wrong.', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  }, [anam]);

  // ── PTT: fires when user releases the mic button ──────────────────────────
  const speech = useSpeech({
    onUtterance: useCallback((text) => {
      if (!text.trim()) return;
      addMessage({ role: 'user', text });
      processMessage(text);
    }, [processMessage]),
  });

  // Fetch real personas on mount
  useEffect(() => {
    api.getPersonas()
      .then((data) => {
        const raw = Array.isArray(data) ? data : (data.data || data.personas || []);
        if (raw.length > 0) {
          setPersonaList(raw.map(normalizeAnamPersona));
          setPersonaIndex(0);
        }
      })
      .catch(() => {});
  }, []);

  // ── Session control ───────────────────────────────────────────────────────

  async function handleStart() {
    setMessages([]);
    await anam.startSession(selectedPersona);
  }

  function handleStop() {
    speech.stop();
    anam.stopSession();
    setMessages([]);
  }

  // PTT — hold to record, release to send
  function handlePttStart() {
    if (isProcessing || anam.status === 'speaking') return;
    speech.start();
  }

  function handlePttEnd() {
    speech.stop();
  }

  // ── Persona swipe ─────────────────────────────────────────────────────────

  function goToPersona(idx) {
    const next = (idx + personaList.length) % personaList.length;
    setPersonaIndex(next);
    if (anam.isConnected) anam.startSession(personaList[next]);
  }

  function handlePersonaChange(persona) {
    const idx = personaList.findIndex((p) => p.id === persona.id);
    if (idx !== -1) goToPersona(idx);
    else if (anam.isConnected) anam.startSession(persona);
    setPanel(null);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  function addMessage(msg) {
    setMessages((prev) => [
      ...prev,
      { ...msg, id: Date.now() + Math.random(), timestamp: Date.now() },
    ]);
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0a0f]">

      <AvatarView
        status={anam.status}
        persona={selectedPersona}
        messages={messages}
        interimText={speech.interimTranscript}
        error={anam.error}
        isListening={speech.isListening}
        personaList={personaList}
        personaIndex={personaIndex}
        onNext={() => goToPersona(personaIndex + 1)}
        onPrev={() => goToPersona(personaIndex - 1)}
      />

      {/* Top bar */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center px-5 pointer-events-none"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-lg">
            V
          </div>
          <span className="text-white/70 font-semibold text-sm tracking-wide">Voice AI</span>
        </div>
      </div>

      <ControlBar
        status={anam.status}
        isListening={speech.isListening}
        isProcessing={isProcessing}
        onStart={handleStart}
        onStop={handleStop}
        onPttStart={handlePttStart}
        onPttEnd={handlePttEnd}
        onOpenVoices={() => setPanel(panel === 'voices' ? null : 'voices')}
        onOpenChat={() => setPanel(panel === 'chat' ? null : 'chat')}
        messageCount={messages.length}
        persona={selectedPersona}
      />

      {panel === 'voices' && (
        <SlidePanel open onClose={() => setPanel(null)} title="Avatar & Voice">
          <VoiceSelector
            selectedPersona={selectedPersona}
            personaList={personaList}
            onPersonaChange={handlePersonaChange}
            disabled={anam.status === 'connecting'}
          />
        </SlidePanel>
      )}

      {panel === 'chat' && (
        <SlidePanel
          open
          onClose={() => setPanel(null)}
          title={`Conversation${messages.length ? ` · ${messages.length}` : ''}`}
        >
          <Conversation messages={messages} />
        </SlidePanel>
      )}

      {!speech.isSupported && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-xs px-4 py-2 rounded-full whitespace-nowrap">
          Speech recognition requires Chrome or Edge
        </div>
      )}
    </div>
  );
}
