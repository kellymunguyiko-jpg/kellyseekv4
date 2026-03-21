import { useState, useEffect } from "react";
import { Search, Bell, ChevronDown, Menu, X } from "lucide-react";

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  setCurrentPage,
  searchQuery,
  setSearchQuery,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#141414] shadow-lg"
          : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-4 md:px-8 py-4">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <span
            className="text-[#E50914] font-black text-2xl md:text-3xl tracking-wider cursor-pointer select-none"
            onClick={() => setCurrentPage("home")}
          >
            KELLYBOX
          </span>
          <div className="hidden md:flex items-center gap-6">
            {["Home", "Movies", "Series", "My List"].map((item) => (
              <button
                key={item}
                onClick={() => setCurrentPage(item.toLowerCase().replace(" ", ""))}
                className={`text-sm font-medium transition-colors ${
                  currentPage === item.toLowerCase().replace(" ", "")
                    ? "text-white font-semibold"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3 md:gap-5">
          {/* Search */}
          <div className="flex items-center">
            {searchOpen ? (
              <div className="flex items-center bg-black/80 border border-white/50 px-3 py-1 rounded">
                <Search size={16} className="text-white mr-2" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search titles..."
                  className="bg-transparent text-white text-sm outline-none w-32 md:w-48"
                />
                <X
                  size={16}
                  className="text-white ml-2 cursor-pointer"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                />
              </div>
            ) : (
              <button onClick={() => setSearchOpen(true)}>
                <Search size={20} className="text-white hover:text-gray-300 cursor-pointer" />
              </button>
            )}
          </div>
          <Bell size={20} className="text-white hover:text-gray-300 cursor-pointer hidden md:block" />
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded bg-[#E50914] flex items-center justify-center text-white font-bold text-sm">
              K
            </div>
            <ChevronDown size={16} className="text-white hidden md:block" />
          </div>
          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#141414] border-t border-gray-800 px-4 py-4 flex flex-col gap-4">
          {["Home", "Movies", "Series", "My List"].map((item) => (
            <button
              key={item}
              onClick={() => {
                setCurrentPage(item.toLowerCase().replace(" ", ""));
                setMobileOpen(false);
              }}
              className={`text-left text-sm font-medium transition-colors ${
                currentPage === item.toLowerCase().replace(" ", "")
                  ? "text-white font-semibold"
                  : "text-gray-300"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
