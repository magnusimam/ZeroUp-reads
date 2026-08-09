import React from 'react';
import VocabularyWord from './VocabularyWord';

// Renders one page's paragraph, splicing in a VocabularyWord for each
// glossary match `useReadingPage` already picked out (via
// vocabulary.js#pickVocabularyWords) — kept as its own component so the
// text-splicing logic doesn't live inline in ReadingPage's JSX.
export default function ReadingText({ text, matches, style, className }) {
  if (!matches?.length) {
    return <p className={className} style={style}>{text}</p>;
  }

  const sorted = [...matches].sort((a, b) => a.index - b.index);
  const nodes = [];
  let cursor = 0;

  sorted.forEach((match, i) => {
    if (match.index > cursor) nodes.push(<React.Fragment key={`t-${i}`}>{text.slice(cursor, match.index)}</React.Fragment>);
    const matchedText = text.slice(match.index, match.index + match.word.length);
    nodes.push(<VocabularyWord key={`v-${i}`} word={matchedText} definition={match.definition} />);
    cursor = match.index + match.word.length;
  });
  if (cursor < text.length) nodes.push(<React.Fragment key="t-end">{text.slice(cursor)}</React.Fragment>);

  return <p className={className} style={style}>{nodes}</p>;
}
