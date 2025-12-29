// Calculator utility functions with proper order of operations (PEMDAS/BODMAS)

export type OperatorType = '+' | '-' | '×' | '÷' | '^';

// Convert infix expression to postfix (Reverse Polish Notation) for proper order of operations
function infixToPostfix(expression: string): string[] {
  const output: string[] = [];
  const operators: string[] = [];
  const precedence: { [key: string]: number } = {
    '+': 1,
    '-': 1,
    '×': 2,
    '÷': 2,
    '^': 3
  };

  const tokens = tokenize(expression);

  for (const token of tokens) {
    if (isNumber(token)) {
      output.push(token);
    } else if (token === '(') {
      operators.push(token);
    } else if (token === ')') {
      while (operators.length > 0 && operators[operators.length - 1] !== '(') {
        output.push(operators.pop()!);
      }
      operators.pop(); // Remove '('
    } else if (isOperator(token)) {
      while (
        operators.length > 0 &&
        operators[operators.length - 1] !== '(' &&
        precedence[operators[operators.length - 1]] >= precedence[token]
      ) {
        output.push(operators.pop()!);
      }
      operators.push(token);
    }
  }

  while (operators.length > 0) {
    output.push(operators.pop()!);
  }

  return output;
}

// Tokenize expression into numbers and operators
function tokenize(expression: string): string[] {
  const tokens: string[] = [];
  let currentNumber = '';

  for (let i = 0; i < expression.length; i++) {
    const char = expression[i];

    if (char === ' ') continue;

    if (isDigit(char) || char === '.') {
      currentNumber += char;
    } else {
      if (currentNumber) {
        tokens.push(currentNumber);
        currentNumber = '';
      }
      tokens.push(char);
    }
  }

  if (currentNumber) {
    tokens.push(currentNumber);
  }

  return tokens;
}

function isDigit(char: string): boolean {
  return /[0-9]/.test(char);
}

function isNumber(token: string): boolean {
  return !isNaN(parseFloat(token));
}

function isOperator(token: string): boolean {
  return ['+', '-', '×', '÷', '^'].includes(token);
}

// Evaluate postfix expression
function evaluatePostfix(postfix: string[]): number {
  const stack: number[] = [];

  for (const token of postfix) {
    if (isNumber(token)) {
      stack.push(parseFloat(token));
    } else if (isOperator(token)) {
      const b = stack.pop()!;
      const a = stack.pop()!;

      switch (token) {
        case '+':
          stack.push(a + b);
          break;
        case '-':
          stack.push(a - b);
          break;
        case '×':
          stack.push(a * b);
          break;
        case '÷':
          if (b === 0) throw new Error('Division by zero');
          stack.push(a / b);
          break;
        case '^':
          stack.push(Math.pow(a, b));
          break;
      }
    }
  }

  return stack[0];
}

// Main evaluation function
export function evaluateExpression(expression: string): number {
  try {
    // Replace special characters
    expression = expression.replace(/π/g, String(Math.PI));
    expression = expression.replace(/e/g, String(Math.E));

    const postfix = infixToPostfix(expression);
    const result = evaluatePostfix(postfix);

    if (!isFinite(result)) {
      throw new Error('Invalid result');
    }

    return result;
  } catch (error) {
    throw new Error('Error');
  }
}

// Mathematical functions
export function sin(value: number, isDegrees = false): number {
  const radians = isDegrees ? (value * Math.PI) / 180 : value;
  return Math.sin(radians);
}

export function cos(value: number, isDegrees = false): number {
  const radians = isDegrees ? (value * Math.PI) / 180 : value;
  return Math.cos(radians);
}

export function tan(value: number, isDegrees = false): number {
  const radians = isDegrees ? (value * Math.PI) / 180 : value;
  return Math.tan(radians);
}

export function sqrt(value: number): number {
  if (value < 0) throw new Error('Invalid input');
  return Math.sqrt(value);
}

export function log(value: number): number {
  if (value <= 0) throw new Error('Invalid input');
  return Math.log10(value);
}

export function ln(value: number): number {
  if (value <= 0) throw new Error('Invalid input');
  return Math.log(value);
}

export function power(base: number, exponent: number): number {
  return Math.pow(base, exponent);
}

// Format number for display (limit to 12 digits)
export function formatDisplay(value: string | number): string {
  const str = String(value);
  
  // If it's too long, use scientific notation
  if (str.length > 12) {
    const num = parseFloat(str);
    return num.toExponential(6);
  }
  
  return str;
}

// Validate parentheses
export function validateParentheses(expression: string): boolean {
  let count = 0;
  for (const char of expression) {
    if (char === '(') count++;
    if (char === ')') count--;
    if (count < 0) return false;
  }
  return count === 0;
}
