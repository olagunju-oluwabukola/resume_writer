interface FooterProps {
  hideSocial?: boolean;
  hideLinks?: boolean;
}

export function Footer({ hideSocial = false, hideLinks = false }: FooterProps = {}) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0F0920] pt-16 pb-10 px-4 sm:px-10 text-gray-400">
      <div className="max-w-[1100px] mx-auto">
        <div className={`grid ${hideLinks ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-5'} gap-12 mb-12`}>
          <div className="col-span-2 md:col-span-1">
            <div className="text-[22px] font-black text-white mb-3 tracking-tight">
              Resume<span className="text-violet-400">Rx</span>
            </div>
            <p className="text-sm leading-relaxed max-w-[200px]">
              AI-powered career tools to help you land the role you deserve.
            </p>
          </div>

          {!hideLinks && (
            <>
              {(
                [
                  { heading: "Product", items: ["Resume Tailoring", "Cover Letters", "Skills Gap", "Interview Prep", "App Tracker"] },
                  { heading: "Resources", items: ["Blog", "Guides", "FAQ", "Changelog"] },
                  { heading: "Company", items: ["About", "Careers", "Contact"] },
                  { heading: "Legal", items: ["Privacy", "Terms", "Cookies"] },
                ] as const
              ).map(({ heading, items }) => (
                <div key={heading}>
                  <div className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-4">
                    {heading}
                  </div>
                  {items.map((item) => (
                    <div key={item} className="text-sm mb-2.5 cursor-default hover:text-gray-300 transition-colors">
                      {item}
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}
        </div>

        <div className="border-t border-[#1F1035] pt-7 flex flex-wrap justify-between items-center gap-3">
          <div className="text-xs">© {currentYear} ResumeRx. Built with AI.</div>
          {!hideSocial && (
            <div className="flex gap-5 text-xs">
              {(["Twitter", "LinkedIn", "Instagram"] as const).map((s) => (
                <span key={s} className="cursor-default hover:text-gray-300 transition-colors">{s}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}