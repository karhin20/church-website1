import React from 'react';
import { motion } from 'framer-motion';

interface StanzaCardProps {
  index: number;
  stanza: string;
}

const StanzaCard: React.FC<StanzaCardProps> = ({ index, stanza }) => {
  return (
    <motion.div
      className="border rounded-lg p-4 shadow-md mb-4"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: false }}
    >
      <div className="text-xl text-church-primary font-bold font-serif">
        {index + 1}
      </div>
      <p className="whitespace-pre-line leading-relaxed font-semibold text-xl">
        {stanza}
      </p>
    </motion.div>
  );
};

export default StanzaCard; 