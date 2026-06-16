import { useState, useEffect } from "react";
import { Link } from "wouter";

const NAV_LINKS: readonly string[] = ["Features", "How it Works", "Success Stories", "FAQ"];

interface NavigationProps {
  scrolled?: boolean;
}

export function Navigation({ scrolled: externalScrolled }: NavigationProps = {}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // If scrolled is passed from parent, use it
    if (externalScrolled !== undefined) {
      return;
    }

    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [externalScrolled]);

  const isScrolled = externalScrolled !== undefined ? externalScrolled : scrolled;

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* ── NAV ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 sm:px-10 transition-all duration-300 ${
          isScrolled
            ? "bg-white/90 backdrop-blur-xl border-b border-violet-100 shadow-sm"
            : "bg-transparent border-b border-transparent"
        }`}
        aria-label="Primary navigation"
      >
        <Link to="/" className="text-[22px] font-black tracking-tight text-[#0F0920] no-underline">
          Resume<span className="text-violet-700">Rx</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/\s/g, "-")}`}
              className="text-gray-500 text-sm font-medium hover:text-violet-700 transition-colors no-underline"
            >
              {l}
            </a>
          ))}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="px-5 py-2.5 text-sm font-semibold text-violet-700 border border-violet-300 rounded-xl bg-white hover:bg-violet-50 hover:border-violet-600 transition-all no-underline"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="px-5 py-2.5 text-sm font-bold text-white bg-violet-700 rounded-xl hover:bg-violet-600 transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-violet-700/30 no-underline"
          >
            Get started free
          </Link>
        </div>

        {/* Hamburger Button - Mobile */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-violet-50 transition-colors"
          aria-label="Toggle menu"
          type="button"
        >
          <span
            className={`block w-6 h-0.5 bg-[#0F0920] transition-all duration-300 ${
              mobileMenuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-[#0F0920] transition-all duration-300 ${
              mobileMenuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-[#0F0920] transition-all duration-300 ${
              mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </nav>

      {/* ── MOBILE MENU OVERLAY ── */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={`absolute top-16 left-0 right-0 bg-white border-b border-violet-100 shadow-xl transition-all duration-300 ${
            mobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
        >
          <div className="flex flex-col p-6 gap-2">
            {/* Navigation Links */}
            {NAV_LINKS.map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase().replace(/\s/g, "-")}`}
                onClick={handleNavClick}
                className="py-3 px-4 text-gray-700 text-base font-medium hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-all no-underline"
              >
                {l}
              </a>
            ))}

            {/* Divider */}
            <div className="border-t border-violet-100 my-2" />

            {/* Auth Buttons */}
            <Link
              to="/login"
              onClick={handleNavClick}
              className="py-3 px-4 text-center text-violet-700 font-semibold border border-violet-300 rounded-xl hover:bg-violet-50 transition-all no-underline"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              onClick={handleNavClick}
              className="py-3 px-4 text-center text-white font-bold bg-violet-700 rounded-xl hover:bg-violet-600 transition-all no-underline"
            >
              Get started free
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}