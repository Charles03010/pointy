"use client";
import { ChevronLeft, ChevronRight, Mouse, Orbit } from "lucide-react";
import { useEffect, useState } from 'react';
import { useSocket } from "../socket";
import { useRouter } from "next/navigation";

export default function Connected() {
  const socket = useSocket();
  const router = useRouter();
  const [gyroData, setGyroData] = useState<{ alpha: number; beta: number; gamma: number } | null>(null);
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
  useEffect(() => {
    if (sessionStorage.getItem("room") && socket) {
      socket.emit("join", { room: sessionStorage.getItem("room") });

      socket.on("join_status", (response) => {
        if (response.status === "success") {
          return;
        } else {
          router.push("/pairing");
        }
      });
      return () => {
        socket.off("join_status");
      };
    }
    else{
      router.push("/pairing");
    }
  }, [socket, router]);
  
  useEffect(() => {

    const handleDeviceOrientation = (event: DeviceOrientationEventWithAngles) => {
      const { alpha, beta, gamma } = event;
      const gyro: GyroData = {
      alpha: alpha ?? 0,
      beta: beta ?? 0,
      gamma: gamma ?? 0,
      };
      setGyroData(gyro);
      if (socket) {
        socket.emit('gyro_data', gyro);
      }
    };
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }
    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleDeviceOrientation);
      }
    };
  }, []);
  return (
    <>
      <div className="h-full px-4 pt-10 pb-4 grid grid-cols-4 grid-rows-4 gap-x-2 gap-y-4">
        <button className="w-full min-h-5/7 bg-(--btn-blue-mouse) rounded-xl col-span-2"></button>
        <button className="w-full min-h-5/7 bg-(--btn-blue-mouse) rounded-xl col-span-2"></button>
        <button className="w-full min-h-5/7 bg-(--btn-blue-keyboard) rounded-xl col-span-1 flex items-center justify-center">
          <ChevronLeft className=" text-slate-400" size={50} />
        </button>
        <button className="w-full min-h-5/7 bg-(--btn-blue-gyro) rounded-xl col-span-2 flex items-center justify-center">
          <Orbit className=" text-slate-400" size={50} />
        </button>
        <button className="w-full min-h-5/7 bg-(--btn-blue-keyboard) rounded-xl col-span-1 flex items-center justify-center">
          <ChevronRight className=" text-slate-400" size={50} />
        </button>
        <button className="w-full min-h-6/7 bg-(--btn-blue-track) rounded-xl col-span-4 row-span-2 flex items-end justify-end">
          <Mouse className=" text-slate-400 m-5" size={50} />
        </button>
      </div>
    </>
  );
}
