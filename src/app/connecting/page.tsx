export default function Connecting() {
  return (
    <>
      <div className="flex flex-col h-full space-y-8 items-center">
        <div className="text-center w-80 mx-auto space-y-2 mt-10">
          <h1 className="font-normal text-2xl">
            Looking for Pairing the Device
          </h1>
        </div>
        <div className="flex items-center justify-center">
          <h2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse">
            Looking for Device
          </h2>
            {[180, 230, 270].map((size, idx) => (
            <svg
              key={size}
              className={`progress-ring mx-auto absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin`}
              style={{
              animationDuration: `${2 + idx}s`,
              zIndex: 10 - idx,
              }}
              viewBox="0 0 120 120"
              fill="none"
              width={size}
              height={size}
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
              <mask id={`m1-${idx}`}>
                <circle
                stroke="white"
                pathLength="300"
                strokeWidth="1"
                fill="transparent"
                strokeDasharray="1 1"
                r="57"
                cx="60"
                cy="60"
                />
              </mask>
              </defs>
              <circle
              mask={`url(#m1-${idx})`}
              stroke="#000000"
              pathLength="300"
              strokeWidth="1"
              fill="transparent"
              strokeDasharray="200 300"
              r="57"
              cx="60"
              cy="60"
              transform="rotate(-90 60 60)"
              />
            </svg>
            ))}
        </div>
      </div>
    </>
  );
}
