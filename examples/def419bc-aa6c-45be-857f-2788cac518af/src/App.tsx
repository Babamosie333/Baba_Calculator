import React, { useState } from 'react';
import { History, Plus, Minus, X, Divide, Percent, ArrowLeft } from 'lucide-react';

type MemoryOperation = 'M+' | 'M-' | 'MR' | 'MC';

function App() {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState<number>(0);
  const [waitingForOperand, setWaitingForOperand] = useState(true);
  const [pendingOperator, setPendingOperator] = useState<string | null>(null);
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const handleDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
    setActiveButton(digit);
    setTimeout(() => setActiveButton(null), 100);
  };

  const handleDecimalPoint = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
    setActiveButton('.');
    setTimeout(() => setActiveButton(null), 100);
  };

  const handleOperator = (operator: string) => {
    const operand = Number(display);

    if (firstOperand === null) {
      setFirstOperand(operand);
    } else if (pendingOperator) {
      const result = calculate(firstOperand, operand, pendingOperator);
      setDisplay(String(result));
      setFirstOperand(result);
      setHistory([...history, `${firstOperand} ${pendingOperator} ${operand} = ${result}`]);
    }

    setWaitingForOperand(true);
    setPendingOperator(operator);
    setActiveButton(operator);
    setTimeout(() => setActiveButton(null), 100);
  };

  const calculate = (firstOperand: number, secondOperand: number, operator: string): number => {
    switch (operator) {
      case '+': return firstOperand + secondOperand;
      case '-': return firstOperand - secondOperand;
      case '×': return firstOperand * secondOperand;
      case '÷': return firstOperand / secondOperand;
      default: return secondOperand;
    }
  };

  const handleEquals = () => {
    const operand = Number(display);

    if (pendingOperator && firstOperand !== null) {
      const result = calculate(firstOperand, operand, pendingOperator);
      setDisplay(String(result));
      setHistory([...history, `${firstOperand} ${pendingOperator} ${operand} = ${result}`]);
      setFirstOperand(null);
      setPendingOperator(null);
      setWaitingForOperand(true);
    }
    setActiveButton('=');
    setTimeout(() => setActiveButton(null), 100);
  };

  const handleMemory = (operation: MemoryOperation) => {
    const currentValue = Number(display);
    switch (operation) {
      case 'M+':
        setMemory(memory + currentValue);
        break;
      case 'M-':
        setMemory(memory - currentValue);
        break;
      case 'MR':
        setDisplay(String(memory));
        setWaitingForOperand(true);
        break;
      case 'MC':
        setMemory(0);
        break;
    }
    setActiveButton(operation);
    setTimeout(() => setActiveButton(null), 100);
  };

  const handleClear = () => {
    setDisplay('0');
    setFirstOperand(null);
    setPendingOperator(null);
    setWaitingForOperand(true);
    setActiveButton('C');
    setTimeout(() => setActiveButton(null), 100);
  };

  const handleBackspace = () => {
    if (!waitingForOperand) {
      setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
    }
    setActiveButton('backspace');
    setTimeout(() => setActiveButton(null), 100);
  };

  const handlePercentage = () => {
    const value = Number(display);
    setDisplay(String(value / 100));
    setActiveButton('%');
    setTimeout(() => setActiveButton(null), 100);
  };

  const handlePlusMinus = () => {
    setDisplay(String(-Number(display)));
    setActiveButton('±');
    setTimeout(() => setActiveButton(null), 100);
  };

  const buttonClass = "relative transition-all duration-300 rounded-full text-xl font-medium focus:outline-none active:scale-90 h-[4.5rem] w-[4.5rem] flex items-center justify-center backdrop-blur-sm shadow-lg after:absolute after:inset-0 after:rounded-full after:opacity-0 after:transition-opacity after:duration-300 hover:after:opacity-100 after:bg-white/10";
  const operatorClass = `${buttonClass} bg-gradient-to-br from-orange-400 to-orange-500 text-white hover:from-orange-300 hover:to-orange-400 active:from-orange-500 active:to-orange-600 ring-orange-400/50`;
  const numberClass = `${buttonClass} bg-gradient-to-br from-gray-700/90 to-gray-800/90 text-white hover:from-gray-600/90 hover:to-gray-700/90 active:from-gray-800/90 active:to-gray-900/90 ring-white/20`;
  const functionClass = `${buttonClass} bg-gradient-to-br from-gray-600/90 to-gray-700/90 text-white hover:from-gray-500/90 hover:to-gray-600/90 active:from-gray-700/90 active:to-gray-800/90 ring-white/20`;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-[2.5rem] p-8 shadow-[0_0_60px_-15px_rgba(0,0,0,0.5)] backdrop-blur-xl border border-gray-700/30 max-w-sm w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none" />
        
        <div className="relative">
          <button 
            className={`absolute right-0 top-0 text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800/50 ${showHistory ? 'bg-gray-800/50 text-white' : ''}`}
            onClick={() => setShowHistory(!showHistory)}
          >
            <History size={24} />
          </button>
          
          {showHistory && (
            <div className="absolute right-0 top-12 bg-gray-800/95 backdrop-blur-md rounded-2xl p-4 w-full max-h-48 overflow-y-auto z-10 border border-gray-700/30 shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-top-2">
              {history.map((entry, index) => (
                <div key={index} className="text-gray-300 py-1.5 text-sm font-medium border-b border-gray-700/30 last:border-0">{entry}</div>
              ))}
              {history.length === 0 && (
                <div className="text-gray-500 py-2 text-sm text-center">No history yet</div>
              )}
            </div>
          )}
          
          <div className="text-right mb-8 pt-8">
            <div className="text-6xl font-light text-white tracking-wider overflow-x-auto whitespace-nowrap scrollbar-hide transition-all duration-300">
              {display}
            </div>
            {pendingOperator && (
              <div className="text-orange-400 text-lg mt-2 font-medium transition-all duration-300">
                {firstOperand} {pendingOperator}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {/* Memory Row */}
          <button onClick={() => handleMemory('MC')} className={`${functionClass} ${activeButton === 'MC' ? 'ring-2' : ''}`}>MC</button>
          <button onClick={() => handleMemory('MR')} className={`${functionClass} ${activeButton === 'MR' ? 'ring-2' : ''}`}>MR</button>
          <button onClick={() => handleMemory('M+')} className={`${functionClass} ${activeButton === 'M+' ? 'ring-2' : ''}`}>M+</button>
          <button onClick={() => handleMemory('M-')} className={`${functionClass} ${activeButton === 'M-' ? 'ring-2' : ''}`}>M-</button>

          {/* Function Row */}
          <button onClick={handleClear} className={`${functionClass} text-orange-400 hover:text-orange-300 active:text-orange-500 ${activeButton === 'C' ? 'ring-2' : ''}`}>C</button>
          <button onClick={handlePlusMinus} className={`${functionClass} ${activeButton === '±' ? 'ring-2' : ''}`}>±</button>
          <button onClick={handlePercentage} className={`${functionClass} ${activeButton === '%' ? 'ring-2' : ''}`}>
            <Percent size={20} />
          </button>
          <button onClick={() => handleOperator('÷')} className={`${operatorClass} ${activeButton === '÷' ? 'ring-2' : ''}`}>
            <Divide size={24} strokeWidth={2.5} />
          </button>

          {/* Number Pad */}
          <button onClick={() => handleDigit('7')} className={`${numberClass} ${activeButton === '7' ? 'ring-2' : ''}`}>7</button>
          <button onClick={() => handleDigit('8')} className={`${numberClass} ${activeButton === '8' ? 'ring-2' : ''}`}>8</button>
          <button onClick={() => handleDigit('9')} className={`${numberClass} ${activeButton === '9' ? 'ring-2' : ''}`}>9</button>
          <button onClick={() => handleOperator('×')} className={`${operatorClass} ${activeButton === '×' ? 'ring-2' : ''}`}>
            <X size={24} strokeWidth={2.5} />
          </button>

          <button onClick={() => handleDigit('4')} className={`${numberClass} ${activeButton === '4' ? 'ring-2' : ''}`}>4</button>
          <button onClick={() => handleDigit('5')} className={`${numberClass} ${activeButton === '5' ? 'ring-2' : ''}`}>5</button>
          <button onClick={() => handleDigit('6')} className={`${numberClass} ${activeButton === '6' ? 'ring-2' : ''}`}>6</button>
          <button onClick={() => handleOperator('-')} className={`${operatorClass} ${activeButton === '-' ? 'ring-2' : ''}`}>
            <Minus size={24} strokeWidth={2.5} />
          </button>

          <button onClick={() => handleDigit('1')} className={`${numberClass} ${activeButton === '1' ? 'ring-2' : ''}`}>1</button>
          <button onClick={() => handleDigit('2')} className={`${numberClass} ${activeButton === '2' ? 'ring-2' : ''}`}>2</button>
          <button onClick={() => handleDigit('3')} className={`${numberClass} ${activeButton === '3' ? 'ring-2' : ''}`}>3</button>
          <button onClick={() => handleOperator('+')} className={`${operatorClass} ${activeButton === '+' ? 'ring-2' : ''}`}>
            <Plus size={24} strokeWidth={2.5} />
          </button>

          <button onClick={handleBackspace} className={`${numberClass} ${activeButton === 'backspace' ? 'ring-2' : ''}`}>
            <ArrowLeft size={20} />
          </button>
          <button onClick={() => handleDigit('0')} className={`${numberClass} ${activeButton === '0' ? 'ring-2' : ''}`}>0</button>
          <button onClick={handleDecimalPoint} className={`${numberClass} ${activeButton === '.' ? 'ring-2' : ''}`}>.</button>
          <button onClick={handleEquals} className={`${buttonClass} bg-gradient-to-br from-green-500 to-green-600 text-white hover:from-green-400 hover:to-green-500 active:from-green-600 active:to-green-700 ring-green-400/50 ${activeButton === '=' ? 'ring-2' : ''}`}>=</button>
        </div>
      </div>
    </div>
  );
}

export default App;