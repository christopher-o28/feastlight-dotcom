// src/components/LoadingScreen.jsx
export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-feast-dark via-feast-dark to-feast-red/10 flex flex-col items-center justify-center gap-8">
      {/* Animated Background Circle */}
      <div className="relative w-32 h-32">
        {/* Outer rotating ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-feast-red border-r-feast-red/50 
                        animate-spin shadow-[0_0_60px_rgba(255,75,75,0.3)]" />

        {/* Middle pulsing ring */}
        <div className="absolute inset-2 rounded-full border-2 border-feast-red/30 opacity-60
                        shadow-[0_0_40px_rgba(255,75,75,0.2)]" />

        {/* Inner rotating ring (reverse direction) */}
        <div className="absolute inset-4 rounded-full border-2 border-transparent border-b-feast-red 
                        animate-spin animate-reverse shadow-[0_0_30px_rgba(255,75,75,0.15)]"
          style={{ animationDirection: 'reverse' }} />

        {/* Center logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-gradient-to-br  to-feast-red/80 rounded-full flex items-center justify-center
                          ">
            <img
              src="https://tfvtalks.s3.dualstack.ap-southeast-1.amazonaws.com/01%20The%20FeastLight%20Archives%20/Images%20/Feast-Light-Logo-Rebrand-FINAL.png"
              alt="Feast Light Logo"
              className="animationLogoLink w-50 h-50 object-contain"
            />
          </div>
        </div>
      </div>

      {/* Text Section */}
      <div className="text-center">
        <h2 className="font-display font-black text-white text-2xl mb-2 animationLogoLink">
          The Feast Light
        </h2>
        <p className="text-white/50 text-sm tracking-widest uppercase mb-4">
          Loading Community...
        </p>

        {/* Animated dots */}
        <div className="flex gap-1.5 justify-center">
          <div className="w-2 h-2 bg-feast-red rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 bg-feast-red rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-feast-red rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>

      {/* Bottom message */}
      <p className="text-white/30 text-xs tracking-widest mt-8">
        Nourishing Hearts with Hope
      </p>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 3s linear infinite;
        }
        .animate-reverse {
          animation: spin 3s linear infinite reverse;
        }
        .animationLogoLink {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}