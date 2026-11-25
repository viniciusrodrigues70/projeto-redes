const PIP_PATTERNS = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export default function Dice({ value, isRolling }) {
  const visiblePips = new Set(PIP_PATTERNS[value] || PIP_PATTERNS[1]);

  return (
    <div
      role="img"
      className={`dice-face ${isRolling ? 'dice-face--rolling' : ''}`}
      aria-label={`Dado com valor ${value}`}
    >
      {Array.from({ length: 9 }, (_, index) => {
        const isVisible = visiblePips.has(index);
        return (
          <span
            key={index}
            className={`dice-pip ${isVisible ? 'dice-pip--visible' : ''} ${
              isVisible && value === 6 ? 'dice-pip--six' : ''
            }`}
          />
        );
      })}
    </div>
  );
}
