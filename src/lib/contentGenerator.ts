import type { LookCloserItem, MetObject } from './types';
import { cleanText } from './metadata';

export interface EducationalContent {
  summary: string;
  whyItMatters: string;
  lookCloser: LookCloserItem[];
}

export function generateFallbackContent(object: MetObject): EducationalContent {
  const title = cleanText(object.title) || 'This object';
  const medium = cleanText(object.medium);
  const date = cleanText(object.objectDate);
  const culture = cleanText(object.culture);
  const maker = cleanText(object.artistDisplayName);
  const department = cleanText(object.department);
  const period = cleanText(object.period) || cleanText(object.dynasty);
  const dimensions = cleanText(object.dimensions);
  const summary = [
    `“${title}”${date ? ` is dated ${date}` : ' is in The Metropolitan Museum of Art collection'}.`,
    maker ? `The Met lists the maker as ${maker}.` : culture ? `The Met associates this object with ${culture}.` : '',
    medium ? `Its listed medium is ${medium}.` : '',
  ].filter(Boolean).join(' ');
  const whyItMatters = [
    department ? `At The Met, this object belongs to the collection listed as ${department}.` : 'This object is preserved in The Metropolitan Museum of Art collection.',
    period ? `The museum places it in the period ${period}.` : '',
    'Explore the details of its materials, form, and period, then visit the original Met record for its full curatorial information.',
  ].filter(Boolean).join(' ');
  const observations: LookCloserItem[] = [];
  if (medium) observations.push({ label: 'Material', text: `Notice the medium: ${medium}. Think about what working with these materials would have required.` });
  if (date) observations.push({ label: 'Time', text: `This work dates to ${date}. Consider what survives across that amount of time.` });
  if (culture) observations.push({ label: 'Culture', text: `The Met associates this object with ${culture}. Look closely at its shape, decoration, or construction.` });
  if (dimensions) observations.push({ label: 'Scale', text: `The listed dimensions are ${dimensions}. Compare its real scale with how large it appears on screen.` });
  if (maker) observations.push({ label: 'Maker', text: `The Met lists the maker as ${maker}. How does knowing the maker’s identity affect the questions you bring to this work?` });
  observations.push(
    { label: 'Form', text: 'Follow the outline of the object. Where does your eye pause, and where does it move next?' },
    { label: 'Detail', text: 'Choose one small detail you did not notice at first. How does it relate to the object as a whole?' },
    { label: 'Perspective', text: 'Consider what a photograph can show, and what you would want to examine in person.' },
  );
  return { summary, whyItMatters, lookCloser: observations.slice(0, 3) };
}
