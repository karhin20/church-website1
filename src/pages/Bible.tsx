import { useEffect, useState } from 'react';
import { BibleClient, BibleCollection, GetTranslationsItem, GetBooksItem, get_chapters } from '@gracious.tech/fetch-client';
import '@gracious.tech/fetch-client/client.css';
import { Navigation } from '@/components/sections/Navigation';
import { ChatButton } from "@/components/ChatButton";

interface Language {
  code: string;
  local: string;
  english: string;
}

// Remove the custom Translation and Book interfaces and use the library types
type Translation = GetTranslationsItem & {
  name: string; // Add the name field we need
};

type Book = GetBooksItem & {
  name: string; // Add the name field we need
};

const ALLOWED_LANGUAGES = {
  'eng': 'English',
  'fra': 'français',
  'hau': 'Hausa',
  'ewe': 'Eʋegbe',
  'twi': 'Twi' ,
  'Heb': 'עברית'
};

export default function BiblePage() {
  const [client] = useState(new BibleClient());
  const [collection, setCollection] = useState<BibleCollection | null>(null);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('eng');
  const [selectedTranslation, setSelectedTranslation] = useState<string>('');
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [chapter, setChapter] = useState<number>(1);
  const [content, setContent] = useState<string>('');
  const [maxChapters, setMaxChapters] = useState<number>(1);

  useEffect(() => {
    async function initBible() {
      const fetchedCollection = await client.fetch_collection();
      setCollection(fetchedCollection);
      const availableLanguages = fetchedCollection.get_languages();
      
      // Filter languages to only show allowed ones
      const filteredLanguages = availableLanguages.filter(lang => 
        Object.keys(ALLOWED_LANGUAGES).includes(lang.code)
      );
      
      // Sort languages to match the order we want
      const sortedLanguages = filteredLanguages.sort((a, b) => {
        const order = Object.keys(ALLOWED_LANGUAGES);
        return order.indexOf(a.code) - order.indexOf(b.code);
      });
      
      setLanguages(sortedLanguages);
      setSelectedLanguage('eng');
    }
    initBible();
  }, [client]);

  const updateTranslations = (coll: BibleCollection, langCode: string) => {
    const availableTranslations = coll.get_translations({ language: langCode });
    // Map the translations to include the name field, using name_local or name_english
    const mappedTranslations: Translation[] = availableTranslations.map(t => ({
      ...t,
      name: `${t.name_local || t.name_english} (${t.name_abbrev || ''})`
    }));
    setTranslations(mappedTranslations);
    
    // Clear previous selection and set new one
    setSelectedTranslation('');
    if (mappedTranslations.length > 0) {
      // Use setTimeout to ensure state updates don't conflict
      setTimeout(() => {
        setSelectedTranslation(mappedTranslations[0].id);
      }, 0);
    }
  };

  useEffect(() => {
    if (collection && selectedLanguage) {
      // Reset translations when language changes
      setTranslations([]);
      setSelectedTranslation('');
      updateTranslations(collection, selectedLanguage);
    }
  }, [collection, selectedLanguage]);

  useEffect(() => {
    if (collection && selectedTranslation) {
      const availableBooks = collection.get_books(selectedTranslation);
      const mappedBooks: Book[] = availableBooks.map(b => ({
        ...b,
        name: b.name_local || b.name_english
      }));
      setBooks(mappedBooks);
      if (mappedBooks.length > 0) {
        setSelectedBook(mappedBooks[0].id);
      }
    }
  }, [collection, selectedTranslation]);

  useEffect(() => {
    if (collection && selectedTranslation && selectedBook) {
      const chapters = get_chapters(selectedBook);
      setMaxChapters(chapters.length);
      
      if (chapter > chapters.length) {
        setChapter(1);
      }
    }
  }, [collection, selectedTranslation, selectedBook]);

  useEffect(() => {
    async function fetchContent() {
      if (collection && selectedTranslation && selectedBook) {
        const book = await collection.fetch_book(selectedTranslation, selectedBook);
        const chapterContent = book.get_chapter(chapter);
        setContent(chapterContent);
      }
    }
    fetchContent();
  }, [collection, selectedTranslation, selectedBook, chapter]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Navigation />
      <div className="mt-[100px]">
        <h1 className="text-3xl font-bold mb-6" style={{ color: `rgb(var(--church-primary))`, marginTop: '100px' , textAlign: 'center'}}>
          READ THE BIBLE
        </h1>
        
        {/* Language and Translation Selection */}
        <div className="bg-church-gradient p-4 rounded-lg shadow-lg flex flex-wrap gap-4 mb-6">
          <select
            className="p-2 rounded text-lg min-w-[200px] bg-white/90"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            style={{ color: `rgb(var(--church-primary))` }}
          >
            {languages.map((language) => (
              <option key={language.code} value={language.code}>
                {language.local} ({language.english})
              </option>
            ))}
          </select>

          <select
            className="p-2 rounded text-lg min-w-[200px] bg-white/90"
            value={selectedTranslation}
            onChange={(e) => setSelectedTranslation(e.target.value)}
            style={{ color: `rgb(var(--church-primary))` }}
          >
            {translations.map((translation) => (
              <option key={translation.id} value={translation.id}>
                {translation.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sticky Book and Chapter Selection - Reduced widths */}
        <div className="sticky top-[64px] z-[5] bg-church-gradient p-4 rounded-lg shadow-lg flex flex-wrap gap-2 mb-6">
          <select
            className="p-2 rounded text-lg w-[120px] sm:w-[200px] bg-white/90"
            value={selectedBook}
            onChange={(e) => setSelectedBook(e.target.value)}
            style={{ color: `rgb(var(--church-primary))` }}
          >
            {books.map((book) => (
              <option key={book.id} value={book.id}>
                {book.name}
              </option>
            ))}
          </select>

          <select
            className="p-2 rounded text-lg w-[140px] bg-white/90"
            value={chapter}
            onChange={(e) => setChapter(Number(e.target.value))}
            style={{ color: `rgb(var(--church-primary))` }}
          >
            {[...Array(maxChapters)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                Chapter {i + 1}
              </option>
            ))}
          </select>
        </div>

        {/* Bible Content */}
        <div 
          className="fetch-bible prose max-w-none p-6 rounded-lg shadow-inner text-xl"
          style={{ backgroundColor: `rgb(var(--church-accent))` }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
      <ChatButton />
    </div>
  );
}