import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Palette, Heart, Globe, Sparkles } from 'lucide-react';

export default function AboutPage() {
  const { t } = useTranslation();

  const artists = [
    {
      name: 'Mel',
      slug: 'mel',
      specialty: 'Nature & Fantasy',
      bio: 'Mel is a visionary artist whose work explores the ethereal boundaries between the natural world and the cosmic realm. With a background in fine arts and digital media, Mel creates pieces that transport viewers to otherworldly landscapes.',
      exhibitions: [
        { year: '2023', title: 'Cosmic Visions', venue: 'Berlin Art Gallery' },
        { year: '2022', title: 'Nature\'s Dreams', venue: 'Munich Contemporary' },
        { year: '2021', title: 'Ethereal Light', venue: 'Hamburg Art Space' },
      ],
      publications: [
        { year: '2023', title: 'Art Monthly - Featured Artist' },
        { year: '2022', title: 'Digital Art Review - Interview' },
      ],
    },
    {
      name: 'Lena',
      slug: 'lena',
      specialty: 'Portrait & Illustration',
      bio: 'Lena is an expressive portrait artist who delves deep into human emotion and identity. Her bold use of color and form creates powerful visual narratives that challenge viewers to see beyond the surface.',
      exhibitions: [
        { year: '2023', title: 'Faces of Tomorrow', venue: 'Cologne Modern Art' },
        { year: '2022', title: 'Identity Unveiled', venue: 'Frankfurt Art House' },
        { year: '2020', title: 'Emotional Landscapes', venue: 'Stuttgart Gallery' },
      ],
      publications: [
        { year: '2023', title: 'Portrait Arts - Cover Feature' },
        { year: '2021', title: 'Illustration Weekly - Profile' },
      ],
    },
  ];

  const values = [
    {
      icon: Palette,
      title: 'Artistic Excellence',
      description: 'We curate only the finest artworks, ensuring each piece meets our high standards of creativity and craftsmanship.',
    },
    {
      icon: Heart,
      title: 'Artist Support',
      description: 'We believe in fair compensation for artists, providing them with a platform to thrive and grow their careers.',
    },
    {
      icon: Globe,
      title: 'Global Community',
      description: 'We connect artists and collectors from around the world, fostering a diverse and inclusive creative ecosystem.',
    },
    {
      icon: Sparkles,
      title: 'Unique Discoveries',
      description: 'Every artwork on our platform is unique, offering collectors the opportunity to own something truly special.',
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-violet-50 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              {t('about.title')}
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover the story behind Gaiamundi and the artists who make our platform extraordinary.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-6">{t('about.philosophy')}</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {t('about.philosophyText')}
              </p>
              <h3 className="text-xl font-semibold mb-4">{t('about.mission')}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('about.missionText')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 gap-4"
            >
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="p-6 bg-muted rounded-xl"
                >
                  <value.icon className="w-8 h-8 text-violet-600 mb-4" />
                  <h4 className="font-semibold mb-2">{value.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Artists Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {t('about.artists')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Meet the visionary creators behind our collection
            </p>
          </motion.div>

          <div className="space-y-16">
            {artists.map((artist, index) => (
              <motion.div
                key={artist.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="bg-background rounded-2xl overflow-hidden shadow-sm"
              >
                <div className="grid lg:grid-cols-3 gap-8 p-8">
                  {/* Artist Image Placeholder */}
                  <div className="lg:col-span-1">
                    <div className="aspect-square rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                      <span className="text-6xl font-bold text-violet-300">
                        {artist.name[0]}
                      </span>
                    </div>
                  </div>

                  {/* Artist Info */}
                  <div className="lg:col-span-2">
                    <h3 className="text-2xl font-bold mb-2">{artist.name}</h3>
                    <p className="text-violet-600 font-medium mb-4">
                      {artist.specialty}
                    </p>
                    <p className="text-muted-foreground mb-6">{artist.bio}</p>

                    {/* Exhibitions */}
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3">Exhibitions</h4>
                      <ul className="space-y-2">
                        {artist.exhibitions.map((exhibition, i) => (
                          <li
                            key={i}
                            className="text-sm text-muted-foreground flex items-center gap-2"
                          >
                            <span className="text-violet-600 font-medium">
                              {exhibition.year}
                            </span>
                            <span>{exhibition.title}</span>
                            <span className="text-muted-foreground/60">
                              — {exhibition.venue}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Publications */}
                    <div>
                      <h4 className="font-semibold mb-3">Publications</h4>
                      <ul className="space-y-2">
                        {artist.publications.map((pub, i) => (
                          <li
                            key={i}
                            className="text-sm text-muted-foreground flex items-center gap-2"
                          >
                            <span className="text-violet-600 font-medium">
                              {pub.year}
                            </span>
                            <span>{pub.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
