import { useMemo, useState } from 'react';
import { FAQ_ITEMS, FAQ_PREVIEW_COUNT, HELP_TOPICS } from './helpConfig';

const topicTitle = id => HELP_TOPICS.find(t => t.id === id)?.title || '';

// Every word of the query must appear somewhere in the question, answer or
// its topic's name — so "download books" matches the offline FAQ even though
// it never says "download books" verbatim.
function matchesQuery(item, query) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = `${item.q} ${item.a} ${topicTitle(item.topic)}`.toLowerCase();
  // crude plural folding ("books" → "book"), skipped for short words like "is"
  return words.every(w => haystack.includes(w.length > 3 ? w.replace(/s$/, '') : w));
}

// Help Center page state: hero search, topic filter and FAQ expansion
// (Separation of Concerns — HelpCenterPage and its components stay
// presentational).
export default function useHelpCenter() {
  const [query, setQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const filteredFaqs = useMemo(
    () => FAQ_ITEMS.filter(item => (!activeTopic || item.topic === activeTopic) && matchesQuery(item, query)),
    [query, activeTopic],
  );

  const isFiltering = Boolean(query.trim() || activeTopic);
  // While searching/filtering, show every match; otherwise the short preview.
  // Memoized: FAQAccordion collapses its open answer when this array changes.
  const visibleFaqs = useMemo(
    () => (isFiltering || showAll ? filteredFaqs : filteredFaqs.slice(0, FAQ_PREVIEW_COUNT)),
    [filteredFaqs, isFiltering, showAll],
  );
  const hiddenCount = filteredFaqs.length - visibleFaqs.length;

  function search(text) {
    setQuery(text);
    setActiveTopic(null);
  }

  function selectTopic(id) {
    setActiveTopic(id);
    setQuery('');
  }

  function clearFilters() {
    setActiveTopic(null);
    setQuery('');
  }

  return {
    query, setQuery, search,
    activeTopic, activeTopicTitle: topicTitle(activeTopic), selectTopic, clearFilters,
    visibleFaqs, hiddenCount, isFiltering,
    showAll, setShowAll,
  };
}
