import { useNavigate, Link } from "react-router-dom";
import NumPad from "@/components/NumPad";
import SearchBar from "@/components/SearchBar";
import { hymns } from "@/data/hymns";
import { useToast } from "@/components/ui/use-toast";
import { Navigation } from "@/components/sections/Navigation";
import { motion } from 'framer-motion';

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

        <Navigation />

        <div className="text-center space-y-2">
          <motion.div
            className="text-church-primary pt-16 p-4 rounded-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-serif font-semibold">TAC-GH HYMNS</h2>
          </motion.div>
          <motion.p
            className="text-muted-foreground"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Enter a hymn number or search by title
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <SearchBar />
        </motion.div>

        <div className="h-px bg-border" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <NumPad onNumberSubmit={handleNumberSubmit} />
        </motion.div>
      </div>
    </div>
  );
};

export default HymnHome;