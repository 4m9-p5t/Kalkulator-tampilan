(function () {
    'use strict';

    const display = document.getElementById('display');
    let expression = "";
    let lastWasOperator = false;
    let lastInput = "";
    let openParenthesesCount = 0;
    
    function updateDisplay(value) {
        display.textContent = value || "0";
    }

    function safeEval(expr) {
        try {
            let processed = expr
            .replace(/%/g, '/100')
            .replace(/--/g, '+')
            .replace(/\+\-/g, '-')
            .replace(/\-\+/g, '-')
            .replace(/\+\+/g, '+');

            if (/[^0-9+\-*/(). ]/.test(processed)) {
                return "Error";
                }
        
            const fn = new Function('return ' + processed);
            let result = fn();
            if (typeof result !== "number" || !isFinite(result)) {
                return "Error";
                }
            result = Math.round((result + Number.EPSILON) * 1e10) / 1e10;
            return result.toString();
        } catch (e) {
            return "Error";
            }
    }

    function addToExpression(char) {
        if (char.match(/[0-9.]/)) {
            if (lastInput === '=') {
                expression = "";
                }
            if (char === '.') {
                const parts = expression.split(/[\+\-\*\/\(\)]/);
                let lastPart = parts[parts.length - 1];
                if (lastPart.includes('.')) {
                    return;
                    }
                if (!lastPart.length) {
                    char = '0.'; 
                    }
                }
            expression += char;
            lastWasOperator = false;
            } else if ("+-*/".includes(char)) {
                if (expression.length === 0) {
                    if (char === '-') {
                        expression += char;
                        lastWasOperator = true;
                        }
                    return;
                }
            if (lastWasOperator) {
            expression = expression.slice(0, -1) + char;
            } else {
            expression += char;
            }
            lastWasOperator = true;
            }
            lastInput = char;
            updateDisplay(expression);
    }

    function toggleSign() {
        if (!expression) return;
        let match = expression.match(/([-+]?\d*\.?\d+)(?!.*\d)/);
        if (!match) return;
        let numStr = match[0];
        let numIndex = expression.lastIndexOf(numStr);
        let toggled;
        if (numStr.charAt(0) === '-') {
            toggled = numStr.substring(1);
        } else if (numStr.charAt(0) === '+') {
            toggled = '-' + numStr.slice(1);
        } else {
            toggled = '-' + numStr;
        }
        expression = expression.substring(0, numIndex) + toggled;
        updateDisplay(expression);
    }

    function clearEntry() {
        if (!expression) return;
        expression = expression.slice(0, -1);
        updateDisplay(expression);
    }

    function clearAll() {
        expression = "";
        openParenthesesCount = 0;
        updateDisplay("0");
    }

    function deleteLast() {
        clearEntry();
    }

    function addParenthesis() {
        if (openParenthesesCount === 0 || expression.endsWith('(') || lastWasOperator) {
            expression += '(';
            openParenthesesCount++;
            lastWasOperator = true;
        } else if (openParenthesesCount > 0) {
            expression += ')';
            openParenthesesCount--;
            lastWasOperator = false;
        } else {
            expression += '(';
            openParenthesesCount++;
            lastWasOperator = true;
        }
        updateDisplay(expression);
    }

    function percent() {
        if (!expression) return;
        let regexNum = /(\d*\.?\d+)$/;
        let match = expression.match(regexNum);
        if (!match) return;
        let numStr = match[1];
        let numIndex = expression.lastIndexOf(numStr);
        let numValue = parseFloat(numStr);
        if (isNaN(numValue)) return;
        let replaced = (numValue / 100).toString();
        expression = expression.substring(0, numIndex) + replaced;
        updateDisplay(expression);
    }

    function squareRoot() {
        if (!expression) return;
        let val;
        let evalRes = safeEval(expression);
        if (evalRes === "Error") {
            return;
        }
        val = parseFloat(evalRes);
        if (val < 0) {
            updateDisplay("Error");
            expression = "";
            return;
        }
        val = Math.sqrt(val);
        expression = val.toString();
        updateDisplay(expression);
    }

    function square() {
        if (!expression) return;
        let val;
        let evalRes = safeEval(expression);
        if (evalRes === "Error") {
            return;
        }
        val = parseFloat(evalRes);
        val = val * val;
        expression = val.toString();
        updateDisplay(expression);
    }

    function calculate() {
        if (!expression) return;
        if (openParenthesesCount > 0) {
            expression += ')'.repeat(openParenthesesCount);
            openParenthesesCount = 0;
        }
        let result = safeEval(expression);
        expression = result.toString();
        updateDisplay(expression);
        lastInput = '=';
    }

    function onButtonClick(e) {
        const target = e.target;
        if (!target.matches('button')) {
            return;
        }

        if (target.dataset.number !== undefined) {
            addToExpression(target.dataset.number);
            return;
        }

        if (target.dataset.operator !== undefined) {
            addToExpression(target.dataset.operator);
            return;
        }

        const action = target.dataset.action;
        if (!action) return;

        switch (action) {
            case 'ce':
            clearEntry();
            break;
            case 'c':
            clearAll();
            break;
            case 'del':
            deleteLast();
            break;
            case 'parenthesis':
            addParenthesis();
            break;
            case 'toggle-sign':
            toggleSign();
            break;
            case 'percent':
            percent();
            break;
            case 'sqrt':
            squareRoot();
            break;
            case 'sqr':
            square();
            break;
            case 'equal':
            calculate();
            break;
            default:
            break;
        }
    }

    function onKeyDown(e) {
        let key = e.key;
        if ((key >= '0' && key <= '9') || key === '.') {
            addToExpression(key);
            e.preventDefault();
        } else if (key === '+' || key === '-' || key === '*' || key === '/') {
            addToExpression(key);
            e.preventDefault();
        } else if (key === 'Enter' || key === '=') {
            calculate();
            e.preventDefault();
        } else if (key === 'Backspace') {
            deleteLast();
            e.preventDefault();
        } else if (key === 'Escape') {
            clearAll();
            e.preventDefault();
        } else if (key === '(' || key === ')') {
            expression += key;
            updateDisplay(expression);
            e.preventDefault();
        }
    }

    document.querySelector('.buttons').addEventListener('click', onButtonClick);
    document.addEventListener('keydown', onKeyDown);

    updateDisplay("0");
})();