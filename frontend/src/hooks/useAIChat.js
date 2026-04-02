import { useState, useCallback, useRef, useEffect } from 'react';
import { apiFetch } from '../lib/api';

const STORAGE_KEY = 'citizen-ai-chat-history';
const MAX_STORED_MESSAGES = 50;

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(-MAX_STORED_MESSAGES) : [];
  } catch {
    return [];
  }
}

function saveHistory(messages) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED_MESSAGES)));
  } catch {
    // storage full — silently ignore
  }
}

/**
 * Custom hook for the Bureaucracy Simplifier AI chat.
 * Manages conversation state, API calls, and message history.
 */
export function useAIChat() {
  const [messages, setMessages] = useState(() => loadHistory());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [personalization, setPersonalization] = useState(null);
  const conversationIdRef = useRef(null);
  const abortRef = useRef(null);

  // Persist messages on change
  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  /**
   * Send a chat message to the AI.
   */
  const sendMessage = useCallback(async (text) => {
    if (!text?.trim() || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setError(null);

    // Add a placeholder for the AI response (typing indicator)
    const placeholderId = `ai-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: placeholderId, role: 'assistant', typing: true, at: new Date().toISOString() },
    ]);

    try {
      // Abort any in-flight request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await apiFetch('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: text.trim(),
          conversationId: conversationIdRef.current,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to get response');
      }

      const data = await res.json();
      conversationIdRef.current = data.conversationId || conversationIdRef.current;

      // Simulate a small typing delay for natural feel
      await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 600));

      // Replace placeholder with actual response
      const aiMsg = {
        id: placeholderId,
        role: 'assistant',
        data: data.response,
        relatedSchemes: data.relatedSchemes || [],
        suggestions: data.suggestions || [],
        at: new Date().toISOString(),
      };
      setMessages((prev) => prev.map((m) => (m.id === placeholderId ? aiMsg : m)));
      setSuggestions(data.suggestions || []);
      if (data.personalization) setPersonalization(data.personalization);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message || 'Something went wrong');
      // Remove placeholder
      setMessages((prev) => prev.filter((m) => m.id !== placeholderId));
    } finally {
      setLoading(false);
    }
  }, [loading]);

  /**
   * Simplify pasted document text.
   */
  const simplifyDocument = useCallback(async (text) => {
    if (!text?.trim() || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: `📄 Simplify this document:\n\n"${text.trim().slice(0, 500)}${text.length > 500 ? '...' : ''}"`,
      isDocumentUpload: true,
      at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setError(null);

    const placeholderId = `ai-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: placeholderId, role: 'assistant', typing: true, at: new Date().toISOString() },
    ]);

    try {
      const res = await apiFetch('/api/ai/simplify', {
        method: 'POST',
        body: JSON.stringify({ text: text.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to simplify');
      }

      const data = await res.json();

      await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 800));

      const aiMsg = {
        id: placeholderId,
        role: 'assistant',
        data: {
          type: 'document_simplified',
          summary: data.simplified,
          keyBenefits: data.keyBenefits,
          actions: data.actions,
          stats: data.stats,
        },
        relatedSchemes: data.relatedSchemes || [],
        at: new Date().toISOString(),
      };
      setMessages((prev) => prev.map((m) => (m.id === placeholderId ? aiMsg : m)));
    } catch (err) {
      setError(err.message || 'Simplification failed');
      setMessages((prev) => prev.filter((m) => m.id !== placeholderId));
    } finally {
      setLoading(false);
    }
  }, [loading]);

  /**
   * Fetch initial suggestions.
   */
  const fetchSuggestions = useCallback(async () => {
    try {
      const res = await apiFetch('/api/ai/suggestions');
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        if (data.personalization) setPersonalization(data.personalization);
      }
    } catch {
      // silently fail
    }
  }, []);

  /**
   * Clear chat history.
   */
  const clearChat = useCallback(() => {
    setMessages([]);
    conversationIdRef.current = null;
    setSuggestions([]);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    messages,
    loading,
    error,
    suggestions,
    personalization,
    sendMessage,
    simplifyDocument,
    fetchSuggestions,
    clearChat,
  };
}
