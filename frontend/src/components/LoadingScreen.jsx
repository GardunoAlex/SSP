import { Loader2 } from "lucide-react";

const LoadingScreen = ({ message = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-cream">
      <div className="flex flex-col items-center justify-center">
        <Loader2 className="w-16 h-16 text-purple-700 animate-spin" />
        <p className="text-xl text-purple-700 mt-6">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;