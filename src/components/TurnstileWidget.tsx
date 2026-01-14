import { Turnstile } from "@marsidev/react-turnstile";
import { useCallback } from "react";

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
}

export const TurnstileWidget = ({ onVerify, onExpire, onError }: TurnstileWidgetProps) => {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  const handleSuccess = useCallback((token: string) => {
    onVerify(token);
  }, [onVerify]);

  const handleExpire = useCallback(() => {
    onExpire?.();
  }, [onExpire]);

  const handleError = useCallback(() => {
    onError?.();
  }, [onError]);

  if (!siteKey) {
    console.error("VITE_TURNSTILE_SITE_KEY is not configured");
    return (
      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-center">
        <p className="text-sm text-destructive">Captcha not configured</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <Turnstile
        siteKey={siteKey}
        onSuccess={handleSuccess}
        onExpire={handleExpire}
        onError={handleError}
        options={{
          theme: "dark",
          size: "normal",
        }}
      />
    </div>
  );
};