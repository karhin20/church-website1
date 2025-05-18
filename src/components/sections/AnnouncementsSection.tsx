export const AnnouncementsSection = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-church-primary mb-4">Announcements</h2>
        <p className="text-center text-church-text mb-12">Stay updated with our latest announcements</p>
        <div className="flex justify-center">
          <div className="aspect-video w-full max-w-3xl">
            <iframe
              className="w-full h-full rounded-lg shadow-lg"
              src="https://www.youtube.com/embed/j72jOk9489w" 
              title="26th January, 2025 Announcement"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}; 
