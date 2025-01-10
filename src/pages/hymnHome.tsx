import { useNavigate, Link } from "react-router-dom";
import NumPad from "@/components/NumPad";
import SearchBar from "@/components/SearchBar";
import { hymns } from "@/data/hymns";
import { useToast } from "@/components/ui/use-toast";
import { Navigation } from "@/components/sections/Navigation";

const HymnHome = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleNumberSubmit = (number: string) => {
    const hymn = hymns.find(h => h.number === parseInt(number));
    if (hymn) {
      navigate(`/hymn/${number}`);
    } else {
      toast({
        title: "Hymn not found",
        description: `No hymn found with number ${number}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-church-background p-4">
      <div className="max-w-2xl mx-auto space-y-12">

          <Navigation/>

         <div className="text-center space-y-2">
          <div className=" text-church-primary  p-4 rounded-lg">
            <h2 className="text-3xl font-serif font-semibold">TAC-GH HYMN</h2>
          </div>
          <p className="text-muted-foreground">Enter a hymn number or search by title</p>
        </div>

        <SearchBar />
        
        <div className="h-px bg-border" />
        
        <NumPad onNumberSubmit={handleNumberSubmit} />
      </div>
    </div>
  );
};

export default HymnHome;