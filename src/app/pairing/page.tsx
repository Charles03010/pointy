"use client";
import Image from "next/image";
import Link from "next/link";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Pairing() {
  const router = useRouter();
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (otp.length === 4) {
      sessionStorage.setItem("room", otp);
      router.push("/connecting");
    }
  }, [otp, router]);
  return (
    <>
      <div className="flex flex-col h-full space-y-8 items-center">
        <div className="text-center w-80 mx-auto space-y-2 mt-10">
          <Image
            src="/assets/pair-ilust.png"
            className="mx-auto mb-4"
            alt=""
            width={50}
            height={50}
          />
          <h1 className="font-normal text-2xl">Verification Required</h1>
          <p className="font-light">
            Enter your verification code from device you want to connect
          </p>
        </div>
        <div className="mt-4">
          <InputOTP maxLength={4} onChange={(value) => setOtp(value)}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <div className="flex flex-col mb-8 space-y-2 justify-center items-center">
          <Link
            href="/connecting"
            className="text-gray-500 font-light text-center py-4 underline rounded-lg "
          >
            Pairing now
          </Link>
        </div>
      </div>
    </>
  );
}
