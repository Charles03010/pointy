"use client";
import { ChevronLeft, ChevronRight, Mouse, Orbit } from "lucide-react";
import { useEffect, useState, useRef } from "react"; // Import useRef
import { useSocket } from "../socket";
import { useRouter } from "next/navigation";

export default function Connected() {
  const socket = useSocket();
  const router = useRouter();

  // --- State and Refs ---
  const [gyroEnabled, setGyroEnabled] = useState(false);

  // Use useRef to store values that persist across renders without causing re-renders
  const lastTouch = useRef<{ x: number; y: number } | null>(null);
  const lastSentTime = useRef(Date.now()); // Fixed gyro throttling

  // --- Interfaces ---
  interface GyroData {
    alpha: number;
    beta: number;
    gamma: number;
  }

  interface DeviceOrientationEventWithAngles extends Event {
    alpha: number | null;
    beta: number | null;
    gamma: number | null;
  }

  // --- Effects for Socket and Gyro ---
  useEffect(() => {
    if (sessionStorage.getItem("room") && socket) {
      socket.emit("join", { room: sessionStorage.getItem("room") });

      socket.on("join_status", (response) => {
        if (response.status !== "success") {
          router.push("/pairing");
        }
      });

      return () => {
        socket.off("join_status");
      };
    } else {
      router.push("/pairing");
    }
  }, [socket, router]);

  useEffect(() => {
    const handleDeviceOrientation = (event: DeviceOrientationEventWithAngles) => {
      const currentTime = Date.now();

      // Correctly throttle gyro data using the ref's value
      if (gyroEnabled && currentTime - lastSentTime.current >= 50) {
        const { alpha, beta, gamma } = event;
        const gyro: GyroData = {
          alpha: alpha ?? 0,
          beta: beta ?? 0,
          gamma: gamma ?? 0,
        };

        if (socket) {
          socket.emit("gyro_data", gyro);
        }

        lastSentTime.current = currentTime; // Update the ref's value
      }
    };

    window.addEventListener("deviceorientation", handleDeviceOrientation);
    return () => {
      window.removeEventListener("deviceorientation", handleDeviceOrientation);
    };
  }, [gyroEnabled, socket]); // Added socket to dependency array

  // --- Click and Keyboard Handlers ---
  const sendMouseLeft = () => socket?.emit("mouse_left");
  const sendMouseRight = () => socket?.emit("mouse_right");
  const sendKeyboardLeft = () => socket?.emit("keyboard_left");
  const sendKeyboardRight = () => socket?.emit("keyboard_right");
  const toggleGyroControl = () => setGyroEnabled((prev) => !prev);

  // --- CORRECTED TRACKPAD LOGIC ---

  // 1. When the touch starts, record the initial position.
  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    console.log("Touch started:", touch.clientX, touch.clientY);
    lastTouch.current = { x: touch.clientX, y: touch.clientY };
  };

  // 2. As the touch moves, calculate the difference (delta) and send it.
  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    // event.preventDefault(); // Prevent scrolling while dragging on the trackpad
    if (!lastTouch.current) return; // Exit if touch hasn't started

    const touch = event.touches[0];
    const deltaX = touch.clientX - lastTouch.current.x;
    const deltaY = touch.clientY - lastTouch.current.y;

    // Send the relative movement, not the absolute position
    socket?.emit("trackpad_touch", { "x": deltaX, "y": deltaY });

    // Update the last touch position for the next move event
    lastTouch.current = { x: touch.clientX, y: touch.clientY };
    console.log("Touch moved:", touch.clientX, touch.clientY);
  };

  // 3. When the touch ends, clear the last position.
  const handleTouchEnd = () => {
    lastTouch.current = null; // Reset for the next touch gesture
    socket?.emit("trackpad_touch_end"); // Optional: notify server the gesture ended
    console.log("Touch ended");
  };

  return (
    <>
      <div className="h-full px-4 pt-10 pb-4 grid grid-cols-4 grid-rows-4 gap-x-2 gap-y-4">
        <div
          className="w-full min-h-5/7 bg-(--btn-blue-mouse) rounded-xl col-span-2"
          onClick={sendMouseLeft}
        ></div>
        <div
          className="w-full min-h-5/7 bg-(--btn-blue-mouse) rounded-xl col-span-2"
          onClick={sendMouseRight}
        ></div>
        <div
          className="w-full min-h-5/7 bg-(--btn-blue-keyboard) rounded-xl col-span-1 flex items-center justify-center"
          onClick={sendKeyboardLeft}
        >
          <ChevronLeft className="text-slate-400" size={50} />
        </div>
        <div
          className="w-full min-h-5/7 bg-(--btn-blue-gyro) rounded-xl col-span-2 flex items-center justify-center"
          onClick={toggleGyroControl}
        >
          <Orbit className="text-slate-400" size={50} />
        </div>
        <div
          className="w-full min-h-5/7 bg-(--btn-blue-keyboard) rounded-xl col-span-1 flex items-center justify-center"
          onClick={sendKeyboardRight}
        >
          <ChevronRight className="text-slate-400" size={50} />
        </div>
        <div
          className="w-full min-h-6/7 bg-(--btn-blue-track) rounded-xl col-span-4 row-span-2 flex items-end justify-end touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Mouse className="text-slate-400 m-5" size={50} />
        </div>
      </div>
    </>
  );
}