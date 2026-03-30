import React, { useRef, useEffect, useState } from "react";

const BallVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);

  const activityLevelRef = useRef<number>(0);
  const smoothedActivityLevel = useRef<number>(0);
  const [activityLevel, setActivityLevel] = useState<number>(0);

  // Visualization starts automatically
  const [isStarted, setIsStarted] = useState<boolean>(true);

  // --- Microphone + audio processing ---
  useEffect(() => {
    if (!isStarted) return;

    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let microphone: MediaStreamAudioSourceNode | null = null;
    let rafId: number | null = null;

    const handleSuccess = (stream: MediaStream) => {
      audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      analyser = audioContext.createAnalyser();
      microphone = audioContext.createMediaStreamSource(stream);

      microphone.connect(analyser);

      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const processAudio = () => {
        if (!analyser) return;

        analyser.getByteTimeDomainData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          const value = (dataArray[i] - 128) / 128;
          sum += value * value;
        }

        const rms = Math.sqrt(sum / bufferLength);
        const newLevel = Math.min(rms * 300, 100);

        setActivityLevel(newLevel);
        activityLevelRef.current = newLevel;

        rafId = requestAnimationFrame(processAudio);
      };

      rafId = requestAnimationFrame(processAudio);
    };

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(handleSuccess)
      .catch((error: Error) => {
        console.error("Microphone access error:", error);
        setIsStarted(false);
      });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (microphone) microphone.disconnect();
      if (audioContext) audioContext.close();
    };
  }, [isStarted]);

  // Update canvas size
  const updateCanvasSize = (): void => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (canvas && container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }
  };

  // Draw ball
  const drawPurpleBall = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    activity: number,
  ): void => {
    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      radius,
    );

    gradient.addColorStop(0, "rgba(150, 0, 255, 0.9)");
    gradient.addColorStop(0.6, "rgba(120, 50, 220, 0.8)");
    gradient.addColorStop(1, "rgba(75, 0, 130, 0.7)");

    ctx.shadowColor = "rgba(150, 0, 255, 0.7)";
    ctx.shadowBlur = 100 + activity * 0.5;

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    drawRings(ctx, centerX, centerY, radius, activity);
  };

  // Draw rings
  const drawRings = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    activity: number,
  ): void => {
    const numRings = 3 + Math.floor(activity / 20);

    for (let i = 0; i < numRings; i++) {
      const ringRadius = radius + 15 + i * 15 + activity * 0.2;
      const pulseEffect = Math.sin(Date.now() * 0.002 + i) * 5;

      ctx.beginPath();
      ctx.strokeStyle = `rgba(150, 0, 255, ${0.7 - i * 0.1})`;
      ctx.lineWidth = 3 + activity * 0.05;
      ctx.arc(centerX, centerY, ringRadius + pulseEffect, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = `rgba(200, 100, 255, ${0.3 - i * 0.05})`;
      ctx.lineWidth = 4 + activity * 0.1;
      ctx.arc(centerX, centerY, ringRadius + pulseEffect + 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  // Animation loop
  const animate = (): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;

    smoothedActivityLevel.current +=
      (activityLevelRef.current - smoothedActivityLevel.current) * 0.1;

    ctx.clearRect(0, 0, width, height);

    const baseRadius = 50;
    const currentRadius = baseRadius + smoothedActivityLevel.current * 0.5;

    drawPurpleBall(
      ctx,
      width / 2,
      height / 2,
      currentRadius,
      smoothedActivityLevel.current,
    );

    animationRef.current = requestAnimationFrame(animate);
  };

  // Canvas + animation lifecycle
  useEffect(() => {
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    if (isStarted) animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", updateCanvasSize);

      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isStarted]);

  return (
    <div
      ref={containerRef}
      style={{
        height: "400px",
        width: "100%",
        position: "relative",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default BallVisualizer;
