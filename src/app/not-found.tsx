'use client';

import { useRouter } from 'next/navigation';

export default function NotFoundPage() {

  const router = useRouter()
  const handleBack = () => {
    router.back()
  }
  
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-white">
      <div className="relative text-center">
        <h1 className="text-9xl font-extrabold tracking-widest text-blue-500 glitch">
          404
        </h1>
        <p className="text-xl mt-4 text-gray-300 capitalize">Oops! you shouldn't be here.</p>
        <p className="text-lg text-gray-500 mt-2">
          You might have taken a wrong turn into the void.
        </p>
      </div>
        <button onClick={() => {handleBack()}} className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-lg font-bold text-white transition-transform transform hover:scale-105 hover:bg-blue-700 shadow-md shadow-blue-500">
          Go Back Home
        </button>
      
      <style jsx>{`
        .glitch {
          position: relative;
          display: inline-block;
          animation: glitch 1.5s infinite;
        }

        @keyframes glitch {
          0% { text-shadow: 2px 2px 0px #ff0000, -2px -2px 0px #00ffff; }
          50% { text-shadow: -2px -2px 0px #ff0000, 2px 2px 0px #00ffff; }
          100% { text-shadow: 2px 2px 0px #ff0000, -2px -2px 0px #00ffff; }
        }
      `}</style>
    </div>
  );
}
