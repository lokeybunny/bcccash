import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle, useState } from "react";
import { useTheme } from "next-themes";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield } from "lucide-react";

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
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }
      },
    }));

    const handleVerify = useCallback((token: string) => {
      setIsLoading(false);
      setHasError(false);
      onVerify(token);
    }, [onVerify]);

    const handleError = useCallback(() => {
      setIsLoading(false);
      setHasError(true);
      onError?.();
    }, [onError]);

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
          callback: handleVerify,
          "expired-callback": onExpire,
          "error-callback": handleError,
          theme: resolvedTheme === "dark" ? "dark" : "light",
          size: "normal",
        });
        // Widget rendered, but still loading until verified or error
        setTimeout(() => setIsLoading(false), 1500); // Fallback timeout
      } catch (e) {
        console.error("Failed to render Turnstile widget:", e);
        handleError();
      }
    }, [handleVerify, onExpire, handleError, resolvedTheme]);

    useEffect(() => {
      setIsLoading(true);
      setHasError(false);

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
      <div className="relative flex justify-center" style={{ minHeight: "65px" }}>
        {/* Loading skeleton */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border animate-pulse">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2 w-32" />
              </div>
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        )}
        
        {/* Error state */}
        {hasError && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              <Shield className="w-4 h-4" />
              <span>Security check unavailable</span>
            </div>
          </div>
        )}

        {/* Actual Turnstile container */}
        <div
          ref={containerRef}
          className={`transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
        />
      </div>
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
