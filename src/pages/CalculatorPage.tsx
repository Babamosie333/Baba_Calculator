import { useState, useEffect, useCallback } from 'react';
import { History, Delete } from 'lucide-react';
import { ParticleEffect } from '@/components/ParticleEffect';
import {
  evaluateExpression,
  sin,
  cos,
  tan,
  sqrt,
  log,
  ln,
  formatDisplay,
  validateParentheses
} from '@/utils/calculator';

type MemoryOperation = 'M+' | 'M-' | 'MR' | 'MC';

interface HistoryEntry {
  expression: string;
  result: string;
}

export default function CalculatorPage() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [memory, setMemory] = useState<number>(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [showParticles, setShowParticles] = useState(false);
  const [error, setError] = useState(false);

  // Sound effects
  const playSound = useCallback((frequency: number, duration: number) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
      // Silently fail if audio context is not available
    }
  }, []);

  // Handle button press animation and sound
  const handleButtonPress = useCallback((buttonId: string, soundFreq = 400) => {
    setActiveButton(buttonId);
    playSound(soundFreq, 0.1);
    setTimeout(() => setActiveButton(null), 100);
  }, [playSound]);

  // Handle digit input
  const handleDigit = useCallback((digit: string) => {
    handleButtonPress(digit);
    setError(false);
    
    if (display === '0' || display === 'Error') {
      setDisplay(digit);
      setExpression(digit);
    } else {
      setDisplay(display + digit);
      setExpression(expression + digit);
    }
  }, [display, expression, handleButtonPress]);

  // Handle decimal point
  const handleDecimal = useCallback(() => {
    handleButtonPress('.');
    setError(false);
    
    // Check if current number already has a decimal
    const tokens = expression.split(/[\+\-\×\÷\^\(\)]/);
    const lastToken = tokens[tokens.length - 1];
    
    if (!lastToken.includes('.')) {
      const newDisplay = display === '0' || display === 'Error' ? '0.' : display + '.';
      setDisplay(newDisplay);
      setExpression(expression + '.');
    }
  }, [display, expression, handleButtonPress]);

  // Handle operator input
  const handleOperator = useCallback((operator: string) => {
    handleButtonPress(operator, 450);
    setError(false);
    
    if (display === 'Error') return;
    
    setDisplay(operator);
    setExpression(expression + operator);
  }, [display, expression, handleButtonPress]);

  // Handle parentheses
  const handleParenthesis = useCallback((paren: string) => {
    handleButtonPress(paren);
    setError(false);
    
    if (display === 'Error') {
      setDisplay(paren);
      setExpression(paren);
    } else {
      setDisplay(paren);
      setExpression(expression + paren);
    }
  }, [display, expression, handleButtonPress]);

  // Handle equals
  const handleEquals = useCallback(() => {
    handleButtonPress('=', 600);
    setShowParticles(true);
    
    if (display === 'Error') return;
    
    try {
      if (!validateParentheses(expression)) {
        throw new Error('Unmatched parentheses');
      }
      
      const result = evaluateExpression(expression);
      const formattedResult = formatDisplay(result);
      
      setHistory([...history, { expression, result: formattedResult }]);
      setDisplay(formattedResult);
      setExpression(formattedResult);
      setError(false);
    } catch (e) {
      setDisplay('Error');
      setExpression('');
      setError(true);
    }
  }, [display, expression, history, handleButtonPress]);

  // Handle clear
  const handleClear = useCallback(() => {
    handleButtonPress('C', 300);
    setDisplay('0');
    setExpression('');
    setError(false);
  }, [handleButtonPress]);

  // Handle backspace
  const handleBackspace = useCallback(() => {
    handleButtonPress('⌫');
    setError(false);
    
    if (display === 'Error' || display === '0') {
      setDisplay('0');
      setExpression('');
    } else {
      const newExpression = expression.slice(0, -1);
      const newDisplay = newExpression || '0';
      setDisplay(newDisplay);
      setExpression(newExpression);
    }
  }, [display, expression, handleButtonPress]);

  // Handle mathematical functions
  const handleFunction = useCallback((func: string) => {
    handleButtonPress(func, 500);
    setError(false);
    
    if (display === 'Error') return;
    
    try {
      const currentValue = parseFloat(display);
      let result: number;
      
      switch (func) {
        case 'sin':
          result = sin(currentValue, false);
          break;
        case 'cos':
          result = cos(currentValue, false);
          break;
        case 'tan':
          result = tan(currentValue, false);
          break;
        case '√':
          result = sqrt(currentValue);
          break;
        case 'log':
          result = log(currentValue);
          break;
        case 'ln':
          result = ln(currentValue);
          break;
        default:
          return;
      }
      
      const formattedResult = formatDisplay(result);
      setDisplay(formattedResult);
      setExpression(formattedResult);
    } catch (e) {
      setDisplay('Error');
      setExpression('');
      setError(true);
    }
  }, [display, handleButtonPress]);

  // Handle constants
  const handleConstant = useCallback((constant: string) => {
    handleButtonPress(constant);
    setError(false);
    
    const value = constant === 'π' ? Math.PI : Math.E;
    const formattedValue = formatDisplay(value);
    
    if (display === '0' || display === 'Error') {
      setDisplay(formattedValue);
      setExpression(constant);
    } else {
      setDisplay(display + formattedValue);
      setExpression(expression + constant);
    }
  }, [display, expression, handleButtonPress]);

  // Handle memory operations
  const handleMemory = useCallback((operation: MemoryOperation) => {
    handleButtonPress(operation);
    
    const currentValue = parseFloat(display);
    
    switch (operation) {
      case 'M+':
        setMemory(memory + currentValue);
        break;
      case 'M-':
        setMemory(memory - currentValue);
        break;
      case 'MR':
        setDisplay(String(memory));
        setExpression(String(memory));
        break;
      case 'MC':
        setMemory(0);
        break;
    }
  }, [display, memory, handleButtonPress]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === '.') {
        handleDecimal();
      } else if (e.key === '+') {
        handleOperator('+');
      } else if (e.key === '-') {
        handleOperator('-');
      } else if (e.key === '*') {
        handleOperator('×');
      } else if (e.key === '/') {
        handleOperator('÷');
      } else if (e.key === '^') {
        handleOperator('^');
      } else if (e.key === '(' || e.key === ')') {
        handleParenthesis(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        handleEquals();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        handleClear();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigit, handleDecimal, handleOperator, handleParenthesis, handleEquals, handleClear, handleBackspace]);

  // Button component
  const CalcButton = ({ 
    children, 
    onClick, 
    className = '', 
    id 
  }: { 
    children: React.ReactNode; 
    onClick: () => void; 
    className?: string; 
    id: string;
  }) => (
    <button
      onClick={onClick}
      className={`
        relative rounded-xl text-lg font-semibold transition-all duration-200
        flex items-center justify-center h-14 xl:h-16
        backdrop-blur-sm border border-border/30
        active:scale-95 button-glow
        ${activeButton === id ? 'scale-95 ring-2 ring-primary' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center p-4">
      <ParticleEffect trigger={showParticles} onComplete={() => setShowParticles(false)} />
      
      <div className="w-full max-w-md xl:max-w-lg">
        {/* Calculator Container */}
        <div className="bg-card/50 backdrop-blur-xl rounded-3xl p-6 xl:p-8 border border-border/50 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl xl:text-3xl font-bold gradient-text">Scientific Calculator</h1>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2 rounded-lg transition-all ${
                showHistory ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <History className="w-6 h-6" />
            </button>
          </div>

          {/* History Panel */}
          {showHistory && (
            <div className="mb-6 bg-muted/30 rounded-2xl p-4 max-h-48 overflow-y-auto scrollbar-hide border border-border/30">
              {history.length === 0 ? (
                <p className="text-muted-foreground text-center text-sm">No history yet</p>
              ) : (
                <div className="space-y-2">
                  {history.map((entry, index) => (
                    <div key={index} className="text-sm border-b border-border/20 pb-2 last:border-0">
                      <div className="text-muted-foreground">{entry.expression}</div>
                      <div className="text-primary font-semibold">= {entry.result}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Display */}
          <div className="mb-6 bg-muted/20 rounded-2xl p-6 border border-primary/30 glow-box-cyan">
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-2 h-6 overflow-x-auto scrollbar-hide">
                {expression || ' '}
              </div>
              <div className={`text-4xl xl:text-5xl font-display glow-cyan ${error ? 'text-destructive' : 'text-primary'} overflow-x-auto scrollbar-hide`}>
                {display}
              </div>
            </div>
          </div>

          {/* Memory Indicator */}
          {memory !== 0 && (
            <div className="mb-4 text-center text-sm text-secondary">
              Memory: {memory}
            </div>
          )}

          {/* Button Grid */}
          <div className="grid grid-cols-5 gap-2 xl:gap-3">
            {/* Row 1: Memory Functions */}
            <CalcButton id="MC" onClick={() => handleMemory('MC')} className="bg-muted/50 text-foreground hover:bg-muted">
              MC
            </CalcButton>
            <CalcButton id="MR" onClick={() => handleMemory('MR')} className="bg-muted/50 text-foreground hover:bg-muted">
              MR
            </CalcButton>
            <CalcButton id="M+" onClick={() => handleMemory('M+')} className="bg-muted/50 text-foreground hover:bg-muted">
              M+
            </CalcButton>
            <CalcButton id="M-" onClick={() => handleMemory('M-')} className="bg-muted/50 text-foreground hover:bg-muted">
              M-
            </CalcButton>
            <CalcButton id="C" onClick={handleClear} className="bg-destructive/80 text-destructive-foreground hover:bg-destructive">
              C
            </CalcButton>

            {/* Row 2: Functions */}
            <CalcButton id="sin" onClick={() => handleFunction('sin')} className="bg-muted/50 text-foreground hover:bg-muted">
              sin
            </CalcButton>
            <CalcButton id="cos" onClick={() => handleFunction('cos')} className="bg-muted/50 text-foreground hover:bg-muted">
              cos
            </CalcButton>
            <CalcButton id="tan" onClick={() => handleFunction('tan')} className="bg-muted/50 text-foreground hover:bg-muted">
              tan
            </CalcButton>
            <CalcButton id="√" onClick={() => handleFunction('√')} className="bg-muted/50 text-foreground hover:bg-muted">
              √
            </CalcButton>
            <CalcButton id="⌫" onClick={handleBackspace} className="bg-muted/50 text-foreground hover:bg-muted">
              <Delete className="w-5 h-5" />
            </CalcButton>

            {/* Row 3: Functions & Numbers */}
            <CalcButton id="log" onClick={() => handleFunction('log')} className="bg-muted/50 text-foreground hover:bg-muted">
              log
            </CalcButton>
            <CalcButton id="ln" onClick={() => handleFunction('ln')} className="bg-muted/50 text-foreground hover:bg-muted">
              ln
            </CalcButton>
            <CalcButton id="(" onClick={() => handleParenthesis('(')} className="bg-muted/50 text-foreground hover:bg-muted">
              (
            </CalcButton>
            <CalcButton id=")" onClick={() => handleParenthesis(')')} className="bg-muted/50 text-foreground hover:bg-muted">
              )
            </CalcButton>
            <CalcButton id="÷" onClick={() => handleOperator('÷')} className="bg-secondary/80 text-secondary-foreground hover:bg-secondary glow-box-purple">
              ÷
            </CalcButton>

            {/* Row 4: Numbers */}
            <CalcButton id="7" onClick={() => handleDigit('7')} className="bg-card text-foreground hover:bg-card/80">
              7
            </CalcButton>
            <CalcButton id="8" onClick={() => handleDigit('8')} className="bg-card text-foreground hover:bg-card/80">
              8
            </CalcButton>
            <CalcButton id="9" onClick={() => handleDigit('9')} className="bg-card text-foreground hover:bg-card/80">
              9
            </CalcButton>
            <CalcButton id="^" onClick={() => handleOperator('^')} className="bg-muted/50 text-foreground hover:bg-muted">
              ^
            </CalcButton>
            <CalcButton id="×" onClick={() => handleOperator('×')} className="bg-secondary/80 text-secondary-foreground hover:bg-secondary glow-box-purple">
              ×
            </CalcButton>

            {/* Row 5: Numbers */}
            <CalcButton id="4" onClick={() => handleDigit('4')} className="bg-card text-foreground hover:bg-card/80">
              4
            </CalcButton>
            <CalcButton id="5" onClick={() => handleDigit('5')} className="bg-card text-foreground hover:bg-card/80">
              5
            </CalcButton>
            <CalcButton id="6" onClick={() => handleDigit('6')} className="bg-card text-foreground hover:bg-card/80">
              6
            </CalcButton>
            <CalcButton id="π" onClick={() => handleConstant('π')} className="bg-muted/50 text-foreground hover:bg-muted">
              π
            </CalcButton>
            <CalcButton id="-" onClick={() => handleOperator('-')} className="bg-secondary/80 text-secondary-foreground hover:bg-secondary glow-box-purple">
              -
            </CalcButton>

            {/* Row 6: Numbers */}
            <CalcButton id="1" onClick={() => handleDigit('1')} className="bg-card text-foreground hover:bg-card/80">
              1
            </CalcButton>
            <CalcButton id="2" onClick={() => handleDigit('2')} className="bg-card text-foreground hover:bg-card/80">
              2
            </CalcButton>
            <CalcButton id="3" onClick={() => handleDigit('3')} className="bg-card text-foreground hover:bg-card/80">
              3
            </CalcButton>
            <CalcButton id="e" onClick={() => handleConstant('e')} className="bg-muted/50 text-foreground hover:bg-muted">
              e
            </CalcButton>
            <CalcButton id="+" onClick={() => handleOperator('+')} className="bg-secondary/80 text-secondary-foreground hover:bg-secondary glow-box-purple">
              +
            </CalcButton>

            {/* Row 7: Bottom row */}
            <CalcButton id="0" onClick={() => handleDigit('0')} className="col-span-2 bg-card text-foreground hover:bg-card/80">
              0
            </CalcButton>
            <CalcButton id="." onClick={handleDecimal} className="bg-card text-foreground hover:bg-card/80">
              .
            </CalcButton>
            <CalcButton id="=" onClick={handleEquals} className="col-span-2 bg-accent/80 text-accent-foreground hover:bg-accent glow-box-cyan font-bold text-xl">
              =
            </CalcButton>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>Use keyboard for input • ESC to clear</p>
          </div>
        </div>
      </div>
    </div>
  );
}
