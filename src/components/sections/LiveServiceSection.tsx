import { MicVocal } from "lucide-react";

export const LiveServiceSection = () => {
  return (
    <section className="my-8 px-4 md:px-8">
      {/* Header moved outside the grid */}
      <div className="live-service flex items-center justify-center mb-6">
        <MicVocal className="text-3xl md:text-4xl text-church-primary mr-2" />
        <h2 className="text-3xl md:text-4xl font-bold text-church-primary">
          Live Service
        </h2>
      </div>

      {/* Grid container with adjusted columns */}
      <div className="grid md:grid-cols-5 gap-6">
        {/* Podbean player taking 3/5 of the space */}
        <div className="md:col-span-3 bg-white rounded-lg shadow-md p-4">
          <iframe 
            height="150" 
            width="100%" 
            style={{ border: 'none' }} 
            scrolling="no" 
            data-name="pb-iframe-player" 
            src="https://www.podbean.com/live-player/?channel_id=WXPoH0puz9" 
            referrerPolicy="no-referrer-when-downgrade" 
            allow="autoplay" 
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            allowFullScreen
          />
        </div>

        {/* Support section taking 2/5 of the space */}
        <div className="md:col-span-2 bg-church-secondary rounded-lg shadow-md p-6">
          <h4 className="text-md font-semibold font-serif text-center mb-4">
            Contribute to God's Work
          </h4>
          <p className="text-base font-medium mb-3">
            MOMO NUMBER: <strong className="text-lg">0597672546</strong>
          </p>
          <p className="text-sm">
            ACCOUNT NAME: <strong className="text-sm">THE TAC AHWC NII BOIMAN</strong>
          </p>
        </div>
      </div>
    </section>
  );
};