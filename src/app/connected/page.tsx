"use client";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleDot,
  Mouse,
  Orbit,
} from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useSocket } from "../socket";
import { useRouter } from "next/navigation";

export default function Connected() {
  const socket = useSocket();
  const router = useRouter();

  const [gyroEnabled, setGyroEnabled] = useState(false);
  const [pointerEnabled, setPointerEnabled] = useState(false);
  const lastTouch = useRef<{ x: number; y: number } | null>(null);
  const lastSentTime = useRef(Date.now());
  const initialGyro = useRef<{
    alpha: number;
    beta: number;
    gamma: number;
  } | null>(null);

  const THROTTLE_DELAY = 0;

  interface GyroData {
    alpha: number;
    beta: number;
    gamma: number;
  }

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

  const handleDeviceOrientation = useCallback(
    (event: DeviceOrientationEvent) => {
      const currentTime = Date.now();

      if (gyroEnabled && currentTime - lastSentTime.current >= THROTTLE_DELAY) {
        const { alpha, beta, gamma } = event;

        if (initialGyro.current) {
          const relativeGyro: GyroData = {
            alpha: (alpha ?? 0) - initialGyro.current.alpha,
            beta: (beta ?? 0) - initialGyro.current.beta,
            gamma: (gamma ?? 0) - initialGyro.current.gamma,
          };

          socket?.emit("gyro_data", relativeGyro);
        }

        lastSentTime.current = currentTime;
      }
    },
    [gyroEnabled, socket]
  );

  useEffect(() => {
    if (gyroEnabled) {
      window.addEventListener("deviceorientation", handleDeviceOrientation);
    } else {
      window.removeEventListener("deviceorientation", handleDeviceOrientation);
    }

    return () => {
      window.removeEventListener("deviceorientation", handleDeviceOrientation);
    };
  }, [gyroEnabled, handleDeviceOrientation]);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    lastTouch.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!lastTouch.current || !socket) return;
    const touch = event.touches[0];
    const deltaX = touch.clientX - lastTouch.current.x;
    const deltaY = touch.clientY - lastTouch.current.y;
    socket.emit("trackpad_touch", { x: deltaX, y: deltaY });
    lastTouch.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = () => {
    lastTouch.current = null;
    socket?.emit("trackpad_touch_end");
  };

  const sendMouseLeft = useCallback(() => socket?.emit("mouse_left"), [socket]);
  const sendMouseRight = useCallback(
    () => socket?.emit("mouse_right"),
    [socket]
  );
  const sendKeyboardLeft = useCallback(
    () => socket?.emit("keyboard_left"),
    [socket]
  );
  const sendKeyboardRight = useCallback(
    () => socket?.emit("keyboard_right"),
    [socket]
  );
  const sendScrollUp = useCallback(
    () => socket?.emit("scroll_up"),
    [socket]
  );
  const sendScrollDown = useCallback(
    () => socket?.emit("scroll_down"),
    [socket]
  );
  const togglePointer = useCallback(() => {
    socket?.emit("toggle_pointer");
    setPointerEnabled((prev) => !prev);
  }, [socket]);

  const toggleGyroControl = useCallback(() => {
    setGyroEnabled((prev) => {
      if (!prev) {
        const handleInitialOrientation = (event: DeviceOrientationEvent) => {
          const { alpha, beta, gamma } = event;
          initialGyro.current = {
            alpha: alpha ?? 0,
            beta: beta ?? 0,
            gamma: gamma ?? 0,
          };

          window.removeEventListener(
            "deviceorientation",
            handleInitialOrientation
          );
        };

        window.addEventListener("deviceorientation", handleInitialOrientation);
      } else {
        initialGyro.current = null;
      }
      return !prev;
    });
  }, []);

  return (
    <div className="h-full px-4 pt-10 pb-4 grid grid-cols-4 grid-rows-6 gap-x-2 gap-y-4">
      <div
        className="w-full min-h-5/7 bg-(--btn-blue-mouse) rounded-xl col-span-2"
        onClick={sendMouseLeft}
      />
      <div
        className="w-full min-h-5/7 bg-(--btn-blue-mouse) rounded-xl col-span-2"
        onClick={sendMouseRight}
      />
      <div
        className="w-full min-h-5/7 bg-(--btn-blue-keyboard) rounded-xl col-span-1 row-span-2 flex items-center justify-center"
        onClick={sendKeyboardLeft}
      >
        <ChevronLeft className="text-slate-400" size={50} />
      </div>
      <div
        className="w-full min-h-5/7 bg-(--btn-blue-gyro) rounded-xl col-span-1 flex items-center justify-center"
        onClick={toggleGyroControl}
      >
        <Orbit
          className={gyroEnabled ? "text-green-400" : "text-slate-400"}
          size={50}
        />
      </div>
      <div
        className="w-full min-h-5/7 bg-(--btn-blue-gyro) rounded-xl col-span-1 flex items-center justify-center"
        onClick={sendScrollUp}
      >
        <ChevronUp className={"text-slate-400"} size={50} />
      </div>
      <div
        className="w-full min-h-5/7 bg-(--btn-blue-keyboard) rounded-xl col-span-1 row-span-2 flex items-center justify-center"
        onClick={sendKeyboardRight}
      >
        <ChevronRight className="text-slate-400" size={50} />
      </div>
      <div
        className="w-full min-h-5/7 bg-(--btn-blue-gyro) rounded-xl col-span-1 flex items-center justify-center"
        onClick={togglePointer}
      >
        <CircleDot
          className={pointerEnabled ? "text-red-400" : "text-slate-400"}
          size={50}
        />
      </div>
      <div
        className="w-full min-h-5/7 bg-(--btn-blue-gyro) rounded-xl col-span-1 flex items-center justify-center"
        onClick={sendScrollDown}
      >
        <ChevronDown className={"text-slate-400"} size={50} />
      </div>
      <div
        className="w-full min-h-6/7 bg-(--btn-blue-track) rounded-xl col-span-4 row-span-3 flex items-end justify-end touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Mouse className="text-slate-400 m-5" size={50} />
      </div>
    </div>
  );
}
