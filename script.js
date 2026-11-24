(function () {
  const expressionEl = document.getElementById("expression");
  const resultEl = document.getElementById("result");
  const keys = document.querySelector(".keys");

  let current = "0";
  let previous = null;
  let operator = null;
  let waitingForOperand = false;

  const opSymbols = {
    "+": "+",
    "-": "−",
    "*": "×",
    "/": "÷",
  };

  function formatNumber(value) {
    if (!Number.isFinite(value)) return "错误";

    const str = String(value);
    if (str.includes("e")) return str;

    const [intPart, decPart] = str.split(".");
    const formattedInt = Number(intPart).toLocaleString("zh-CN");
    return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
  }

  function updateDisplay() {
    resultEl.textContent = formatNumber(Number(current)) === "错误"
      ? "错误"
      : current.includes(".")
        ? current
        : formatNumber(Number(current));

    if (previous !== null && operator) {
      expressionEl.textContent = `${formatNumber(Number(previous))} ${opSymbols[operator]}`;
    } else {
      expressionEl.textContent = "";
    }
  }

  function inputDigit(digit) {
    if (waitingForOperand) {
      current = digit;
      waitingForOperand = false;
    } else {
      current = current === "0" ? digit : current + digit;
    }
    updateDisplay();
  }

  function inputDecimal() {
    if (waitingForOperand) {
      current = "0.";
      waitingForOperand = false;
      updateDisplay();
      return;
    }
    if (!current.includes(".")) {
      current += ".";
      updateDisplay();
    }
  }

  function clearAll() {
    current = "0";
    previous = null;
    operator = null;
    waitingForOperand = false;
    updateDisplay();
  }

  function toggleSign() {
    if (current === "0" || current === "错误") return;
    current = current.startsWith("-") ? current.slice(1) : "-" + current;
    updateDisplay();
  }

  function inputPercent() {
    const value = parseFloat(current);
    if (!Number.isFinite(value)) return;
    current = String(value / 100);
    updateDisplay();
  }

  function compute(a, b, op) {
    switch (op) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "*":
        return a * b;
      case "/":
        return b === 0 ? NaN : a / b;
      default:
        return b;
    }
  }

  function handleOperator(nextOp) {
    const inputValue = parseFloat(current);

    if (previous === null) {
      previous = inputValue;
    } else if (operator && !waitingForOperand) {
      const result = compute(previous, inputValue, operator);
      if (!Number.isFinite(result)) {
        current = "错误";
        previous = null;
        operator = null;
        waitingForOperand = true;
        updateDisplay();
        return;
      }
      current = String(parseFloat(result.toPrecision(12)));
      previous = parseFloat(current);
    }

    waitingForOperand = true;
    operator = nextOp;
    updateDisplay();
  }

  function handleEquals() {
    if (operator === null || previous === null || waitingForOperand) return;

    const inputValue = parseFloat(current);
    const result = compute(previous, inputValue, operator);

    expressionEl.textContent = `${formatNumber(previous)} ${opSymbols[operator]} ${formatNumber(inputValue)} =`;

    if (!Number.isFinite(result)) {
      current = "错误";
    } else {
      current = String(parseFloat(result.toPrecision(12)));
    }

    previous = null;
    operator = null;
    waitingForOperand = true;
    resultEl.textContent =
      current === "错误" ? "错误" : formatNumber(Number(current));
  }

  keys.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const { action, value } = button.dataset;

    switch (action) {
      case "digit":
        if (current === "错误") clearAll();
        inputDigit(value);
        break;
      case "decimal":
        if (current === "错误") clearAll();
        inputDecimal();
        break;
      case "operator":
        if (current === "错误") clearAll();
        handleOperator(value);
        break;
      case "equals":
        handleEquals();
        break;
      case "clear":
        clearAll();
        break;
      case "sign":
        toggleSign();
        break;
      case "percent":
        inputPercent();
        break;
    }
  });

  document.addEventListener("keydown", (event) => {
    const { key } = event;

    if (/\d/.test(key)) {
      if (current === "错误") clearAll();
      inputDigit(key);
      return;
    }

    if (key === ".") {
      if (current === "错误") clearAll();
      inputDecimal();
      return;
    }

    if (key === "+" || key === "-" || key === "*" || key === "/") {
      event.preventDefault();
      if (current === "错误") clearAll();
      handleOperator(key);
      return;
    }

    if (key === "Enter" || key === "=") {
      event.preventDefault();
      handleEquals();
      return;
    }

    if (key === "Escape" || key === "c" || key === "C") {
      clearAll();
      return;
    }

    if (key === "%") {
      inputPercent();
      return;
    }

    if (key === "Backspace") {
      if (waitingForOperand || current === "错误") return;
      current = current.length > 1 ? current.slice(0, -1) : "0";
      if (current === "-") current = "0";
      updateDisplay();
    }
  });

  updateDisplay();
})();
