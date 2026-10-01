"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Message,
  loadMessages,
  saveMessages,
  createMessage,
} from "@/lib/messages";

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    setMessages(loadMessages());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessages((prev) => {
        let changed = false;
        const updated = prev.map((msg) => {
          if (msg.status === "pending" && Date.now() >= msg.sendAt) {
            changed = true;
            return { ...msg, status: "sent" as const };
          }
          return msg;
        });
        if (changed) {
          saveMessages(updated);
        }
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addMessage = useCallback(
    (recipient: string, body: string, sendAt: number) => {
      setMessages((prev) => {
        const msg = createMessage(recipient, body, sendAt);
        const updated = [...prev, msg];
        saveMessages(updated);
        return updated;
      });
    },
    []
  );

  const cancelMessage = useCallback((id: string) => {
    setMessages((prev) => {
      const updated = prev.map((msg) =>
        msg.id === id ? { ...msg, status: "cancelled" as const } : msg
      );
      saveMessages(updated);
      return updated;
    });
  }, []);

  const editMessage = useCallback((id: string, newBody: string) => {
    setMessages((prev) => {
      const updated = prev.map((msg) =>
        msg.id === id && msg.status === "pending"
          ? { ...msg, body: newBody }
          : msg
      );
      saveMessages(updated);
      return updated;
    });
  }, []);

  const deleteMessage = useCallback((id: string) => {
    setMessages((prev) => {
      const updated = prev.filter((msg) => msg.id !== id);
      saveMessages(updated);
      return updated;
    });
  }, []);

  const pending = messages.filter((m) => m.status === "pending");
  const sent = messages.filter((m) => m.status === "sent");
  const cancelled = messages.filter((m) => m.status === "cancelled");

  return {
    messages,
    pending,
    sent,
    cancelled,
    addMessage,
    cancelMessage,
    editMessage,
    deleteMessage,
  };
}
