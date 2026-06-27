import { useState, useRef, useCallback, useEffect } from 'react';

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

/**
 * Continuous auto-listen hook (English only).
 * Calls onUtterance(text) each time a complete sentence is detected.
 * Auto-restarts after each result. Pauses when muted (avatar is speaking).
 */
export function useSpeech({ onUtterance } = {}) {
  const recognitionRef = useRef(null);
  const isMutedRef    = useRef(false);
  const activeRef     = useRef(false); // true while user wants mic on
  const onUtteranceRef = useRef(onUtterance);
  onUtteranceRef.current = onUtterance;

  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening,  setIsListening]  = useState(false);
  const [isSupported]                   = useState(Boolean(SpeechRecognition));

  const createRec = useCallback(() => {
    if (!SpeechRecognition) return null;
    const rec = new SpeechRecognition();
    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => setIsListening(true);

    rec.onresult = (event) => {
      if (isMutedRef.current) return;
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) {
          const text = r[0].transcript.trim();
          if (text) {
            setInterimTranscript('');
            onUtteranceRef.current?.(text);
          }
        } else {
          interim += r[0].transcript;
        }
      }
      if (!isMutedRef.current) setInterimTranscript(interim);
    };

    rec.onerror = (e) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        console.warn('SpeechRecognition error:', e.error);
      }
    };

    rec.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
      recognitionRef.current = null;
      // Auto-restart if user hasn't stopped and isn't muted
      if (activeRef.current && !isMutedRef.current) {
        setTimeout(startRec, 250);
      }
    };

    return rec;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function startRec() {
    if (!SpeechRecognition || recognitionRef.current) return;
    const rec = createRec();
    if (!rec) return;
    recognitionRef.current = rec;
    try { rec.start(); } catch (_) {}
  }

  const start = useCallback(() => {
    activeRef.current = true;
    isMutedRef.current = false;
    startRec();
  }, [createRec]); // eslint-disable-line react-hooks/exhaustive-deps

  const stop = useCallback(() => {
    activeRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const mute = useCallback(() => {
    isMutedRef.current = true;
    setInterimTranscript('');
  }, []);

  const unmute = useCallback(() => {
    isMutedRef.current = false;
  }, []);

  useEffect(() => () => {
    activeRef.current = false;
    recognitionRef.current?.stop();
  }, []);

  return { interimTranscript, isListening, isSupported, start, stop, mute, unmute };
}
