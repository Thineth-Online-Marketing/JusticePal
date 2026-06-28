import Image from "next/image";

export default function JusticePalLogo() {
  return (
    <div className="flex items-center gap-3 shrink-0">
      <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm flex items-center justify-center bg-blue-50/50 shrink-0">
        <Image
          src="https://res.cloudinary.com/dluwvqdaz/image/upload/v1775969976/Navy_Blue_JusticePal_Logo_with_Dove_Fusion_new_uhyjl0.png"
          alt="JusticePal Logo"
          fill
          className="object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <svg className="w-6 h-6 absolute -z-10 text-blue-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
      <div className="flex flex-col leading-tight shrink-0 hidden sm:flex">
        <span className="font-extrabold text-xl tracking-tight text-[#1B3A6B]">JusticePal</span>
        <span className="text-[10px] font-bold tracking-[0.2em] text-[#3b6fd4] uppercase">Sri Lanka</span>
      </div>
    </div>
  );
}
