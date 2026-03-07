import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';

const faqs = [
  {
    question: 'Do I need gym equipment?',
    answer: 'No! Our programs are designed to work with minimal or no equipment. Many exercises use just your bodyweight. If you have basic items like dumbbells or resistance bands, that\'s a bonus, but they\'re not required to get started.',
  },
  {
    question: 'Are these programs suitable for complete beginners?',
    answer: 'Absolutely! FitStart is specifically designed for beginners. Every exercise includes detailed video demonstrations, proper form guidance, and modifications for different fitness levels. You don\'t need any prior experience.',
  },
  {
    question: 'What happens after I purchase?',
    answer: 'Immediately after purchase, you\'ll receive access to your program dashboard. You\'ll get your complete workout schedule, video library, nutrition guide, and all bonus materials. You can start your first workout right away!',
  },
  {
    question: 'Can I do these workouts at home?',
    answer: 'Yes! All our programs are designed for home workouts. You can exercise in your living room, bedroom, or anywhere with a bit of space. No gym membership required.',
  },
  {
    question: 'Is there a refund policy?',
    answer: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied with your program for any reason, contact us within 30 days of purchase for a full refund. No questions asked.',
  },
  {
    question: 'How do I access my program after purchase?',
    answer: 'After purchase, you\'ll create your account and get instant access to your personal dashboard. All your workouts, videos, and materials are available 24/7 from any device - computer, tablet, or phone.',
  },
];

export const FAQ = () => {
  return (
    <section
      id="faq"
      data-testid="faq-section"
      className="py-24 md:py-32 bg-[#0a0a0a]"
    >
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-green-500 text-sm font-semibold uppercase tracking-widest">
            Got Questions?
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white uppercase mt-4 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-zinc-400">
            Everything you need to know about getting started.
          </p>
        </div>

        {/* Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              data-testid={`faq-item-${index + 1}`}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-6 data-[state=open]:border-green-500/50 transition-colors"
            >
              <AccordionTrigger 
                className="text-left text-white font-medium py-5 hover:text-green-400 hover:no-underline [&[data-state=open]]:text-green-400"
                data-testid={`faq-trigger-${index + 1}`}
              >
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-zinc-400 pb-5 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
