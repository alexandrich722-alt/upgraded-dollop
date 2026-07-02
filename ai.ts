@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-nova-border;
  }
  html {
    -webkit-tap-highlight-color: transparent;
    scroll-behavior: smooth;
  }
  body {
    @apply bg-nova-bg text-nova-text font-sans antialiased;
    overscroll-behavior: none;
    /* Ambient background — subtle radial gradients for depth */
    background-image:
      radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34, 211, 238, 0.06), transparent),
      radial-gradient(ellipse 60% 40% at 80% 100%, rgba(167, 139, 250, 0.05), transparent),
      radial-gradient(ellipse 50% 30% at 20% 80%, rgba(52, 211, 153, 0.03), transparent);
    background-attachment: fixed;
  }
  ::selection {
    @apply bg-accent-cyan/30 text-white;
  }
  ::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }
  ::-webkit-scrollbar-track {
    @apply bg-transparent;
  }
  ::-webkit-scrollbar-thumb {
    @apply bg-nova-border rounded-full;
  }
  ::-webkit-scrollbar-thumb:hover {
    @apply bg-nova-muted;
  }
  :focus-visible {
    @apply outline-none ring-2 ring-accent-cyan/40 ring-offset-2 ring-offset-nova-bg;
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
}

@layer components {
  /* Glass — refined with inner highlight */
  .glass {
    @apply bg-nova-card/50 backdrop-blur-xl border border-nova-border/50;
    box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.03);
  }
  .glass-strong {
    @apply bg-nova-card/75 backdrop-blur-2xl border border-nova-border;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 0 rgba(255, 255, 255, 0.04);
  }

  /* Card — premium with subtle inner glow */
  .card {
    @apply bg-nova-card border border-nova-border rounded-2xl;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25), inset 0 1px 0 0 rgba(255, 255, 255, 0.03);
  }
  .card-hover {
    @apply transition-all duration-300;
  }
  .card-hover:hover {
    @apply border-nova-border-bright;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
    transform: translateY(-2px);
  }

  /* Buttons — premium with active states */
  .btn {
    @apply inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
  }
  .btn-primary {
    @apply btn bg-accent-cyan text-nova-bg font-semibold;
  }
  .btn-primary:hover {
    @apply bg-accent-cyan/90;
    box-shadow: 0 0 24px rgba(34, 211, 238, 0.3), 0 4px 12px rgba(34, 211, 238, 0.15);
  }
  .btn-primary:active {
    transform: scale(0.97);
  }
  .btn-violet {
    @apply btn bg-accent-violet text-white font-semibold;
  }
  .btn-violet:hover {
    @apply bg-accent-violet/90;
    box-shadow: 0 0 24px rgba(167, 139, 250, 0.3), 0 4px 12px rgba(167, 139, 250, 0.15);
  }
  .btn-violet:active {
    transform: scale(0.97);
  }
  .btn-ghost {
    @apply btn bg-nova-surface text-nova-text border border-nova-border;
  }
  .btn-ghost:hover {
    @apply bg-nova-card-hover border-nova-border-bright;
  }
  .btn-ghost:active {
    transform: scale(0.97);
  }
  .btn-danger {
    @apply btn bg-accent-rose/15 text-accent-rose border border-accent-rose/25;
  }
  .btn-danger:hover {
    @apply bg-accent-rose/25;
  }
  .btn-danger:active {
    transform: scale(0.97);
  }

  /* Input — refined focus */
  .input {
    @apply w-full bg-nova-surface border border-nova-border rounded-xl px-4 py-2.5 text-sm text-nova-text placeholder-nova-muted transition-all duration-200;
  }
  .input:focus {
    @apply outline-none border-accent-cyan/50;
    box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.03);
  }

  .label {
    @apply text-xs font-medium text-nova-muted uppercase tracking-wider mb-1.5;
  }
  .badge {
    @apply inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium;
  }
  .section-title {
    @apply font-display text-lg font-semibold text-nova-text;
  }
  .skeleton {
    @apply bg-gradient-to-r from-nova-border via-nova-surface to-nova-border bg-[length:200%_100%] animate-shimmer rounded-lg;
  }
}

@layer utilities {
  .text-gradient-cyan {
    @apply bg-gradient-to-r from-accent-cyan to-accent-blue bg-clip-text text-transparent;
  }
  .text-gradient-violet {
    @apply bg-gradient-to-r from-accent-violet to-accent-cyan bg-clip-text text-transparent;
  }
  .text-gradient-gold {
    @apply bg-gradient-to-r from-accent-gold to-accent-rose bg-clip-text text-transparent;
  }
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  /* Premium gradient mesh for hero cards */
  .gradient-mesh {
    background-image:
      radial-gradient(at 0% 0%, rgba(34, 211, 238, 0.08) 0px, transparent 50%),
      radial-gradient(at 100% 100%, rgba(167, 139, 250, 0.06) 0px, transparent 50%);
  }
  .gradient-mesh-violet {
    background-image:
      radial-gradient(at 0% 0%, rgba(167, 139, 250, 0.08) 0px, transparent 50%),
      radial-gradient(at 100% 100%, rgba(34, 211, 238, 0.05) 0px, transparent 50%);
  }
  .gradient-mesh-gold {
    background-image:
      radial-gradient(at 0% 0%, rgba(251, 191, 36, 0.06) 0px, transparent 50%),
      radial-gradient(at 100% 100%, rgba(251, 113, 133, 0.04) 0px, transparent 50%);
  }
  .gradient-mesh-emerald {
    background-image:
      radial-gradient(at 0% 0%, rgba(52, 211, 153, 0.06) 0px, transparent 50%),
      radial-gradient(at 100% 100%, rgba(34, 211, 238, 0.04) 0px, transparent 50%);
  }
  .gradient-mesh-rose {
    background-image:
      radial-gradient(at 0% 0%, rgba(251, 113, 133, 0.06) 0px, transparent 50%),
      radial-gradient(at 100% 100%, rgba(167, 139, 250, 0.04) 0px, transparent 50%);
  }
}
