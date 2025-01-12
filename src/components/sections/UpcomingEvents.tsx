import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const UpcomingEvents = () => {
  const events = [
    {
      date: "Every Sunday",
      time: "7:00 AM",
      title: "Sunday Service",
      description: "Join us for our weekly Sunday worship service"
    },
    {
      date: "Wednesdays",
      time: "6:00 PM",
      title: "Mid-Week Service",
      description: "Bible study session"
    },
    {
      date: "March 30",
      time: "6:00 PM",
      title: "Youth Ministry Service",
      description: "Weekly Special Youth Service"
    }
  ];

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
    <section className="py-24 bg-church-accent/20">
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
          <h2 className="text-3xl md:text-4xl font-bold text-center text-church-primary mb-4">
            Upcoming Events
          </h2>
          <p className="text-center text-church-text mb-12">
            Join us in these upcoming activities
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {events.map((event, index) => (
            <motion.div 
              key={index}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
              {...fadeInUp}
              transition={{ 
                type: "spring",
                stiffness: 100,
                damping: 15,
                duration: 0.6,
                delay: index * 0.1 
              }}
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};