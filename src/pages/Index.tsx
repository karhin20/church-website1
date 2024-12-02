import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-church-background">
      {/* Header */}
      <header className="bg-church-primary text-white p-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">The Apostolic Church - Gh</h1>
          <p className="text-church-secondary mt-2">Nii Boiman Central</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <section className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-church-primary mb-4">Welcome to Our Church</h2>
          <p className="text-church-text max-w-2xl mx-auto">
            Join us in worship and fellowship as we grow together in faith and community.
          </p>
        </section>

        {/* Service Times */}
        <section className="mb-12 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-church-primary mb-4">Service Times</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h4 className="font-semibold">Sunday Service</h4>
              <p>9:00 AM - 11:30 AM</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold">Wednesday Bible Study</h4>
              <p>6:30 PM - 8:00 PM</p>
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="mb-12 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-church-primary mb-4">Location</h3>
          <p>123 Church Street, Nii Boiman, Accra</p>
          <p className="mt-2">Contact: +233 XX XXX XXXX</p>
        </section>

        {/* Chat Button */}
        <div className="text-center mt-8">
          <Link to="/chat">
            <Button className="bg-church-primary hover:bg-church-primary/90 text-white px-8 py-4 rounded-full text-lg">
              Chat with Us
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Index;