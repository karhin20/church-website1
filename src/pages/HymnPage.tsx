import { useParams, useNavigate } from "react-router-dom";
import { hymns } from "@/data/hymns";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Navigation } from "@/components/sections/Navigation";
import StanzaCard from "@/components/StanzaCard";
import { motion } from 'framer-motion';

const HymnPage = () => {
  const { number } = useParams();
  const navigate = useNavigate();
  
  const hymn = hymns.find(h => h.number === Number(number));

  if (!hymn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-serif mb-4">Hymn not found</h1>
        <Button onClick={() => navigate("/")} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Return Home
        </Button>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen pt-24 p-8 max-w-2xl mx-auto">
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-lg text-muted-foreground font-Microsoft Sans Serif">Hymn {hymn.number}</div>
            <h1 className="text-3xl font-serif font-semibold">{hymn.title}</h1>
          </div>
          
          <div className="space-y-8">
            {hymn.stanzas.map((stanza, index) => {
              const cardAnimation = {
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.5 }
              };

              if (index === 0) {
                return (
                  <div key={index}>
                    <motion.div {...cardAnimation}>
                      <StanzaCard index={index} stanza={stanza} />
                    </motion.div>
                    {hymn.chorus && (
                      <div className="mt-4 pl-6 border-l-2 border-primary/20">
                        <div className="text-xl text-church-primary text-bold font-serif">
                          Chorus
                        </div>
                        <p className="whitespace-pre-line leading-relaxed text-xl">
                          {hymn.chorus.join("\n")}
                        </p>
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <motion.div key={index} {...cardAnimation}>
                  <StanzaCard index={index} stanza={stanza} />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default HymnPage;