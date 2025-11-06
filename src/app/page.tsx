"use client";

import {
  useRive,
  useStateMachineInput,
  Layout,
  Fit,
  Alignment,
} from "@rive-app/react-webgl2";
import { useCallback, useRef, useEffect, useState } from "react";

export default function Home() {
  const riveRef = useRef<HTMLDivElement>(null);
  const [showText, setShowText] = useState(false);
  const [textContent, setTextContent] = useState(
    "Let's work on building a session together."
  );
  const [isTextChanging, setIsTextChanging] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { rive, RiveComponent } = useRive({
    src: "/plia-rive-v2.riv",
    stateMachines: "State Machine 1",
    autoplay: true,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.TopCenter,
    }),
  });

  const toThinkingInput = useStateMachineInput(
    rive,
    "State Machine 1",
    "toThinking"
  );
  const doneInput = useStateMachineInput(rive, "State Machine 1", "done");
  const resetInput = useStateMachineInput(rive, "State Machine 1", "reset");

  const triggerThinking = useCallback(() => {
    if (toThinkingInput) {
      toThinkingInput.fire();
      // Fade out
      setIsTextChanging(true);
      setTimeout(() => {
        setIsTextChanging(false);
        setTextContent('"Warmup for a hard 10 mile run"');
      }, 300);
    }
  }, [toThinkingInput]);

  const triggerComplete = useCallback(() => {
    if (doneInput) {
      doneInput.fire();
    }
  }, [doneInput]);

  const resetStateMachine = useCallback(() => {
    if (resetInput) {
      resetInput.fire();
      setShowText(false);
      setIsTextChanging(false);
      setTextContent("Let's work on building a session together.");
      // Show text again after reset (when idle starts)
      setTimeout(() => {
        setShowText(true);
      }, 2000);
    }
  }, [resetInput]);

  // Show text after idle state starts (intro runs first, then idle)
  useEffect(() => {
    if (rive) {
      const timer = setTimeout(() => {
        setShowText(true);
        setIsInitialLoad(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [rive]);

  return (
    <div className="flex min-h-screen flex-col items-center bg-black pt-8">
      {/* Phone mockup container */}
      <div
        className="relative"
        style={{
          width: "402px",
          height: "874px",
          borderRadius: "48px",
          border: "8px solid #2B2B2B",
          backgroundColor: "#000000",
          boxSizing: "border-box",
        }}
      >
        {/* Inner content area */}
        <div
          className="relative h-full w-full overflow-hidden"
          style={{
            borderRadius: "40px",
            backgroundColor: "#000000",
          }}
        >
          {/* Rive animation container */}
          <div
            ref={riveRef}
            className="absolute top-0 left-0 right-0 overflow-visible"
            style={{
              height: "100%",
              mixBlendMode: "lighten",
            }}
          >
            <RiveComponent
              style={{
                width: "100%",
                height: "100%",
                overflow: "visible",
              }}
            />
            {/* Text overlay */}
            {showText && (
              <div
                className="absolute pointer-events-none left-1/2 -translate-x-1/2"
                style={{
                  top: "208px",
                }}
              >
                <div
                  className={`${isInitialLoad ? "text-animate-in" : ""} ${
                    isTextChanging
                      ? "text-fade-out"
                      : isInitialLoad
                      ? ""
                      : "text-fade-in"
                  }`}
                  style={{ position: "relative" }}
                  key={textContent}
                >
                  <p
                    className="text-center"
                    style={{
                      fontFamily: "var(--font-poppins), Poppins, sans-serif",
                      fontSize: "14px",
                      letterSpacing: "-0.02em",
                      width: "144px",
                      color: "rgba(255, 255, 255, 0.4)",
                    }}
                  >
                    {textContent}
                  </p>
                  <p
                    className="text-center text-shine"
                    style={{
                      fontFamily: "var(--font-poppins), Poppins, sans-serif",
                      fontSize: "14px",
                      letterSpacing: "-0.02em",
                      width: "144px",
                    }}
                  >
                    {textContent}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Input at the bottom */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              padding: "16px",
            }}
          >
            <input
              type="text"
              placeholder="What do you need today?"
              className="phone-input w-full"
              style={{
                height: "58px",
                borderRadius: "24px",
                backgroundColor: "#1C1C1E",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                padding: "0 16px",
                fontSize: "16px",
                fontFamily: "var(--font-poppins), Poppins, sans-serif",
                color: "#FFFFFF",
                outline: "none",
              }}
            />
          </div>
        </div>
      </div>

      {/* Control buttons */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={triggerThinking}
          className="rounded-lg bg-white/10 px-6 py-2 text-white transition-colors hover:bg-white/20"
          style={{
            fontFamily: "var(--font-poppins), Poppins, sans-serif",
            fontSize: "14px",
          }}
        >
          Thinking
        </button>
        <button
          onClick={triggerComplete}
          className="rounded-lg bg-white/10 px-6 py-2 text-white transition-colors hover:bg-white/20"
          style={{
            fontFamily: "var(--font-poppins), Poppins, sans-serif",
            fontSize: "14px",
          }}
        >
          Complete
        </button>
        <button
          onClick={resetStateMachine}
          className="rounded-lg bg-white/10 px-6 py-2 text-white transition-colors hover:bg-white/20"
          style={{
            fontFamily: "var(--font-poppins), Poppins, sans-serif",
            fontSize: "14px",
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
