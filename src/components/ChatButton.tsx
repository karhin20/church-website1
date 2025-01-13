import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const ChatButton = () => {
  return (
    <div className="fixed bottom-8 right-8 flex flex-col items-center">
      <Link to="/chat">
        <Button className="bg-church-secondary hover:bg-church-secondary/90 text-church-primary rounded-full p-4 shadow-lg hover:scale-110 transition-all duration-300 mb-1">
          <MessageCircle className="w-6 h-6" />
        </Button>
      </Link>
      <span className="text-church-primary text-xs font-medium">Aposor Kofi</span>
    </div>
  );
}; 