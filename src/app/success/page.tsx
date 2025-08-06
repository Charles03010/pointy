import Link from "next/link";
import Image from "next/image";

export default function Success() {
  return (
    <>
      <div className="flex flex-col h-full justify-around space-y-10 items-center">
        <div className="text-center w-80 mx-auto space-y-2">
          <h1 className="font-normal text-2xl">Pairing Success</h1>
        </div>
        <div className="text-center w-80 mx-auto">
          <Image
            src="/assets/success.gif"
            className="mx-auto"
            alt="Success Ilustration"
            width={500}
            height={500}
          />
          <p className="font-light">
            Yeahh Succes to pairing! let's start setting up courses using this
            smartphone.
          </p>
        </div>
        <div className="flex flex-col mb-8 space-y-2 justify-center items-center">
          <Link
            href="/connected"
            className="text-gray-500 font-light text-center py-4 underline rounded-lg "
          >
            Let's Get Started
          </Link>
        </div>
      </div>
    </>
  );
}
