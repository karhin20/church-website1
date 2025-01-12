import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RedCirclePlayer } from '@/components/RedCirclePlayer';
import { motion } from "framer-motion";

export const SermonsSection = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false },
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.6 
    }
  };

  return (
    <section className="py-24 bg-church-primary text-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ 
            type: "spring",
            stiffness: 100,
            damping: 15,
            duration: 0.6 
          }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Latest Sermons</h2>
          <p className="text-center text-church-accent mb-12">Listen to our most recent messages</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Sermon cards with repeated animation */}
          <motion.div 
            className="bg-white/10 p-6 rounded-lg backdrop-blur-sm"
            {...fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="text-lg font-semibold mb-2 text-church-secondary">Catch The Glory Conference 2024</h4>
            <p className="text-church-accent mb-4 text-sm">Pastor Ebo Ansah Awotwi • August 18, 2024</p> 
            <div className="mt-4">
              <RedCirclePlayer 
                audioUrl="https://stream.redcircle.com/episodes/da3067b9-91b1-4e75-aae0-435b666eef57/stream.mp3"
                speakerImage="https://media.redcircle.com/images/2025/1/6/9/6335cc53-7413-49ec-98fd-ac27ee37e753_18619985-1736112364643-8b27f46b06a0e.jpg?d=440x440"
              />
            </div>
          </motion.div>

          <motion.div 
            className="bg-white/10 p-6 rounded-lg backdrop-blur-sm"
            {...fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-lg font-semibold mb-2 text-church-secondary">Benefits of the Resurrection A</h4> 
            <p className="text-church-accent mb-4 text-sm">Apostle J. K. Atinyo • March 31, 2024</p>
            <div className="mt-4">
              <RedCirclePlayer 
                audioUrl="https://stream.redcircle.com/episodes/362dda22-9b34-4bf3-8fda-9ce42481f30b/stream.mp3"
                speakerImage="https://media.redcircle.com/images/2025/1/6/9/288911b1-7f78-451b-9257-310b6ac14b64_18619985-1736111878446-25f831a598b9.jpg?d=440x440"
              />
            </div>
          </motion.div>

          <motion.div 
            className="bg-white/10 p-6 rounded-lg backdrop-blur-sm"
            {...fadeInUp}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="text-lg font-semibold mb-2 text-church-secondary">Giving</h4> 
            <p className="text-church-accent mb-4 text-sm">Pastor Richard Mensah</p> 
            <div className="mt-4">
              <RedCirclePlayer 
                audioUrl="https://stream.redcircle.com/episodes/ed209ace-ab9f-43ac-a02b-9d8ed651e20b/stream.mp3"
                speakerImage="https://media.redcircle.com/images/2025/1/6/9/de5a1819-c6ff-42c4-a171-f2ec3c478fb2_18619985-1634160731906-274fa4dcd87fa.jpg?d=440x440"
              />
            </div>
          </motion.div>
        </div>

        <motion.div 
          className="flex justify-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ 
            type: "spring",
            stiffness: 100,
            damping: 15,
            duration: 0.6,
            delay: 0.4 
          }}
        >
          <a 
            href="https://open.spotify.com/show/7LOx7uSxQbVdE0PiADRClU" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button 
              className="bg-church-secondary text-church-primary hover:bg-church-secondary/90 px-8 py-6 text-lg rounded-full font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              Listen to More Sermons
            </Button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}; 