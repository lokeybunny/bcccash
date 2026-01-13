import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { useTheme } from "next-themes";

// Turnstile Site Key - get from Cloudflare dashboard
const TURNSTILE_SITE_KEY = "0x4AAAAAABi8Rl0_c9fvqMhD";

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact";
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
}

export interface TurnstileWidgetRef {
  reset: () => void;
}

export const TurnstileWidget = forwardRef<TurnstileWidgetRef, TurnstileWidgetProps>(
  ({ onVerify, onExpire, onError }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const scriptLoadedRef = useRef(false);
    const { resolvedTheme } = useTheme();

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }
      },
    }));

    const renderWidget = useCallback(() => {
      if (!containerRef.current || !window.turnstile) return;

      // Remove existing widget if any
      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          // Widget may already be removed
        }
        widgetIdRef.current = null;
      }

      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: onVerify,
          "expired-callback": onExpire,
          "error-callback": onError,
          theme: resolvedTheme === "dark" ? "dark" : "light",
          size: "normal",
        });
      } catch (e) {
        console.error("Failed to render Turnstile widget:", e);
        // Call onError to allow fallback behavior
        onError?.();
      }
    }, [onVerify, onExpire, onError, resolvedTheme]);

    useEffect(() => {
      // If Turnstile is already loaded, render immediately
      if (window.turnstile) {
        renderWidget();
        return;
      }

      // Only load script once
      if (!scriptLoadedRef.current) {
        scriptLoadedRef.current = true;

        const script = document.createElement("script");
        script.src =
          "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad";
        script.async = true;
        script.defer = true;

        window.onTurnstileLoad = () => {
          renderWidget();
        };

        document.head.appendChild(script);
      }

      return () => {
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch (e) {
            // Widget may already be removed
          }
          widgetIdRef.current = null;
        }
      };
    }, [renderWidget]);

    return (
      <div
        ref={containerRef}
        className="flex justify-center"
        style={{ minHeight: "65px" }}
      />
    );
  }
);

TurnstileWidget.displayName = "TurnstileWidget";

export const resetTurnstile = () => {
  // This is a utility to reset all turnstile widgets on the page
  const widgets = document.querySelectorAll('[data-turnstile-widget-id]');
  widgets.forEach((widget) => {
    const id = widget.getAttribute('data-turnstile-widget-id');
    if (id && window.turnstile) {
      window.turnstile.reset(id);
    }
  });
};
