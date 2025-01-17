import { useState, useEffect } from 'react';
import { Navigation } from "@/components/sections/Navigation";
import { FooterSection } from "@/components/sections/FooterSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Translation {
  value: string;
  label: string;
}

interface TranslationsMap {
  [key: string]: Translation[];
}

const translations: TranslationsMap = {
  en: [
    { value: "KJ21", label: "21st Century KJV" },
    { value: "ASV", label: "American Standard Version" },
    { value: "AMP", label: "Amplified Bible" },
    { value: "AMPC", label: "AMP, Classic Edition" },
    { value: "BRG", label: "BRG Bible" },
    { value: "CSB", label: "Christian Standard Bible" },
    { value: "CEB", label: "Common English Bible" },
    { value: "CJB", label: "Complete Jewish Bible" },
    { value: "CEV", label: "Contemporary English Version" },
    { value: "DARBY", label: "Darby Translation" },
    { value: "DLNT", label: "Disciples' Literal New Testament" },
    { value: "DRA", label: "Douay-Rheims 1899 American Edition" },
    { value: "ERV", label: "Easy-to-Read Version" },
    { value: "EASY", label: "EasyEnglish Bible" },
    { value: "EHV", label: "Evangelical Heritage Version" },
    { value: "ESV", label: "English Standard Version" },
    { value: "ESVUK", label: "English Standard Version Anglicised" },
    { value: "EXB", label: "Expanded Bible" },
    { value: "GNV", label: "1599 Geneva Bible" },
    { value: "GW", label: "GOD'S WORD Translation" },
    { value: "GNT", label: "Good News Translation" },
    { value: "HCSB", label: "Holman Christian Standard Bible" },
    { value: "ICB", label: "International Children's Bible" },
    { value: "ISV", label: "International Standard Version" },
    { value: "PHILLIPS", label: "J.B. Phillips New Testament" },
    { value: "JUB", label: "Jubilee Bible 2000" },
    { value: "KJV", label: "King James Version" },
    { value: "AKJV", label: "Authorized KJV" },
    { value: "LSB", label: "Legacy Standard Bible" },
    { value: "LEB", label: "Lexham English Bible" },
    { value: "TLB", label: "Living Bible" },
    { value: "MSG", label: "The Message Bible" },
    { value: "MEV", label: "Modern English Version" },
    { value: "MOUNCE", label: "MOUNCE New Testament" },
    { value: "NOG", label: "Names of God Bible" },
    { value: "NABRE", label: "New American Bible (Revised Edition)" },
    { value: "NASB", label: "New American Standard Bible" },
    { value: "NASB1995", label: "New American Standard Bible 1995" },
    { value: "NCB", label: "New Catholic Bible" },
    { value: "NCV", label: "New Century Version" },
    { value: "NET", label: "New English Translation" },
    { value: "NIRV", label: "New International Reader's Version" },
    { value: "NIV", label: "New International Version" },
    { value: "NIVUK", label: "New International Version - UK" },
    { value: "NKJV", label: "New King James Version" },
    { value: "NLV", label: "New Life Version" },
    { value: "NLT", label: "New Living Translation" },
    { value: "NMB", label: "New Matthew Bible" },
    { value: "NRSVA", label: "New Revised Standard Version, Anglicised" },
    { value: "NRSVACE", label: "NRSVACE" },
    { value: "NRSVCE", label: "NRSV Catholic Edition" },
    { value: "NRSVUE", label: "NRSV Updated Edition" },
    { value: "NTFE", label: "New Testament for Everyone" },
    { value: "OJB", label: "Orthodox Jewish Bible" },
    { value: "RGT", label: "Revised Geneva Translation" },
    { value: "RSV", label: "Revised Standard Version" },
    { value: "RSVCE", label: "RSV Catholic Edition" },
    { value: "TLV", label: "Tree of Life Version" },
    { value: "VOICE", label: "The Voice" },
    { value: "WEB", label: "World English Bible" },
    { value: "WE", label: "Worldwide English (New Testament)" },
    { value: "WYC", label: "Wycliffe Bible" },
    { value: "YLT", label: "Young's Literal Translation" }
],
  twi: [
    { value: "NA-TWI", label: "Nkwa Asem" }
  ]
};

const bibleBooks = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra",
  "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
  "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations",
  "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
  "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
  "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts",
  "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
  "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
  "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews",
  "James", "1 Peter", "2 Peter", "1 John", "2 John",
  "3 John", "Jude", "Revelation"
];

export const VerseReader = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedTranslation, setSelectedTranslation] = useState("");
  const [selectedBook, setSelectedBook] = useState("");
  const [chapter, setChapter] = useState("");
  const [verse, setVerse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verseResult, setVerseResult] = useState<{ citation?: string; passage?: string; message?: string } | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setSelectedTranslation(translations[selectedLanguage][0].value);
  }, [selectedLanguage]);

  const lookupVerse = async () => {
    if (!selectedBook || !chapter || !verse || !selectedTranslation) {
      setVerseResult({ message: "Please fill in all fields" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://backend-church.vercel.app/api/verse?book=${encodeURIComponent(selectedBook)}&chapter=${chapter}&verse=${verse}&translation=${selectedTranslation}`
      );
      const data = await response.json();
      
      setVerseResult({
        citation: data.citation,
        passage: data.passage
      });
    } catch (error) {
      setVerseResult({ message: "Error connecting to the server" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    setSelectedTranslation(translations[lang][0].value);
    setVerseResult(null);
  };

  const loadVerseWithNumber = async (verseNum: number) => {
    if (!selectedBook || !chapter || !selectedTranslation) {
      setVerseResult({ message: "Please fill in all fields" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://backend-church.vercel.app/api/verse?book=${encodeURIComponent(selectedBook)}&chapter=${chapter}&verse=${verseNum}&translation=${selectedTranslation}`
      );
      const data = await response.json();
      
      setVerseResult({
        citation: data.citation,
        passage: data.passage
      });
      setVerse(verseNum.toString());
    } catch (error) {
      setVerseResult({ message: "Error connecting to the server" });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousVerse = () => {
    const currentVerse = parseInt(verse);
    if (currentVerse > 1) {
      loadVerseWithNumber(currentVerse - 1);
    }
  };

  const handleNextVerse = () => {
    const currentVerse = parseInt(verse);
    loadVerseWithNumber(currentVerse + 1);
  };

  return (
    <motion.div 
      className="container mx-auto px-2 mb-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <div className="space-y-4">
          {/* Language and Translation Selection */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-church-text mb-1">
                Language
              </label>
              <select 
                className="w-full p-2 border rounded-md bg-white"
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
              >
                <option value="en">English</option>
                <option value="twi">Twi</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-church-text mb-1">
                Translation
              </label>
              <select 
                className="w-full p-2 border rounded-md bg-white"
                value={selectedTranslation}
                onChange={(e) => setSelectedTranslation(e.target.value)}
              >
                {translations[selectedLanguage].map((trans) => (
                  <option key={trans.value} value={trans.value}>
                    {trans.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Book, Chapter, and Verse Selection */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-church-text mb-1">
                Book
              </label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between bg-white"
                  >
                    {selectedBook || "Select..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search..." />
                    <CommandEmpty>No book found.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-y-auto">
                      {bibleBooks.map((book) => (
                        <CommandItem
                          key={book}
                          value={book}
                          onSelect={(currentValue) => {
                            setSelectedBook(currentValue === selectedBook ? "" : currentValue);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedBook === book ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {book}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-church-text mb-1">
                Chapter
              </label>
              <Input
                type="number"
                min="1"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-church-text mb-1">
                Verse
              </label>
              <Input
                type="number"
                min="1"
                value={verse}
                onChange={(e) => setVerse(e.target.value)}
                className="bg-white"
              />
            </div>
          </div>

          <Button 
            className="w-full bg-church-primary text-white hover:bg-church-secondary"
            onClick={lookupVerse}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                Loading...
              </div>
            ) : (
              'Read Verse'
            )}
          </Button>
        </div>

        {/* Result Display */}
        <div className="mt-6 p-4 border rounded-md">
          {verseResult ? (
            verseResult.message ? (
              <p className="text-red-500">{verseResult.message}</p>
            ) : (
              <div>
                <h3 className="font-bold text-church-primary mb-2">{verseResult.citation}</h3>
                <p className="text-church-text">{verseResult.passage}</p>
              </div>
            )
          ) : (
            <p className="text-church-text">Enter verse details above and click "Read Verse"</p>
          )}
        </div>

        {/* Navigation Buttons */}
        {verseResult && !verseResult.message && (
          <div className="mt-4 flex justify-between gap-4">
            <Button
              onClick={handlePreviousVerse}
              disabled={isLoading || parseInt(verse) <= 1}
              className="flex-1 bg-church-primary text-white hover:bg-church-secondary disabled:opacity-50"
            >
              ← Previous Verse
            </Button>
            <Button
              onClick={handleNextVerse}
              disabled={isLoading}
              className="flex-1 bg-church-primary text-white hover:bg-church-secondary disabled:opacity-50"
            >
              Next Verse →
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Add a separate component for the standalone page
const VerseReaderPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-church-background">
      <Navigation />
      <h1 className="text-3xl pt-24 font-bold text-church-primary mb-8 text-center">
        Bible Verse Reader
      </h1>
      <div className="container mx-auto px-4">
        <VerseReader />
      </div>
      <FooterSection />
    </div>
  );
};

export default VerseReaderPage; 