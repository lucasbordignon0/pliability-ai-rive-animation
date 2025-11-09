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
  const [showFirstText, setShowFirstText] = useState(false);
  const [showSecondText, setShowSecondText] = useState(false);
  const [isFirstTextFadingOut, setIsFirstTextFadingOut] = useState(false);
  const [isSecondTextFadingOut, setIsSecondTextFadingOut] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [currentState, setCurrentState] = useState<string>("");

  const { rive, RiveComponent } = useRive({
    src: "/plia-rive-v3.riv",
    stateMachines: "State Machine 1",
    autoplay: true,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.TopCenter,
    }),
    onStateChange: (event) => {
      // Try multiple event structures to find the state name
      let stateName = "";
      if (typeof event === "string") {
        stateName = event;
      } else if (event?.data?.[0]?.name) {
        stateName = event.data[0].name;
      } else if (event?.data?.name) {
        stateName = event.data.name;
      } else if (event?.name) {
        stateName = event.name;
      } else if (event?.stateName) {
        stateName = event.stateName;
      }
      
      console.log("State change - raw event:", event, "stateName:", stateName);
      
      if (!stateName) return;
      
      // Handle state names with or without prefixes (↻ or →)
      const cleanStateName = stateName.replace(/^[↻→]\s*/, "");
      setCurrentState(cleanStateName);
      
      // Show first text when idle state is active
      if (cleanStateName === "idle" || stateName.includes("idle")) {
        setIsFirstTextFadingOut(false);
        setShowFirstText(true);
        setIsSecondTextFadingOut(false);
        setShowSecondText(false);
      }
      // Show second text when thinking state is active (but not thinking-blend)
      else if ((cleanStateName === "thinking" || stateName.includes("thinking")) && !stateName.includes("blend")) {
        console.log("Thinking state detected - showing second text");
        setIsFirstTextFadingOut(false);
        setShowFirstText(false);
        setIsSecondTextFadingOut(false);
        setShowSecondText(true);
      }
      // Hide first text when transitioning to thinking-blend
      else if (cleanStateName === "thinking-blend" || stateName.includes("thinking-blend")) {
        setIsFirstTextFadingOut(false);
        setShowFirstText(false);
        // Keep second text hidden until thinking state starts
      }
      else if (cleanStateName === "complete" || stateName.includes("complete")) {
        setIsSecondTextFadingOut(true);
        setTimeout(() => {
          setShowSecondText(false);
          setIsSecondTextFadingOut(false);
        }, 300);
      }
    },
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
      // Fade out first text when toThinking is triggered
      setIsFirstTextFadingOut(true);
      setTimeout(() => {
        setShowFirstText(false);
        setIsFirstTextFadingOut(false);
      }, 300);
      toThinkingInput.fire();
      
      // Show second text after thinking-blend completes and thinking starts
      // Adjust this delay based on your thinking-blend animation duration
      setTimeout(() => {
        setIsSecondTextFadingOut(false);
        setShowSecondText(true);
      }, 800); // Adjust timing based on thinking-blend duration
    }
  }, [toThinkingInput]);

  const triggerComplete = useCallback(() => {
    if (doneInput) {
      // Fade out second text when done is triggered
      setIsSecondTextFadingOut(true);
      setTimeout(() => {
        setShowSecondText(false);
        setIsSecondTextFadingOut(false);
      }, 300);
      doneInput.fire();
    }
  }, [doneInput]);

  const resetStateMachine = useCallback(() => {
    if (resetInput) {
      resetInput.fire();
      setIsFirstTextFadingOut(false);
      setIsSecondTextFadingOut(false);
      setShowFirstText(false);
      setShowSecondText(false);
      // Show first text again after reset (when idle starts)
      setTimeout(() => {
        setShowFirstText(true);
      }, 2000);
    }
  }, [resetInput]);

  // Show first text after idle state starts (intro runs first, then idle)
  useEffect(() => {
    if (rive) {
      const timer = setTimeout(() => {
        setShowFirstText(true);
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
            {/* First text overlay - appears during idle, disappears on toThinking */}
            {showFirstText && (
              <div
                className="absolute pointer-events-none left-1/2 -translate-x-1/2"
                style={{
                  top: "208px",
                }}
              >
                <div
                  className={
                    isFirstTextFadingOut
                      ? "text-fade-out"
                      : isInitialLoad
                      ? "text-animate-in"
                      : "text-fade-in"
                  }
                  style={{ position: "relative" }}
                >
                  <p
                    className="text-center"
                    style={{
                      fontFamily: "var(--font-poppins), Poppins, sans-serif",
                      fontSize: "14px",
                      letterSpacing: "-0.02em",
                      width: "144px",
                      color: "rgba(255, 255, 255, 1)",
                    }}
                  >
                    Let's work on building a session together.
                  </p>
                </div>
              </div>
            )}
            {/* Second text overlay - appears during thinking, disappears on done */}
            {showSecondText && (
              <div
                className="absolute pointer-events-none left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2"
              >
                <div
                  className={
                    isSecondTextFadingOut ? "text-fade-out" : "text-fade-in"
                  }
                  style={{ position: "relative" }}
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
                    "Warmup for a hard 10 mile run"
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
                    "Warmup for a hard 10 mile run"
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
