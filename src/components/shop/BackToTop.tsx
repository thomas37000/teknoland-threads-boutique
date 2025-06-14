
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

interface BackToTopProps {
  show: boolean;
  onClick: () => void;
}

const BackToTop = ({ show, onClick }: BackToTopProps) => {
  if (!show) return null;

  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 rounded-full p-3 bg-tekno-blue hover:bg-tekno-black text-white shadow-lg z-50"
      size="icon"
      aria-label="Retour en haut"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
};

export default BackToTop;
