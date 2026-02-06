import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Loader2 className="w-12 h-12 animate-spin text-violet-600 mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
