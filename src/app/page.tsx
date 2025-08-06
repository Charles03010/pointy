import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="flex flex-col h-full justify-between">
        <div className="text-center w-80 mx-auto space-y-2 mt-16">
          <h1 className="font-semibold text-2xl">Web Pointer</h1>
          <p className="font-light">
            Let's simplify the use of pointers. From now on, you can start using
            your smartphone. Let's try it!
          </p>
        </div>
        <div className="">
          <Image src="/assets/home-ilust.png" className="mx-auto" alt="" width={500} height={500} />
        </div>
        <div className="flex flex-col mb-8 space-y-2 justify-center items-center">
          <Link
            href="/pairing"
            className="bg-(--btn-blue-primary) text-white w-[90%] font-light text-center py-4 rounded-lg"
          >
            Start Pairing
          </Link>
          <Link
            href="/skip"
            className="text-gray-500 font-light text-center py-4 rounded-lg"
          >
            Skip for now
          </Link>
        </div>
      </div>
    </>
  );
}
