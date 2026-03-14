import { Star, Quote } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { t } from '../lib/translations';

const authors = [
  {
    name: 'Sarah Mitchell',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
  },
  {
    name: 'Marcus Johnson',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  },
  {
    name: 'Emily Chen',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  },
];

export const Testimonials = () => {
  const { lang } = useLang();
  const tr = t[lang].testimonials;

  return (
    <section
      id="testimonials"
      data-testid="testimonials-section"
      className="py-24 md:py-32 bg-[#0f0f0f]"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-green-500 text-sm font-semibold uppercase tracking-widest">
            {tr.tag}
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white uppercase mt-4 mb-4">
            {tr.title}
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            {tr.sub}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tr.reviews.map((testimonial, index) => (
            <div
              key={index}
              data-testid={`testimonial-card-${index + 1}`}
              className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-8 backdrop-blur-sm hover:border-zinc-700 transition-colors relative"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-green-500/20" />

              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-green-500 fill-green-500" />
                ))}
              </div>

              <p className="text-zinc-300 mb-6 leading-relaxed">
                "{testimonial.review}"
              </p>

              <div className="flex items-center gap-4 pt-6 border-t border-zinc-800">
                <img
                  src={authors[index].image}
                  alt={authors[index].name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-zinc-700"
                />
                <div>
                  <p className="text-white font-semibold">{authors[index].name}</p>
                  <p className="text-zinc-500 text-sm">{testimonial.program}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
