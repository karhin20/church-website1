import { Church, Users, Heart } from "lucide-react";
import { motion } from "framer-motion";

export const FeaturesSection = () => {
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
    <section className="py-24 bg-church-background">
      <div className="container mx-auto grid md:grid-cols-3 gap-12 px-4">
        {/* Worship */}
        <motion.div 
          className="text-center group hover:scale-105 transition-transform duration-300 p-8 rounded-xl bg-white shadow-lg border border-gray-100"
          {...fadeInUp}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex justify-center mb-6">
            <Church className="w-16 h-16 text-church-secondary group-hover:text-church-primary transition-colors duration-300" />
          </div>
          <h3 className="text-2xl font-bold mb-4 text-church-primary">WORSHIP</h3>
          <p className="text-church-text leading-relaxed">
            Join us for spirit-filled worship services every Sunday and Wednesday.
          </p>
        </motion.div>

        {/* Connect */}
        <motion.div 
          className="text-center group hover:scale-105 transition-transform duration-300 p-8 rounded-xl bg-white shadow-lg border border-gray-100"
          {...fadeInUp}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex justify-center mb-6">
            <Users className="w-16 h-16 text-church-secondary group-hover:text-church-primary transition-colors duration-300" />
          </div>
          <h3 className="text-2xl font-bold mb-4 text-church-primary">CONNECT</h3>
          <p className="text-church-text leading-relaxed">
            Be part of our vibrant community through various fellowship programs.
          </p>
        </motion.div>

        {/* God's Love */}
        <motion.div 
          className="text-center group hover:scale-105 transition-transform duration-300 p-8 rounded-xl bg-white shadow-lg border border-gray-100"
          {...fadeInUp}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex justify-center mb-6">
            <Heart className="w-16 h-16 text-church-secondary group-hover:text-church-primary transition-colors duration-300" />
          </div>
          <h3 className="text-2xl font-bold mb-4 text-church-primary">GOD'S LOVE</h3>
          <p className="text-church-text leading-relaxed">
            Experience and share the transforming love of God in our community.
          </p>
        </motion.div>
      </div>
    </section>
  );
}; 