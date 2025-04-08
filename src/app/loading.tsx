"use client";

import React from "react";

const CosmicLoader = () => {
  return (
    <div className="fixed inset-0 -z-[9999] flex items-center justify-center bg-transparent ">
      <div className="relative w-32 h-32">
        <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-b-transparent border-purple-500 animate-spin-slow" />
        <div className="absolute inset-4 rounded-full border-4 border-l-transparent border-r-transparent border-cyan-400 animate-spin-reverse" />
        <div className="absolute inset-8 rounded-full bg-gradient-to-r from-purple-600 to-cyan-400 blur-xl opacity-70 animate-pulse" />
      </div>
    </div>
  );
};

export default CosmicLoader;
