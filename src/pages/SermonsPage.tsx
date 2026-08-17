import { useEffect, useState } from "react";
import { Navigation } from "@/components/sections/Navigation";
import { FooterSection } from "@/components/sections/FooterSection";
import { ChatButton } from "@/components/ChatButton";
import { RedCirclePlayer } from "@/components/RedCirclePlayer";
import { supabase, SermonItem } from "@/lib/supabase";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import { Search, Calendar, MicVocal, Loader2, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getCache, setCache, TTL } from "@/lib/queryCache";

interface GroupedSermons {
  [yearMonthKey: string]: SermonItem[];
}

const ALL_SERMONS_KEY = 'sermons-all';

export default function SermonsPage() {
  const [sermons, setSermons] = useState<SermonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });

    // Serve from memory cache if still fresh
    const cached = getCache<SermonItem[]>(ALL_SERMONS_KEY);
    if (cached) {
      setSermons(cached);
      setLoading(false);
      return;
    }

    fetchSermons();
  }, []);

  const fetchSermons = async () => {
    try {
      const { data, error } = await supabase
        .from("sermons")
        .select("*")
        .or('is_hidden.is.null,is_hidden.eq.false')
        .order("date", { ascending: false });

      if (!error && data) {
        setCache(ALL_SERMONS_KEY, data, TTL.SERMONS);
        setSermons(data);
      }
    } catch (err) {
      console.error("Error fetching sermons:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to format date string safely
  const parseSermonDate = (dateStr?: string) => {
    if (!dateStr) return { year: "Other", month: "Archive", formatted: "Recorded Message" };
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) {
      return { year: "Archive", month: "Sermons", formatted: dateStr };
    }
    const year = dateObj.getFullYear().toString();
    const month = dateObj.toLocaleString("en-US", { month: "long" });
    const formatted = dateObj.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    return { year, month, formatted };
  };

  // Filter sermons based on search term, year, and month
  const filteredSermons = sermons.filter((sermon) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      sermon.title.toLowerCase().includes(search) ||
      sermon.preacher.toLowerCase().includes(search) ||
      (sermon.description && sermon.description.toLowerCase().includes(search));

    const { year, month } = parseSermonDate(sermon.date);
    const matchesYear = selectedYear === "all" || year === selectedYear;
    const matchesMonth = selectedMonth === "all" || month.toLowerCase() === selectedMonth.toLowerCase();

    return matchesSearch && matchesYear && matchesMonth;
  });

  // Group sermons by Year and Month (e.g. "August 2026", "July 2026")
  const groupedSermons: GroupedSermons = filteredSermons.reduce((acc, sermon) => {
    const { year, month } = parseSermonDate(sermon.date);
    const key = year !== "Other" && year !== "Archive" ? `${month} ${year}` : "Recorded Sermons";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(sermon);
    return acc;
  }, {} as GroupedSermons);

  // Get unique years for filter dropdown
  const uniqueYears = Array.from(
    new Set(
      sermons
        .map((s) => parseSermonDate(s.date).year)
        .filter((y) => y !== "Other" && y !== "Archive")
    )
  ).sort((a, b) => Number(b) - Number(a));

  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navigation />

      {/* Hero Header */}
      <section className="bg-church-primary text-white pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
            Sermon Archive
          </h1>
          <p className="text-church-accent max-w-xl mx-auto text-base md:text-lg">
            Search and listen to sermons.
          </p>

          {/* Search & Filter Bar */}
          <div className="mt-10 bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/20 max-w-3xl mx-auto space-y-3 md:space-y-0 md:flex md:items-center md:gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
              <Input
                type="text"
                placeholder="Search title, preacher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-gray-300 focus:bg-white/20 rounded-xl h-11"
              />
            </div>

            {/* Year Filter */}
            <div className="flex gap-2">
              <div className="relative flex-1 md:w-36">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full h-11 bg-white/10 border border-white/20 text-white rounded-xl px-3 text-sm focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="all" className="bg-church-primary text-white">All Years</option>
                  {uniqueYears.map((y) => (
                    <option key={y} value={y} className="bg-church-primary text-white">
                      {y}
                    </option>
                  ))}
                </select>
                <Filter className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              </div>

              {/* Month Filter */}
              <div className="relative flex-1 md:w-40">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full h-11 bg-white/10 border border-white/20 text-white rounded-xl px-3 text-sm focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="all" className="bg-church-primary text-white">All Months</option>
                  {monthsList.map((m) => (
                    <option key={m} value={m} className="bg-church-primary text-white">
                      {m}
                    </option>
                  ))}
                </select>
                <Filter className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-12 max-w-6xl flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="w-10 h-10 animate-spin text-church-primary mb-3" />
            <p className="font-semibold text-sm">Loading sermon archive...</p>
          </div>
        ) : Object.keys(groupedSermons).length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Sermons Found</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              No sermons matched your search filters. Try clearing the search or selecting a different month/year.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedSermons).map(([groupTitle, groupItems]) => (
              <div key={groupTitle} className="space-y-6">
                
                {/* Month/Year Group Header */}
                <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
                  <div className="p-2 rounded-xl bg-church-primary text-church-secondary">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-black text-church-primary tracking-tight">
                    {groupTitle}
                  </h3>
                  <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {groupItems.length} {groupItems.length === 1 ? "Sermon" : "Sermons"}
                  </span>
                </div>

                {/* Sermon Cards Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupItems.map((sermon) => {
                    const { formatted } = parseSermonDate(sermon.date);
                    const audioUrl = getCloudinaryUrl(sermon.audio_url);

                    return (
                      <div
                        key={sermon.id}
                        className="bg-white rounded-3xl p-4 sm:p-5 shadow-md border border-gray-100 flex flex-col justify-between hover:shadow-xl transition-shadow"
                      >
                        <div>
                          <span className="text-[10px] font-bold text-church-primary uppercase tracking-wider mb-1 block">
                            {formatted}
                          </span>
                          <h4 className="text-base font-bold text-gray-900 leading-tight mb-1 line-clamp-1">
                            {sermon.title}
                          </h4>
                          <p className="text-xs text-gray-600 font-semibold mb-2 flex items-center gap-1.5">
                            <MicVocal className="w-3.5 h-3.5 text-church-primary flex-shrink-0" />
                            <span>Preacher: {sermon.preacher}</span>
                          </p>
                          {sermon.description && (
                            <p className="text-xs text-gray-500 line-clamp-1 leading-normal mb-2">
                              {sermon.description}
                            </p>
                          )}
                        </div>

                        <div className="mt-2 pt-3 border-t border-gray-100">
                          <RedCirclePlayer 
                            audioUrl={audioUrl} 
                            speakerImage={sermon.preacher_image_url}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <FooterSection />
      <ChatButton />
    </div>
  );
}
