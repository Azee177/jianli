export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`${className} bg-gradient-to-br from-[#3330E4] to-[#6B5CE8] rounded-lg flex items-center justify-center relative overflow-hidden`}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
      
      {/* Comma SVG - 裁剪只显示逗号部分 */}
      <svg 
        viewBox="350 600 300 450" 
        className="w-[55%] h-[55%] relative z-10"
        fill="none"
      >
        <path 
          d="M423.296 647.38816h174.29504v196.09088c-9.33376 80.9216-49.80224 140.0576-121.38496 180.52096l-49.80224-43.5712c59.136-31.1296 87.14752-80.93184 87.14752-146.28864H420.18304v-186.752h3.11296z" 
          fill="white"
        />
      </svg>
    </div>
  );
}

