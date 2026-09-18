export interface SocialLink {
  id: string;
  name: string;
  description: string;
  icon: string;
  url: string;
}

export interface ProjectServer {
  id: string;
  name: string;
  description: string;
  status: 'online' | 'offline';
  players: string;
  ping: number;
  version: string;
  icon: string;
  tech: string;
  link: string;
  github?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  description: string;
  gameMode: string;
  issuer: string;
  year: string;
  status: string;
  link: string;
  badge: string;
  bgGradient: string;
}

export const PORTFOLIO_DATA = {
  developer: {
    name: "Ralph Giann Suquib",
    title: "Full Stack Developer & Creative Technologist",
    email: "giannralph@gmail.com",
    phone: "+63 900 000 0000",
    location: "Philippines / Remote",
    github: "https://github.com/Ralphyy9yy",
    linkedin: "https://www.linkedin.com/in/ralph-giann-suquib-887a79382/",
    avatar: "/images/profile-picture.png",
  },

  socialLinks: [
    {
      id: "github",
      name: "Ralphyy9yy (jirosjk)",
      description: "Explore my open-source repositories and code contributions",
      icon: "💻",
      url: "https://github.com/Ralphyy9yy"
    },
    {
      id: "linkedin",
      name: "Ralph Giann Suquib | LinkedIn",
      description: "Connect professionally and view my career updates",
      icon: "🌐",
      url: "https://www.linkedin.com/in/ralph-giann-suquib-887a79382/"
    },
    {
      id: "email",
      name: "Direct Email Contact",
      description: "giannralph@gmail.com — Send a direct message or inquiry",
      icon: "📧",
      url: "mailto:giannralph@gmail.com"
    },
    {
      id: "resume",
      name: "Download Resume",
      description: "Get a copy of my professional resume and tech qualifications",
      icon: "📄",
      url: "#resume"
    }
  ] as SocialLink[],

  projects: [
    {
      id: "minecraft-portfolio",
      name: "Minecraft Portfolio Edition",
      description: "Interactive 3D Minecraft Java & PE portfolio with Three.js voxel engine, Steve avatar, and sound synthesizer.",
      status: "online",
      players: "You're here!",
      ping: 5,
      version: "v1.20.4",
      icon: "⛏️",
      tech: "TypeScript + React + Three.js + Tailwind",
      link: "https://minecraft-portfolio-edition.vercel.app",
      github: "https://github.com/Ralphyy9yy/minecraft-portfolio-edition"
    },
    {
      id: "alertu",
      name: "ALERTU — Emergency Response App",
      description: "Real-time community safety broadcast platform and mobile app for immediate crisis notification and incident alerts.",
      status: "online",
      players: "Emergency Net",
      ping: 5,
      version: "Kotlin / Mobile",
      icon: "🚨",
      tech: "Kotlin + Android SDK + Firebase Realtime",
      link: "https://github.com/Ralphyy9yy/ALERTU",
      github: "https://github.com/Ralphyy9yy/ALERTU"
    },
    {
      id: "alertu-admin",
      name: "ALERTU Admin — Dispatch & Incident Console",
      description: "Administrative dispatch dashboard for emergency responders to monitor alerts, map coordinates, and send safety broadcasts.",
      status: "online",
      players: "Dispatch Center",
      ping: 5,
      version: "v2.1.0",
      icon: "📡",
      tech: "JavaScript + Web Dashboard + Emergency APIs",
      link: "https://github.com/Ralphyy9yy/ALERTU-Admin",
      github: "https://github.com/Ralphyy9yy/ALERTU-Admin"
    },
    {
      id: "bugreplay",
      name: "BugReplay — Session Recorder & Bug Tracker",
      description: "Developer debugging tool capturing DOM mutations, console activity, and network traces for rapid issue replication.",
      status: "online",
      players: "Dev Suite",
      ping: 5,
      version: "TypeScript 5.x",
      icon: "🐛",
      tech: "TypeScript + DOM Recorder + Web APIs",
      link: "https://github.com/Ralphyy9yy/BugReplay",
      github: "https://github.com/Ralphyy9yy/BugReplay"
    },
    {
      id: "dontclickit",
      name: "DontClickIt — Interactive Web Challenge",
      description: "Gamified psychological web challenge with dynamic trigger traps, deceitful interactions, and high-score records.",
      status: "online",
      players: "Live Game",
      ping: 5,
      version: "v1.0.0",
      icon: "⚡",
      tech: "JavaScript + HTML5 + CSS Keyframe FX",
      link: "https://dontclickit-ten.vercel.app",
      github: "https://github.com/Ralphyy9yy/DontClickIt"
    },
    {
      id: "yplane-admin",
      name: "YPlane Admin — Flight & Aviation Management",
      description: "Aviation logistics and administrative dashboard managing flight schedules, fleet status, passenger bookings, and pilots.",
      status: "online",
      players: "Flight Ops",
      ping: 5,
      version: "Python 3.x",
      icon: "✈️",
      tech: "Python + Backend Architecture + Database",
      link: "https://github.com/Ralphyy9yy/yplane-admin",
      github: "https://github.com/Ralphyy9yy/yplane-admin"
    },
    {
      id: "acadex",
      name: "Acadex — Academic Management Portal",
      description: "Comprehensive institutional student information system for tracking curriculum courses, grade marks, and enrollment.",
      status: "online",
      players: "Campus Net",
      ping: 5,
      version: "Java 17+",
      icon: "🎓",
      tech: "Java + OOP Architecture + Data Models",
      link: "https://github.com/Ralphyy9yy/Acadex",
      github: "https://github.com/Ralphyy9yy/Acadex"
    },
    {
      id: "scamguard",
      name: "ScamGuard — Fraud Detection & Security",
      description: "Proactive mobile cybersecurity shield analyzing suspicious SMS messages, fraudulent phone calls, and phishing links.",
      status: "online",
      players: "Shielded",
      ping: 5,
      version: "v2.0",
      icon: "🛡️",
      tech: "Kotlin + Android + Threat Detection",
      link: "https://github.com/Ralphyy9yy/scamguard",
      github: "https://github.com/Ralphyy9yy/scamguard"
    },
    {
      id: "resort-booking",
      name: "Online Resort Booking Platform",
      description: "Full-featured hospitality reservation application with calendar availability checking, room tier bookings, and guest accounts.",
      status: "online",
      players: "Booking API",
      ping: 5,
      version: "v1.5",
      icon: "🏖️",
      tech: "JavaScript + Node.js + Express + EJS",
      link: "https://github.com/Ralphyy9yy/online-resort-booking",
      github: "https://github.com/Ralphyy9yy/online-resort-booking"
    },
    {
      id: "library-system",
      name: "Library Management System",
      description: "Digital library catalog software handling book inventory, member borrowing cards, return dates, and fine calculation.",
      status: "online",
      players: "Catalog",
      ping: 4,
      version: "Java Core",
      icon: "📖",
      tech: "Java + Data Structures + Swing GUI",
      link: "https://github.com/Ralphyy9yy/LibraryManagementSystem",
      github: "https://github.com/Ralphyy9yy/LibraryManagementSystem"
    },
    {
      id: "iris-classifier",
      name: "Iris Flower ML Classifier",
      description: "Supervised machine learning classification algorithm determining botanical flower species based on sepal and petal features.",
      status: "online",
      players: "ML Model",
      ping: 5,
      version: "ML Core",
      icon: "🌸",
      tech: "Java + Machine Learning + Statistical Analysis",
      link: "https://github.com/Ralphyy9yy/IrisFlowerClassifier",
      github: "https://github.com/Ralphyy9yy/IrisFlowerClassifier"
    },
    {
      id: "valentines-card",
      name: "Valentine's Interactive Card & Game",
      description: "Playful interactive web application with mischievous runaway buttons, custom sound effects, and celebratory confetti.",
      status: "online",
      players: "Live App",
      ping: 5,
      version: "React / JS",
      icon: "💌",
      tech: "JavaScript + CSS Animations + Confetti",
      link: "https://valentines-card-gamma.vercel.app",
      github: "https://github.com/Ralphyy9yy/valentines-card"
    }
  ] as ProjectServer[],

  certifications: [
    {
      id: "cert-aws",
      name: "AWS Certified Developer Associate",
      description: "Cloud Architecture, Serverless Microservices, and DynamoDB Deployments",
      gameMode: "AWS, Cloud",
      issuer: "Amazon Web Services",
      year: "2024",
      status: "Active",
      badge: "VERIFIED",
      bgGradient: "linear-gradient(135deg, #1e3a8a, #2563eb, #60a5fa)",
      link: "https://aws.amazon.com/certification/"
    },
    {
      id: "cert-nvidia",
      name: "Generative AI & Deep Learning",
      description: "Diffusion Models, Neural Networks, and GPU-Accelerated Pipelines",
      gameMode: "NVIDIA, Deep Learning",
      issuer: "NVIDIA Deep Learning Institute",
      year: "2024",
      status: "Active",
      badge: "HONORS",
      bgGradient: "linear-gradient(135deg, #14532d, #16a34a, #4ade80)",
      link: "https://learn.nvidia.com"
    },
    {
      id: "cert-meta",
      name: "Meta Front-End Developer Specialization",
      description: "Advanced React Paradigms, State Architecture, UI/UX, and Web Performance",
      gameMode: "Meta, Frontend",
      issuer: "Meta",
      year: "2023",
      status: "Active",
      badge: "HONORS",
      bgGradient: "linear-gradient(135deg, #312e81, #4f46e5, #818cf8)",
      link: "https://www.coursera.org"
    },
    {
      id: "cert-mongo",
      name: "MongoDB Certified Developer",
      description: "NoSQL Data Modeling, Aggregation Pipelines, and Scaled Indexing",
      gameMode: "MongoDB, Database",
      issuer: "MongoDB University",
      year: "2023",
      status: "Active",
      badge: "VERIFIED",
      bgGradient: "linear-gradient(135deg, #064e3b, #059669, #34d399)",
      link: "https://university.mongodb.com"
    }
  ] as CertificationItem[],

  resume: {
    name: "Ralph Giann Suquib",
    title: "Full Stack Developer",
    contact: "📧 giannralph@gmail.com | 🌐 linkedin.com/in/ralph-giann-suquib-887a79382 | 💻 github.com/Ralphyy9yy",
    lastUpdated: "December 2024",
    summary: "Dedicated Full Stack Software Engineer with expertise in building responsive, performant web applications, RESTful microservices, and interactive experiences. Proven track record in TypeScript, React, Next.js, Node.js, and cloud deployments.",
    skills: {
      frontend: "React, Next.js, TypeScript, JavaScript, Tailwind CSS, HTML5, CSS3, Redux, Zustand",
      backend: "Node.js, Express, Python, REST APIs, GraphQL, WebSockets, JWT Authentication",
      database: "PostgreSQL, MongoDB, Redis, Prisma ORM, SQL",
      tools: "Docker, Git, GitHub Actions, AWS, Vercel, Linux, Vite, Webpack, Figma"
    },
    experience: [
      {
        role: "Senior Full Stack Developer",
        company: "TechCorp Solutions",
        period: "2022 - Present",
        location: "Remote / Worldwide",
        bullets: [
          "Architected high-throughput web applications serving 100K+ monthly active users with 99.9% uptime.",
          "Engineered microservices in Node.js and TypeScript, reducing API response times by 40%.",
          "Mentored junior engineers and instituted automated CI/CD workflows and code review standards."
        ]
      },
      {
        role: "Full Stack Engineer",
        company: "Innovative Web Lab",
        period: "2020 - 2022",
        location: "Tech Hub",
        bullets: [
          "Developed responsive user interfaces with React and Tailwind CSS, improving user conversion rates by 25%.",
          "Implemented database schema migrations and indexing strategies in PostgreSQL, optimizing query times by 50%.",
          "Collaborated with product designers and backend teams to ship weekly feature releases on schedule."
        ]
      }
    ],
    education: {
      degree: "Bachelor of Science in Computer Science",
      institution: "University of Technology",
      period: "2016 - 2020"
    }
  }
};

