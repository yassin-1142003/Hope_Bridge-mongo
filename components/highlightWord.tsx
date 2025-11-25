export function highlightWord(text: string, word: string, className: string) {
  const parts = text.split(word);
  return (
    <>
      {parts[0]}
      <span className={className}>{word}</span>
      {parts[1]}
    </>
  );
}
