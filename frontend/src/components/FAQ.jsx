import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { useLang } from '../context/LanguageContext';
import { t } from '../lib/translations';

export const FAQ = () => {
  const { lang } = useLang();
  const tr = t[lang].faq;

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
            {tr.tag}
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white uppercase mt-4 mb-4">
            {tr.title}
          </h2>
          <p className="text-zinc-400">
            {tr.sub}
          </p>
        </div>

        {/* Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {tr.items.map((faq, index) => (
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
