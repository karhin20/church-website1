import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export const UpcomingEvents = () => {
  const events = [
    {
      date: "March 24",
      time: "9:00 AM",
      title: "Sunday Service",
      description: "Join us for our weekly Sunday worship service"
    },
    {
      date: "March 26",
      time: "6:30 PM",
      title: "Prayer Meeting",
      description: "Mid-week prayer and Bible study session"
    },
    {
      date: "March 30",
      time: "10:00 AM",
      title: "Youth Conference",
      description: "Annual youth conference with guest speakers"
    }
  ];

  return (
    <section className="py-24 bg-church-accent/20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-church-primary mb-4">Upcoming Events</h2>
        <p className="text-center text-church-text mb-12">Join us in these upcoming activities</p>
        
        <div className="grid md:grid-cols-3 gap-8">
          {events.map((event, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-church-secondary">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span className="font-semibold">{event.date}</span>
                </div>
                <span className="text-church-primary font-medium">{event.time}</span>
              </div>
              <h3 className="text-xl font-bold text-church-primary mb-2">{event.title}</h3>
              <p className="text-church-text mb-4">{event.description}</p>
              <Button 
                variant="outline" 
                className="w-full border-church-primary text-church-primary hover:bg-church-primary hover:text-white"
              >
                Learn More
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};