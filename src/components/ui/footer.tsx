
const Footer = () => {
  return (
    <div className="w-full md:max-w-[1136px] mt-auto md:mt-6 px-6 md:px-0 py-4 flex flex-col md:flex-row justify-between items-center text-[12px] text-[#5f6368] gap-4">
      {/* Language Selector - Left Side on Desktop - v1.1 */}
      <div className="flex items-center gap-1 cursor-pointer hover:bg-[#f1f3f4] p-2 -ml-2 rounded transition-colors w-fit group">
        <span>English (United States)</span>
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="currentColor"
          className="mt-0.5"
        >
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </div>

      {/* Links - Right Side on Desktop, Side by Side */}
      <div className="flex items-center gap-6">
        <span className="cursor-pointer hover:text-[#202124] transition-colors">
          Help
        </span>
        <span className="cursor-pointer hover:text-[#202124] transition-colors">
          Privacy
        </span>
        <span className="cursor-pointer hover:text-[#202124] transition-colors">
          Terms
        </span>
      </div>
    </div>
  );
};

export default Footer;
