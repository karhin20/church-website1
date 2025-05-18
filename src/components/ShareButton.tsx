import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ShareButtonProps {
  title?: string;
  text?: string;
  url?: string;
}

export const ShareButton = ({ title, text, url }: ShareButtonProps) => {
  const { toast } = useToast();

  const handleShare = async () => {
    const shareUrl = url || window.location.href;
    const shareTitle = title || document.title;
    const shareText = text || "Check this out!";

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied!",
          description: "The link has been copied to your clipboard.",
        });
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast({
          title: "Error",
          description: "Failed to copy the link. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      className="flex items-center gap-2"
    >
      <Share2 className="w-4 h-4" />
      Share
    </Button>
  );
}; 