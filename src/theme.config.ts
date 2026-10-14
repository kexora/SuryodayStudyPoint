export const themeConfig = {
  mode: 'light', // or 'dark'
  
  // Global Roundness Control
  // Change this to 'sm', 'md', 'lg', 'xl', 'full' to change app-wide border radius
  borderRadius: 'none', 
  
  colors: {
    light: {
      primary: 'bg-crhs-navy text-white',
      secondary: 'bg-crhs-gold text-crhs-navy',
      background: 'bg-white',
      surface: 'bg-slate-50',
      border: 'border-slate-200',
      text: 'text-slate-800',
      textMuted: 'text-slate-500',
    },
    dark: {
      primary: 'bg-crhs-gold text-crhs-navy',
      secondary: 'bg-crhs-navy text-white',
      background: 'bg-slate-900',
      surface: 'bg-slate-800',
      border: 'border-slate-700',
      text: 'text-slate-100',
      textMuted: 'text-slate-400',
    }
  },

  button: {
    base: 'inline-flex items-center justify-center whitespace-nowrap font-black uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crhs-navy disabled:pointer-events-none disabled:opacity-50 min-h-[38px] sm:min-h-[44px] max-w-full truncate',
    sizes: {
      sm: 'px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs',
      md: 'px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-xs',
      lg: 'px-5 sm:px-8 py-2.5 sm:py-3.5 text-xs sm:text-sm',
    },
    variants: {
      primary: 'bg-crhs-navy text-white hover:bg-crhs-gold hover:text-crhs-navy border-2 border-crhs-navy active:scale-[0.98]',
      secondary: 'bg-crhs-gold text-crhs-navy hover:bg-crhs-navy hover:text-white border-2 border-crhs-gold active:scale-[0.98]',
      outline: 'border-2 border-crhs-navy bg-transparent text-crhs-navy hover:bg-crhs-navy hover:text-white active:scale-[0.98]',
      ghost: 'hover:bg-slate-100 text-crhs-navy border-2 border-transparent active:scale-[0.98]',
    }
  },

  card: {
    base: 'bg-white text-slate-950 border-2 border-slate-200 shadow-none hover:shadow-md transition-shadow max-w-full overflow-hidden',
    padding: 'p-4 sm:p-6 lg:p-8',
  },

  input: {
    base: 'flex w-full min-w-0 border-2 border-slate-200 bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm ring-offset-white file:border-0 file:bg-transparent file:text-xs file:sm:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crhs-navy focus-visible:border-crhs-navy disabled:cursor-not-allowed disabled:opacity-50 font-medium max-w-full min-h-[40px] sm:min-h-[44px]',
  }
};

export const getRadiusClass = () => {
  switch (themeConfig.borderRadius) {
    case 'none': return 'rounded-none';
    case 'sm': return 'rounded-sm';
    case 'md': return 'rounded-md';
    case 'lg': return 'rounded-lg';
    case 'xl': return 'rounded-xl';
    case 'full': return 'rounded-full';
    default: return 'rounded-none';
  }
};
