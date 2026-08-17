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

// ─── Allowed languages ────────────────────────────────────────────────────────

const ALLOWED_LANGUAGES: Record<string, string> = {
  eng: 'English',
  fra: 'Français',
  hau: 'Hausa',
  ewe: 'Eʋegbe',
  twi: 'Twi',
};

// ─── Helper: strip HTML tags ──────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

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

  // ── Fetch chapter -> extract verses ─────────────────────────────────────────
  useEffect(() => {
    if (!collection || !selectedTranslation || !selectedBook) return;
    let cancelled = false;
    async function load() {
      setLoadingChapter(true);
      setSelectedVerse(null);
      try {
        const book = await collection!.fetch_book(selectedTranslation, selectedBook);
        const list = book.get_list(chapter, 1, chapter + 1, 0);
        if (!cancelled) {
          setVerses(
            list.map((item: { verse: number; content: string }) => ({
              num: item.verse,
              text: stripHtml(item.content),
            })).filter((v: Verse) => v.text.length > 0)
          );
        }
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
      toast({ title: '📖 Verse posted to live chat!', description: verseRef });
      setSelectedVerse(null);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed to post verse', description: err.message });
    } finally {
      setPosting(false);
    }
  };

  if (loadingCollection) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-amber-700">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-sm">Loading Bible…</span>
      </div>
    );
  }

  const bookName = books.find((b) => b.id === selectedBook)?.name || selectedBook;
  const translationAbbrev = translations.find((t) => t.id === selectedTranslation)?.name_abbrev || '';

  return (
    <div className="flex flex-col gap-4 text-gray-900 font-sans">
      
      {/* Selector Dropdowns Row */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        
        {/* Language */}
        <div className="col-span-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Language</label>
          <select
            className="w-full border rounded-lg px-2.5 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>{l.local}</option>
            ))}
          </select>
        </div>

        {/* Translation */}
        <div className="col-span-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Version</label>
          <select
            className="w-full border rounded-lg px-2.5 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
            value={selectedTranslation}
            onChange={(e) => setSelectedTranslation(e.target.value)}
          >
            {translations.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Book */}
        <div className="col-span-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Book</label>
          <select
            className="w-full border rounded-lg px-2.5 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
            value={selectedBook}
            onChange={(e) => { setSelectedBook(e.target.value); setChapter(1); }}
          >
            {books.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Chapter Dropdown */}
        <div className="col-span-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Chapter</label>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setChapter((c) => Math.max(1, c - 1))}
              disabled={chapter <= 1}
              className="p-2 border rounded-lg bg-white hover:bg-gray-100 disabled:opacity-30 flex-shrink-0"
              title="Previous Chapter"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <select
              className="w-full border rounded-lg px-2 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-semibold"
              value={chapter}
              onChange={(e) => setChapter(Number(e.target.value))}
            >
              {Array.from({ length: maxChapters }, (_, i) => i + 1).map((ch) => (
                <option key={ch} value={ch}>Ch. {ch}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setChapter((c) => Math.min(maxChapters, c + 1))}
              disabled={chapter >= maxChapters}
              className="p-2 border rounded-lg bg-white hover:bg-gray-100 disabled:opacity-30 flex-shrink-0"
              title="Next Chapter"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Verse Dropdown Selector */}
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Verse Dropdown</label>
          <select
            className="w-full border rounded-lg px-2.5 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-semibold text-amber-900 border-amber-300"
            value={selectedVerse ? selectedVerse.num : ''}
            onChange={(e) => {
              const num = Number(e.target.value);
              const found = verses.find((v) => v.num === num) || null;
              setSelectedVerse(found);
            }}
          >
            <option value="">Select Verse...</option>
            {verses.map((v) => (
              <option key={v.num} value={v.num}>Verse {v.num}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Verse List Container */}
      <div className="relative border rounded-xl bg-amber-50/40 overflow-hidden shadow-inner">
        {loadingChapter ? (
          <div className="flex items-center justify-center py-10 gap-2 text-amber-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">Loading chapter...</span>
          </div>
        ) : verses.length === 0 ? (
          <p className="text-center py-10 text-xs text-gray-400 italic">No verses found for this selection.</p>
        ) : (
          <div className="max-h-56 overflow-y-auto p-2 space-y-1">
            {verses.map((v) => {
              const isSelected = selectedVerse?.num === v.num;
              return (
                <button
                  key={v.num}
                  onClick={() => setSelectedVerse(isSelected ? null : v)}
                  className={`w-full text-left rounded-lg px-3 py-2 text-xs leading-relaxed transition-all ${
                    isSelected
                      ? 'bg-amber-400/40 border border-amber-500 text-amber-950 font-semibold shadow-sm'
                      : 'hover:bg-amber-100/60 text-gray-700'
                  }`}
                >
                  <span className="inline-block w-6 font-bold text-amber-600 mr-1 flex-shrink-0">{v.num}.</span>
                  {v.text}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Verse Preview & Send Action Button */}
      {selectedVerse ? (
        <div className="relative rounded-2xl border border-amber-400 bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100/50 p-5 shadow-lg">
          <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500" />
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-700" />
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">Selected Scripture Verse</span>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-200/70 px-2.5 py-0.5 rounded-full">
              {bookName} {chapter}:{selectedVerse.num} {translationAbbrev ? `(${translationAbbrev})` : ''}
            </span>
          </div>

          <p className="text-sm italic text-gray-900 leading-relaxed font-serif mb-3">
            &ldquo;{selectedVerse.text}&rdquo;
          </p>

          <Button
            onClick={handlePostVerse}
            disabled={posting}
            className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm flex items-center justify-center gap-2 rounded-xl shadow-md transition-transform active:scale-[0.99]"
          >
            {posting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {posting ? 'Sending Verse...' : 'Send Verse to Live Chat'}
          </Button>
        </div>
      ) : (
        <div className="text-center text-xs text-gray-500 italic py-2 border border-dashed rounded-xl border-gray-200 bg-gray-50">
          Select a chapter & verse above to preview the text and send it to the live chat.
        </div>
      )}
    </div>
  );
}
