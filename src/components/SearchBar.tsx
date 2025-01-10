import { Input } from "@/components/ui/input";
import { useState } from "react";
import { hymns } from "@/data/hymns";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  const filteredHymns = hymns.filter(hymn =>
    hymn.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative max-w-md mx-auto">
      <Input
        type="text"
        placeholder="Search hymns by title..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setShowResults(true);
        }}
        className="w-full p-4"
      />
      {showResults && searchTerm && (
        <div className="absolute w-full mt-1 bg-card border rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
          {filteredHymns.map((hymn) => (
            <button
              key={hymn.number}
              className="w-full text-left px-4 py-2 hover:bg-secondary transition-colors"
              onClick={() => {
                navigate(`/hymn/${hymn.number}`);
                setSearchTerm("");
                setShowResults(false);
              }}
            >
              <span className="font-serif">{hymn.number}.</span> {hymn.title}
            </button>
          ))}
          {filteredHymns.length === 0 && (
            <div className="px-4 py-2 text-muted-foreground">
              No hymns found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;