import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Palette } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 items-center justify-center p-8">
        <div className="text-center text-white">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <Palette className="w-12 h-12" />
            <span className="text-3xl font-bold">Gaiamundi</span>
          </Link>
          <p className="text-lg text-white/80 max-w-md">
            Where art meets the cosmos. Discover unique artworks from visionary artists around the world.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-background">
        {/* Mobile logo */}
        <div className="md:hidden mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <Palette className="w-8 h-8 text-violet-600" />
            <span className="text-2xl font-bold">Gaiamundi</span>
          </Link>
        </div>

        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
