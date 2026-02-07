import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Filter, Grid3X3, List, ChevronDown, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGalleryStore } from '@/store';

// Mock data - would come from API
const mockArtworks = [
  {
    id: 1,
    title: 'Cosmic Dreams',
    artist: 'Mel',
    price: 450,
    category: 'fantasy',
    image: 'bg-violet-200',
  },
  {
    id: 2,
    title: 'Ethereal Portrait',
    artist: 'Lena',
    price: 380,
    category: 'portrait',
    image: 'bg-pink-200',
  },
  {
    id: 3,
    title: "Nature's Whisper",
    artist: 'Mel',
    price: 520,
    category: 'nature',
    image: 'bg-green-200',
  },
  {
    id: 4,
    title: 'Urban Fantasy',
    artist: 'Lena',
    price: 420,
    category: 'fantasy',
    image: 'bg-purple-200',
  },
  {
    id: 5,
    title: 'Morning Light',
    artist: 'Mel',
    price: 350,
    category: 'nature',
    image: 'bg-yellow-200',
  },
  {
    id: 6,
    title: 'Inner Vision',
    artist: 'Lena',
    price: 480,
    category: 'portrait',
    image: 'bg-blue-200',
  },
  {
    id: 7,
    title: 'Forest Magic',
    artist: 'Mel',
    price: 550,
    category: 'fantasy',
    image: 'bg-emerald-200',
  },
  {
    id: 8,
    title: 'Digital Dreams',
    artist: 'Lena',
    price: 390,
    category: 'illustration',
    image: 'bg-indigo-200',
  },
];

const categories = [
  { id: 'all', label: 'allArtworks' },
  { id: 'nature', label: 'nature' },
  { id: 'portrait', label: 'portrait' },
  { id: 'illustration', label: 'illustration' },
  { id: 'fantasy', label: 'fantasy' },
];

const sortOptions = [
  { id: 'newest', label: 'newest' },
  { id: 'oldest', label: 'oldest' },
  { id: 'priceLow', label: 'priceLow' },
  { id: 'priceHigh', label: 'priceHigh' },
  { id: 'popular', label: 'popular' },
];

export default function GalleryPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const {
    selectedCategory,
    selectedArtist,
    sortBy,
    viewMode,
    setSelectedCategory,
    setSelectedArtist,
    setSortBy,
    setViewMode,
  } = useGalleryStore();

  // Filter artworks
  const filteredArtworks = mockArtworks.filter((artwork) => {
    const matchesCategory =
      !selectedCategory || selectedCategory === 'all' || artwork.category === selectedCategory;
    const matchesArtist = !selectedArtist || artwork.artist === selectedArtist;
    const matchesSearch =
      !searchQuery ||
      artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artwork.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesArtist && matchesSearch;
  });

  // Sort artworks
  const sortedArtworks = [...filteredArtworks].sort((a, b) => {
    switch (sortBy) {
      case 'priceLow':
        return a.price - b.price;
      case 'priceHigh':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedArtist(null);
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCategory || selectedArtist || searchQuery;

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Header */}
      <section className="py-8 bg-muted/30 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{t('gallery.title')}</h1>

            {/* Search and Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('common.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className={showFilters ? 'bg-accent' : ''}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {t('gallery.filters')}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      {t('gallery.sortBy')}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {sortOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.id}
                        onClick={() => setSortBy(option.id)}
                        className={sortBy === option.id ? 'bg-accent' : ''}
                      >
                        {t(`gallery.${option.label}`)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    className="rounded-none rounded-l-md"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                    className="rounded-none rounded-r-md"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t"
              >
                <div className="flex flex-wrap gap-4">
                  {/* Category Filter */}
                  <div>
                    <p className="text-sm font-medium mb-2">{t('gallery.categories')}</p>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <Button
                          key={cat.id}
                          variant={selectedCategory === cat.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() =>
                            setSelectedCategory(selectedCategory === cat.id ? null : cat.id)
                          }
                        >
                          {t(`gallery.${cat.label}`)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Artist Filter */}
                  <div>
                    <p className="text-sm font-medium mb-2">{t('artwork.artist')}</p>
                    <div className="flex flex-wrap gap-2">
                      {['Mel', 'Lena'].map((artist) => (
                        <Button
                          key={artist}
                          variant={selectedArtist === artist ? 'default' : 'outline'}
                          size="sm"
                          onClick={() =>
                            setSelectedArtist(selectedArtist === artist ? null : artist)
                          }
                        >
                          {artist}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-4">
                    <X className="w-4 h-4 mr-2" />
                    Clear filters
                  </Button>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {sortedArtworks.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }
            >
              {sortedArtworks.map((artwork, index) => (
                <motion.div
                  key={artwork.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                >
                  <ArtworkCard artwork={artwork} viewMode={viewMode} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">{t('gallery.noResults')}</p>
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// Artwork Card Component
function ArtworkCard({
  artwork,
  viewMode,
}: {
  artwork: (typeof mockArtworks)[0];
  viewMode: 'grid' | 'list';
}) {
  if (viewMode === 'list') {
    return (
      <Link
        to={`/artwork/${artwork.id}`}
        className="flex gap-4 p-4 bg-muted rounded-xl hover:bg-accent transition-colors"
      >
        <div className={`w-24 h-24 rounded-lg ${artwork.image} flex-shrink-0`} />
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{artwork.title}</h3>
          <p className="text-muted-foreground">{artwork.artist}</p>
          <p className="text-violet-600 font-medium mt-1">€{artwork.price}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/artwork/${artwork.id}`}
      className="group block bg-muted rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className={`aspect-square ${artwork.image} relative overflow-hidden`}>
        <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-white/30 group-hover:scale-110 transition-transform duration-500">
          {artwork.title[0]}
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      </div>
      <div className="p-4">
        <h3 className="font-semibold group-hover:text-violet-600 transition-colors">
          {artwork.title}
        </h3>
        <p className="text-sm text-muted-foreground">{artwork.artist}</p>
        <p className="text-violet-600 font-medium mt-2">€{artwork.price}</p>
      </div>
    </Link>
  );
}
