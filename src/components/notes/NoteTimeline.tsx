"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Note } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Timestamp } from "firebase/firestore";

interface NoteTimelineProps {
  notes: Note[] | undefined;
  onAddNote: (content: string) => Promise<{ success?: boolean; error?: string }>;
}

export default function NoteTimeline({ notes, onAddNote }: NoteTimelineProps) {
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localNotes, setLocalNotes] = useState<Note[]>(notes || []);
  const inputRef = useRef<HTMLInputElement>(null);

  // notesが更新されたときにローカルステートを更新
  useEffect(() => {
    if (notes) {
      setLocalNotes(notes);
    }
  }, [notes]);

  const formatDate = (date: Date | Timestamp): string => {
    const dateObj = date instanceof Date ? date : date.toDate();
    return dateObj.toLocaleString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) {
      return;
    }

    if (!user) {
      setError("ユーザー情報の取得に失敗しました");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await onAddNote(inputValue);
      
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        // 一時的なメモを追加（サーバーから取得するまでの間）
        const tempNote: Note = {
          id: `temp-${Date.now()}`,
          content: inputValue.trim(),
          createdAt: new Date(),
          authorName: user.displayName || user.email,
        };
        setLocalNotes((prev) => [...prev, tempNote]);
        setInputValue("");
        inputRef.current?.focus();
      }
    } catch (err) {
      setError("メモの追加に失敗しました");
      console.error("Error adding note:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // createdAtでソート（古い順）
  const sortedNotes = [...localNotes].sort((a, b) => {
    const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : a.createdAt.toDate().getTime();
    const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : b.createdAt.toDate().getTime();
    return dateA - dateB;
  });

  return (
    <div className="flex flex-col h-full">
      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px] max-h-[600px]">
        {sortedNotes.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            メモがありません。下の入力欄からメモを追加してください。
          </div>
        ) : (
          <>
            {sortedNotes.map((note) => (
              <div key={note.id} className="flex flex-col">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-[80%]">
                      <p className="text-black whitespace-pre-wrap break-words">
                        {note.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-1 px-1">
                      <span className="text-xs text-gray-600 font-medium">
                        {note.authorName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(note.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* 入力エリア */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="メモを入力..."
            disabled={isSubmitting || !user}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isSubmitting || !inputValue.trim() || !user}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? "送信中..." : "送信"}
          </Button>
        </form>
        {error && (
          <p className="text-sm text-red-600 mt-2">{error}</p>
        )}
      </div>
    </div>
  );
}

