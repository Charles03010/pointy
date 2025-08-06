import { ChevronLeft, ChevronRight, Mouse, Orbit } from "lucide-react";

export default function Connected() {
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
