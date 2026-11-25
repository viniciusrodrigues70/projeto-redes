import Dice from './Dice.jsx';

export default function GameControls({
  activePlayer,
  diceValue,
  hasRolled,
  isRolling,
  onRollDice,
  onNewGame,
}) {
  return (
    <aside className="panel-card" aria-label="Painel de controle">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Controles</h2>
          <p className="panel-subtitle">Interação demonstrativa</p>
        </div>
      </div>

      <div className={`turn-banner turn-banner--${activePlayer.color}`}>
        <span className={`turn-badge-dot turn-badge-dot--${activePlayer.color}`} />
        <div className="turn-info">
          <span className="turn-label">Turno atual</span>
          <span className="turn-player-name">
            {activePlayer.name} ({activePlayer.colorLabel})
          </span>
        </div>
      </div>

      <div className="dice-stage">
        <Dice value={diceValue} isRolling={isRolling} />

        <div className="dice-result-box" aria-live="polite">
          {isRolling ? (
            <span>Rolando dado...</span>
          ) : hasRolled ? (
            <>
              <span>Resultado:</span>
              <span className="dice-result-value">{diceValue}</span>
            </>
          ) : (
            <span>Aguardando lançamento</span>
          )}
        </div>
      </div>

      <div className="controls-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={onRollDice}
          disabled={isRolling}
        >
          {isRolling ? 'Lançando...' : 'Lançar dado'}
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={onNewGame}
          disabled={isRolling}
        >
          Nova partida
        </button>
      </div>
    </aside>
  );
}
