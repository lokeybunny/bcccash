import { useState, useCallback, useEffect } from "react";

interface SimpleCaptchaProps {
  onVerify: (verified: boolean) => void;
}

function generateCaptcha(): { question: string; answer: number } {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const operators = ["+", "-", "×"] as const;
  const operator = operators[Math.floor(Math.random() * operators.length)];

  let answer: number;
  switch (operator) {
    case "+":
      answer = num1 + num2;
      break;
    case "-":
      answer = num1 - num2;
      break;
    case "×":
      answer = num1 * num2;
      break;
  }

  return {
    question: `${num1} ${operator} ${num2} = ?`,
    answer,
  };
}

export const SimpleCaptcha = ({ onVerify }: SimpleCaptchaProps) => {
  const [captcha, setCaptcha] = useState(() => generateCaptcha());
  const [userAnswer, setUserAnswer] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState(false);

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha());
    setUserAnswer("");
    setIsVerified(false);
    setError(false);
    onVerify(false);
  }, [onVerify]);

  const handleVerify = useCallback(() => {
    const parsedAnswer = parseInt(userAnswer, 10);
    if (parsedAnswer === captcha.answer) {
      setIsVerified(true);
      setError(false);
      onVerify(true);
    } else {
      setError(true);
      setIsVerified(false);
      onVerify(false);
      // Refresh captcha after wrong answer
      setTimeout(() => {
        refreshCaptcha();
      }, 1000);
    }
  }, [userAnswer, captcha.answer, onVerify, refreshCaptcha]);

  // Auto-verify when user types correct answer
  useEffect(() => {
    if (userAnswer && parseInt(userAnswer, 10) === captcha.answer) {
      setIsVerified(true);
      setError(false);
      onVerify(true);
    }
  }, [userAnswer, captcha.answer, onVerify]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-muted/30 border border-border">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Solve:</span>
          <span className="font-mono text-lg font-semibold text-foreground">
            {captcha.question}
          </span>
        </div>
        <button
          type="button"
          onClick={refreshCaptcha}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ↻ New
        </button>
      </div>

      <div className="flex gap-2">
        <input
          type="number"
          value={userAnswer}
          onChange={(e) => {
            setUserAnswer(e.target.value);
            setError(false);
          }}
          placeholder="Your answer"
          className={`flex-1 h-12 px-4 rounded-lg border bg-background text-foreground text-center font-mono text-lg
            ${error ? "border-destructive" : isVerified ? "border-green-500" : "border-border"}
            focus:outline-none focus:ring-2 focus:ring-primary/30`}
          disabled={isVerified}
        />
        {!isVerified && (
          <button
            type="button"
            onClick={handleVerify}
            disabled={!userAnswer}
            className="px-4 h-12 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            Verify
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive text-center">
          Wrong answer. Try again!
        </p>
      )}

      {isVerified && (
        <div className="flex items-center justify-center gap-2 text-sm text-green-400">
          <span>✓</span>
          <span>Verified</span>
        </div>
      )}
    </div>
  );
};

export const useSimpleCaptcha = () => {
  const [isVerified, setIsVerified] = useState(false);

  const reset = useCallback(() => {
    setIsVerified(false);
  }, []);

  return { isVerified, setIsVerified, reset };
};
