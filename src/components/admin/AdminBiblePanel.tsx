import { useState, useEffect } from 'react';
import {
  BibleClient,
  BibleCollection,
  GetTranslationsItem,
  GetBooksItem,
  get_chapters,
} from '@gracious.tech/fetch-client';
import '@gracious.tech/fetch-client/client.css';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { BookOpen, Send, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type Translation = GetTranslationsItem & { name: string };
type Book = GetBooksItem & { name: string };

interface Verse {
  num: number;
  text: string;
}

interface AdminBiblePanelProps {
  eventId: string;
  /** Username label that shows in the chat as the poster */
  userName?: string;
}

// ─── Allowed languages (matching the public Bible page) ───────────────────────

const ALLOWED_LANGUAGES: Record<string, string> = {
  eng: 'English',
  fra: 'Français',
  hau: 'Hausa',
  ewe: 'Eʋegbe',
  twi: 'Twi',
};

// ─── Helper: strip HTML tags from chapter HTML and split into verses ───────────

function parseVerses(htmlContent: string): Verse[] {
  // The fetch-bible library emits each verse wrapped in a <p data-v="N"> element.
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const verses: Verse[] = [];
  doc.querySelectorAll('[data-v]').forEach((el) => {
    const num = parseInt(el.getAttribute('data-v') || '0', 10);
    const text = el.textContent?.trim() || '';
    if (num > 0 && text) verses.push({ num, text });
  });
  // Fallback: if no data-v elements, try splitting by <p> tags
  if (verses.length === 0) {
    doc.querySelectorAll('p').forEach((el, i) => {
      const text = el.textContent?.trim() || '';
      if (text) verses.push({ num: i + 1, text });
    });
  }
  return verses;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminBiblePanel({ eventId, userName = 'Admin (Host)' }: AdminBiblePanelProps) {
  const { toast } = useToast();

  const [client] = useState(() => new BibleClient());
  const [collection, setCollection] = useState<BibleCollection | null>(null);

  const [languages, setLanguages] = useState<{ code: string; local: string }[]>([]);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [maxChapters, setMaxChapters] = useState(1);
  const [verses, setVerses] = useState<Verse[]>([]);

  const [selectedLang, setSelectedLang] = useState('eng');
  const [selectedTranslation, setSelectedTranslation] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [chapter, setChapter] = useState(1);
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);

  const [loadingCollection, setLoadingCollection] = useState(true);
  const [loadingChapter, setLoadingChapter] = useState(false);
  const [posting, setPosting] = useState(false);

  // ── Init collection ────────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      setLoadingCollection(true);
      try {
        const coll = await client.fetch_collection();
        setCollection(coll);
        const available = coll.get_languages().filter((l) => l.code in ALLOWED_LANGUAGES);
        available.sort((a, b) => {
          const order = Object.keys(ALLOWED_LANGUAGES);
          return order.indexOf(a.code) - order.indexOf(b.code);
        });
        setLanguages(available.map((l) => ({ code: l.code, local: ALLOWED_LANGUAGES[l.code] || l.local })));
      } catch (err) {
        console.error('Failed to load Bible collection', err);
      } finally {
        setLoadingCollection(false);
      }
    }
    init();
  }, [client]);

  // ── Language -> translations ───────────────────────────────────────────────
  useEffect(() => {
    if (!collection || !selectedLang) return;
    const raw = collection.get_translations({ language: selectedLang });
    const mapped: Translation[] = raw.map((t) => ({
      ...t,
      name: `${t.name_local || t.name_english} (${t.name_abbrev || ''})`,
    }));
    setTranslations(mapped);
    setSelectedTranslation(mapped[0]?.id || '');
    setSelectedBook('');
    setSelectedVerse(null);
  }, [collection, selectedLang]);

  // ── Translation -> books ───────────────────────────────────────────────────
  useEffect(() => {
    if (!collection || !selectedTranslation) return;
    const raw = collection.get_books(selectedTranslation);
    const mapped: Book[] = raw.map((b) => ({ ...b, name: b.name_local || b.name_english }));
    setBooks(mapped);
    setSelectedBook(mapped[0]?.id || '');
    setChapter(1);
    setSelectedVerse(null);
  }, [collection, selectedTranslation]);

  // ── Book -> chapter count ──────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedBook) return;
    const chapters = get_chapters(selectedBook);
    setMaxChapters(chapters.length);
    if (chapter > chapters.length) setChapter(1);
  }, [selectedBook]);

  // ── Fetch chapter HTML -> parse verses ────────────────────────────────────
  useEffect(() => {
    if (!collection || !selectedTranslation || !selectedBook) return;
    let cancelled = false;
    async function load() {
      setLoadingChapter(true);
      setSelectedVerse(null);
      try {
        const book = await collection!.fetch_book(selectedTranslation, selectedBook);
        const html = book.get_chapter(chapter);
        if (!cancelled) setVerses(parseVerses(html));
      } catch (err) {
        console.error('Failed to fetch chapter', err);
      } finally {
        if (!cancelled) setLoadingChapter(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [collection, selectedTranslation, selectedBook, chapter]);

  // ── Post selected verse to chat ────────────────────────────────────────────
  const handlePostVerse = async () => {
    if (!selectedVerse) return;
    setPosting(true);

    const bookName = books.find((b) => b.id === selectedBook)?.name || selectedBook;
    const translationAbbrev = translations.find((t) => t.id === selectedTranslation)?.name_abbrev || '';
    const verseRef = `${bookName} ${chapter}:${selectedVerse.num}${translationAbbrev ? ` (${translationAbbrev})` : ''}`;

    try {
      const { error } = await supabase.from('live_chat_messages').insert([
        {
          event_id: eventId,
          user_name: userName,
          message: selectedVerse.text,
          message_type: 'verse',
          verse_ref: verseRef,
        },
      ]);
      if (error) throw error;
      toast({ title: '📖 Verse posted!', description: verseRef });
      setSelectedVerse(null);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed to post verse', description: err.message });
    } finally {
      setPosting(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loadingCollection) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-amber-700">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-sm">Loading Bible…</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 text-gray-900">

      {/* Selectors row */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {/* Language */}
        <select
          className="col-span-1 border rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          value={selectedLang}
          onChange={(e) => { setSelectedLang(e.target.value); }}
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>{l.local}</option>
          ))}
        </select>

        {/* Translation */}
        <select
          className="col-span-1 border rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          value={selectedTranslation}
          onChange={(e) => setSelectedTranslation(e.target.value)}
        >
          {translations.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        {/* Book */}
        <select
          className="col-span-1 border rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          value={selectedBook}
          onChange={(e) => { setSelectedBook(e.target.value); setChapter(1); }}
        >
          {books.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        {/* Chapter stepper */}
        <div className="col-span-1 flex items-center gap-1 border rounded px-2 bg-white">
          <button
            onClick={() => setChapter((c) => Math.max(1, c - 1))}
            disabled={chapter <= 1}
            className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="flex-1 text-center text-xs font-semibold">Ch. {chapter}</span>
          <button
            onClick={() => setChapter((c) => Math.min(maxChapters, c + 1))}
            disabled={chapter >= maxChapters}
            className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Verse list */}
      <div className="relative border rounded-lg bg-amber-50/40 overflow-hidden">
        {loadingChapter ? (
          <div className="flex items-center justify-center py-10 gap-2 text-amber-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">Loading chapter…</span>
          </div>
        ) : verses.length === 0 ? (
          <p className="text-center py-10 text-xs text-gray-400 italic">No verses found for this selection.</p>
        ) : (
          <div className="max-h-64 overflow-y-auto p-2 space-y-0.5">
            {verses.map((v) => {
              const isSelected = selectedVerse?.num === v.num;
              return (
                <button
                  key={v.num}
                  onClick={() => setSelectedVerse(isSelected ? null : v)}
                  className={`w-full text-left rounded-lg px-3 py-2 text-xs leading-relaxed transition-colors ${
                    isSelected
                      ? 'bg-amber-400/30 border border-amber-500 text-amber-900 font-medium'
                      : 'hover:bg-amber-100/60 text-gray-700'
                  }`}
                >
                  <span className="inline-block w-5 font-bold text-amber-600 mr-1.5 flex-shrink-0">{v.num}</span>
                  {v.text}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected verse preview + post button */}
      {selectedVerse ? (
        <div className="relative rounded-xl border border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50 p-4 shadow-md">
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400" />
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Selected Verse</span>
          </div>
          <p className="text-sm italic text-gray-800 leading-relaxed font-serif mb-1">
            &ldquo;{selectedVerse.text}&rdquo;
          </p>
          {(() => {
            const bookName = books.find((b) => b.id === selectedBook)?.name || selectedBook;
            const abbrev = translations.find((t) => t.id === selectedTranslation)?.name_abbrev || '';
            return (
              <p className="text-xs font-semibold text-amber-700 mb-3">
                — {bookName} {chapter}:{selectedVerse.num}{abbrev ? ` (${abbrev})` : ''}
              </p>
            );
          })()}
          <Button
            onClick={handlePostVerse}
            disabled={posting}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm flex items-center gap-2"
          >
            {posting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {posting ? 'Posting…' : 'Post Verse to Live Chat'}
          </Button>
        </div>
      ) : (
        <p className="text-center text-xs text-gray-400 italic py-1">
          Tap a verse above to select it, then post it to chat.
        </p>
      )}
    </div>
  );
}
