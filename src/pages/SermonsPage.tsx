import { useEffect, useState } from "react";
import { Navigation } from "@/components/sections/Navigation";
import { FooterSection } from "@/components/sections/FooterSection";
import { ChatButton } from "@/components/ChatButton";
import { RedCirclePlayer } from "@/components/RedCirclePlayer";
import { supabase, SermonItem } from "@/lib/supabase";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import { Search, Calendar, Disc3, MicVocal, Loader2, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface GroupedSermons {
  [yearMonthKey: string]: SermonItem[];
}

export default function SermonsPage() {
  const [sermons, setSermons] = useState<SermonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
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
    const month = dateObj.toLocaleString("en-US", { month: "Long" });
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
    <div className="min-h-screen bg-slate-50 font-sans pt-20">
      <Navigation />

      {/* Hero Banner Header */}
      <div className="bg-church-primary text-white py-16 px-4 mb-10 border-b border-church-secondary/20">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-church-secondary/20 text-church-secondary text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider mb-4 border border-church-secondary/30">
              <Disc3 className="w-4 h-4 animate-spin [animation-duration:10s]" />
              <span>SERMON ARCHIVE</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight text-white">
              Recorded Sermons & Messages
            </h1>
            <p className="text-church-accent max-w-xl mx-auto text-sm md:text-base leading-relaxed">
              Explore and listen to recorded sermons from Nii Boiman Central, sorted by month and year.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Filter & Search Bar Section */}
      <div className="container mx-auto px-4 max-w-6xl mb-12">
        <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search Input */}
          <div className="relative w-full md:w-1/2">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by sermon title, preacher name, or topic..."
              className="pl-12 h-12 rounded-2xl border-gray-200 focus:border-church-primary text-sm w-full"
            />
          </div>

          {/* Filter Dropdowns (Year & Month) */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider flex-shrink-0">
              <Filter className="w-4 h-4" />
              <span>Filter:</span>
            </div>

            {/* Year Dropdown */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold bg-gray-50 focus:outline-none focus:ring-2 focus:ring-church-primary text-gray-800"
            >
              <option value="all">All Years</option>
              {uniqueYears.map((yr) => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>

            {/* Month Dropdown */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold bg-gray-50 focus:outline-none focus:ring-2 focus:ring-church-primary text-gray-800"
            >
              <option value="all">All Months</option>
              {monthsList.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sermons Content Container */}
      <div className="container mx-auto px-4 max-w-6xl mb-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-church-primary">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm font-semibold">Loading recorded sermons...</span>
          </div>
        ) : Object.keys(groupedSermons).length === 0 ? (
          <div className="bg-white p-12 rounded-3xl shadow-sm border text-center max-w-lg mx-auto">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-gray-800 mb-1">No Sermons Found</h3>
            <p className="text-xs text-gray-500">
              No recorded sermons matched your search filters. Try clearing the search or selecting a different month/year.
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
                        className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 flex flex-col justify-between hover:shadow-xl transition-shadow"
                      >
                        <div>
                          <span className="text-[11px] font-bold text-church-primary uppercase tracking-wider mb-1 block">
                            {formatted}
                          </span>
                          <h4 className="text-lg font-bold text-gray-900 leading-snug mb-2 line-clamp-2">
                            {sermon.title}
                          </h4>
                          <p className="text-xs text-gray-600 font-semibold mb-3 flex items-center gap-1.5">
                            <MicVocal className="w-3.5 h-3.5 text-church-primary flex-shrink-0" />
                            <span>Preacher: {sermon.preacher}</span>
                          </p>
                          {sermon.description && (
                            <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed mb-4">
                              {sermon.description}
                            </p>
                          )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <RedCirclePlayer audioUrl={audioUrl} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ChatButton />
      <FooterSection />
    </div>
  );
}
