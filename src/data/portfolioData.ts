export interface SocialLink {
  id: string;
  name: string;
  description: string;
  icon: string;
  url: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  icon: string;
  tech: string;
  github: string;
  demo?: string;
  caseStudy?: {
    problem: string;
    implementation: string;
    challenge: string;
    image: string;
    imageAlt: string;
    imageCaption: string;
  };
}

export const PORTFOLIO_DATA = {
  developer: {
    name: 'Ralph Giann Suquib',
    title: 'Full Stack Developer',
    email: 'giannralph@gmail.com',
    location: 'Philippines / Remote',
    github: 'https://github.com/Ralphyy9yy',
    linkedin: 'https://www.linkedin.com/in/ralph-giann-suquib-887a79382/',
    avatar: '/images/profile-picture.png',
  },

  socialLinks: [
    { id: 'github', name: 'GitHub', description: 'Explore my repositories and source code', icon: '⌘', url: 'https://github.com/Ralphyy9yy' },
    { id: 'linkedin', name: 'LinkedIn', description: 'Connect with me professionally', icon: 'in', url: 'https://www.linkedin.com/in/ralph-giann-suquib-887a79382/' },
    { id: 'email', name: 'Email', description: 'giannralph@gmail.com', icon: '✉', url: 'mailto:giannralph@gmail.com' },
    { id: 'resume', name: 'View Resume', description: 'Preview or download my resume as a PDF', icon: '↓', url: '#resume' },
  ] satisfies SocialLink[],

  projects: [
    {
      id: 'alertu',
      name: 'ALERTU — Campus Safety App',
      description: 'An Android app for campus safety, incident reporting, and emergency resources.',
      icon: '🚨',
      tech: 'Kotlin · Android SDK · Firebase Auth · Firestore',
      github: 'https://github.com/Ralphyy9yy/ALERTU',
      caseStudy: {
        problem: 'Students and staff need a central place to report incidents and find campus safety resources.',
        implementation: 'Android screens connect authentication, incident reports, emergency contacts, and safety resources. The incident list uses Firestore snapshot listeners and supports search and incident-type filters.',
        challenge: 'Keeping asynchronous reports understandable: the interface distinguishes loading, empty results, filtered results, and errors, and removes its database listener when the activity is destroyed.',
        image: '/images/projects/alertu.png',
        imageAlt: 'ALERTU Android application icon',
        imageCaption: 'Application icon from the Android project. Source code is available below.',
      },
    },
    {
      id: 'bugreplay',
      name: 'BugReplay — AI-Assisted Debugging CLI',
      description: 'An experimental CLI that turns application logs into evidence-backed investigations and runnable regression tests.',
      icon: '🐛',
      tech: 'TypeScript · Node.js · Gemini · Vitest',
      github: 'https://github.com/Ralphyy9yy/BugReplay',
      caseStudy: {
        problem: 'A production error log describes a failure, but reproducing it and proving a fix often requires extra investigation.',
        implementation: 'The CLI groups incidents, gathers source and Git evidence, requests AI-assisted analysis, generates Vitest regression tests, and runs them. Proposed patches are reviewable before application.',
        challenge: 'Distinguishing a plausible AI explanation from evidence: a reproduction must match the original failure, and a fix is verified by regression and full-suite test runs. Gemini and Vitest are the currently supported integrations.',
        image: '/images/projects/bugreplay.png',
        imageAlt: 'BugReplay terminal output grouping application errors into incidents',
        imageCaption: 'Actual terminal preview from the BugReplay repository.',
      },
    },
    {
      id: 'minecraft-portfolio',
      name: 'Minecraft Portfolio Edition',
      description: 'A Minecraft-inspired portfolio with a playable voxel world, interactive character, and themed navigation.',
      icon: '⛏',
      tech: 'React · TypeScript · Three.js · Vite · Tailwind CSS',
      github: 'https://github.com/Ralphyy9yy/minecraft-portfolio-edition',
      demo: 'https://minecraft-portfolio-edition.vercel.app',
      caseStudy: {
        problem: 'Present software projects in a memorable format while keeping professional information easy to reach.',
        implementation: 'Reusable React screens display project details, contact links, and a PDF resume. Three.js powers the character and voxel game, which load only when their screens are opened.',
        challenge: 'Balancing the game theme with usability: keyboard navigation, readable descriptions, responsive scrolling, and loading states keep the portfolio useful beyond its visual effects.',
        image: '/images/minecraft-panorama.jpg',
        imageAlt: 'Minecraft landscape used as the portfolio background',
        imageCaption: 'The landscape artwork used in this portfolio; open the live demo to explore the interface.',
      },
    },
    {
      id: 'alertu-admin', name: 'ALERTU Admin — Dispatch & Incident Console',
      description: 'An administrative dashboard for monitoring incident alerts and safety broadcasts.',
      icon: '📡', tech: 'JavaScript · Web Dashboard', github: 'https://github.com/Ralphyy9yy/ALERTU-Admin',
    },
    {
      id: 'dontclickit', name: 'DontClickIt — Interactive Web Challenge',
      description: 'A playful web challenge with interactive traps and high-score records.',
      icon: '⚡', tech: 'JavaScript · HTML5 · CSS', github: 'https://github.com/Ralphyy9yy/DontClickIt', demo: 'https://dontclickit-ten.vercel.app',
    },
    {
      id: 'yplane-admin', name: 'YPlane Admin — Aviation Management',
      description: 'An administrative application for flight schedules, fleet status, and bookings.',
      icon: '✈', tech: 'Python · Database', github: 'https://github.com/Ralphyy9yy/yplane-admin',
    },
    {
      id: 'acadex', name: 'Acadex — Academic Management Portal',
      description: 'A student information system for courses, grades, and enrollment.',
      icon: '🎓', tech: 'Java · Object-Oriented Programming', github: 'https://github.com/Ralphyy9yy/Acadex',
    },
    {
      id: 'scamguard', name: 'ScamGuard — Fraud Detection & Security',
      description: 'An Android project for identifying suspicious messages, calls, and links.',
      icon: '🛡', tech: 'Kotlin · Android', github: 'https://github.com/Ralphyy9yy/scamguard',
    },
    {
      id: 'resort-booking', name: 'Online Resort Booking Platform',
      description: 'A hospitality reservation application with room availability and guest accounts.',
      icon: '🏖', tech: 'JavaScript · Node.js · Express · EJS', github: 'https://github.com/Ralphyy9yy/online-resort-booking',
    },
    {
      id: 'library-system', name: 'Library Management System',
      description: 'A library application for book inventory, borrowing, returns, and fines.',
      icon: '📖', tech: 'Java · Data Structures · Swing', github: 'https://github.com/Ralphyy9yy/LibraryManagementSystem',
    },
    {
      id: 'iris-classifier', name: 'Iris Flower ML Classifier',
      description: 'A classification project using flower measurements to identify iris species.',
      icon: '🌸', tech: 'Java · Machine Learning', github: 'https://github.com/Ralphyy9yy/IrisFlowerClassifier',
    },
    {
      id: 'valentines-card', name: "Valentine's Interactive Card & Game",
      description: 'An interactive greeting card with runaway buttons, sound effects, and confetti.',
      icon: '💌', tech: 'JavaScript · CSS · canvas-confetti', github: 'https://github.com/Ralphyy9yy/valentines-card', demo: 'https://valentines-card-gamma.vercel.app',
    },
  ] as Project[],

  resume: { url: '/Ralph_Giann_Suquib_CV.pdf', fileName: 'Ralph_Giann_Suquib_CV.pdf' },
};
