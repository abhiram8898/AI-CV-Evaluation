import logo from "../../public/logo.png";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className=" mx-auto px-6">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="bg-white/5 rounded-lg p-1.5 shadow-md">
              <img
                src={logo}
                alt="AI CV Evaluation Platform Logo"
                className="h-8 w-auto"
              />
            </div>

            {/* Brand */}
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                AI CV Evaluation
              </h1>
            </div>
          </div>

          {/* Optional: Add navigation or action button */}
          <div className="hidden md:flex items-center gap-4">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              How It Works
            </button>
            <button className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
