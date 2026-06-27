import { useRef, useState, useCallback, useEffect } from 'react';
import { createClient, unsafe_createClientWithApiKey } from '@anam-ai/js-sdk';
import { api } from '../services/api';

const DEV_API_KEY = import.meta.env.VITE_ANAM_API_KEY;

/**
 * Manages the Anam AI avatar session lifecycle.
 *
 * In local dev (VITE_ANAM_API_KEY set):
 *   Uses unsafe_createClientWithApiKey — no backend token exchange needed.
 *
 * In production:
 *   Fetches a short-lived session token from our backend.
 */
export function useAnam() {
  const clientRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [currentPersonaId, setCurrentPersonaId] = useState(null);

  const stopSession = useCallback(async () => {
    if (clientRef.current) {
      try {
        if (clientRef.current.isStreaming?.()) {
          await clientRef.current.stopStreaming();
        }
      } catch (_) {}
      clientRef.current = null;
    }
    setStatus('idle');
    setCurrentPersonaId(null);
    setError(null);
  }, []);

  const startSession = useCallback(
    async (persona, videoElementId = 'anam-video', audioElementId = 'anam-audio') => {
      if (clientRef.current) await stopSession();

      setStatus('connecting');
      setError(null);

      try {
        let client;

        if (DEV_API_KEY) {
          // Local dev: use API key directly (never do this in production)
          client = unsafe_createClientWithApiKey(DEV_API_KEY, { personaId: persona.id });
        } else {
          // Production: exchange API key for short-lived session token on backend
          const { sessionToken } = await api.getAnamSession(persona.id);
          // Try without personaConfig first (ephemeral/stateful tokens embed it)
          try {
            client = createClient(sessionToken);
          } catch {
            client = createClient(sessionToken, { personaId: persona.id });
          }
        }

        client.addListener('CONNECTION_ESTABLISHED', () => setStatus('ready'));
        client.addListener('CONNECTION_CLOSED', () => {
          clientRef.current = null;
          setCurrentPersonaId(null);
          setStatus('idle');
        });

        await client.streamToVideoAndAudioElements(videoElementId, audioElementId);

        clientRef.current = client;
        setCurrentPersonaId(persona.id);
      } catch (err) {
        setStatus('error');
        setError(err?.message || 'Failed to start avatar session');
        clientRef.current = null;
      }
    },
    [stopSession],
  );

  const speak = useCallback(async (text) => {
    if (!clientRef.current || !text?.trim()) return;
    setStatus('speaking');
    try {
      await clientRef.current.talk(text);
    } catch (err) {
      setError(err?.message || 'Failed to speak');
    } finally {
      if (clientRef.current) setStatus('ready');
    }
  }, []);

  useEffect(() => () => { stopSession(); }, [stopSession]);

  return {
    status,
    error,
    currentPersonaId,
    startSession,
    stopSession,
    speak,
    mute: () => {},   // placeholder — Anam SDK mic mute not needed in our flow
    unmute: () => {},
    isConnected: status === 'ready' || status === 'speaking',
  };
}
