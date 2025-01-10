import React from "react";
import { Button } from "@/components/ui/button";

interface NumPadProps {
  onNumberSubmit: (number: string) => void;
}

const NumPad = ({ onNumberSubmit }: NumPadProps) => {
  const [input, setInput] = React.useState("");

  const handleNumberClick = (num: string) => {
    if (input.length < 3) {
      setInput(prev => prev + num);
    }
  };

  const handleClear = () => {
    setInput("");
  };

  const handleSubmit = () => {
    if (input) {
      onNumberSubmit(input);
      setInput("");
    }
  };

  return (
    <div className="max-w-xs mx-auto">
      <div className="mb-4">
        <input
          type="text"
          value={input}
          readOnly
          className="w-full text-center text-2xl p-4 rounded-lg bg-secondary border-2 border-primary/20 font-serif"
          placeholder="Enter hymn number"
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Button
            key={num}
            onClick={() => handleNumberClick(num.toString())}
            variant="outline"
            className="p-6 text-xl text-church-primary font-bold font-serif hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {num}
          </Button>
        ))}
        <Button
          onClick={handleClear}
          variant="outline"
          className="p-6 text-xl font-serif hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          C
        </Button>
        <Button
          onClick={() => handleNumberClick("0")}
          variant="outline"
          className="p-6 text-church-primary font-bold text-xl font-serif hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          0
        </Button>
        <Button
          onClick={handleSubmit}
          variant="outline"
          className="p-6 text-xl font-serif hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          →
        </Button>
      </div>
    </div>
  );
};

export default NumPad;