import { useState } from "react";

type CompletionProps = {
  onUploadNew: () => void;
};

export default function Completion({ onUploadNew }: Readonly<CompletionProps>) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="flex justify-center items-center min-h-64 p-6">
      <div className="text-center bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-xl border border-white/80 backdrop-blur-sm max-w-md w-full">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl shadow-lg">
          <i className="fa-solid fa-check"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Analysis Complete!
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Your CV has been successfully analyzed and evaluated. You can now
          upload a new CV to start another analysis.
        </p>
        <button
          className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none rounded-full font-medium text-sm transition-all duration-200 ${
            isHovered ? "transform -translate-y-0.5 shadow-lg" : "shadow-md"
          }`}
          onClick={onUploadNew}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <i className="fa-solid fa-upload text-xs" aria-hidden="true"></i>{" "}
          Upload New CV
        </button>
      </div>
    </section>
  );
}
