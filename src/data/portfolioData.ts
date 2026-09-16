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
      id: "velora",
      name: "Velora Cloud Platform",
      description: "A collaborative workspace and team workflow engine with real-time sync.",
      status: "online",
      players: "1.2k ⭐",
      ping: 5,
      version: "React 19.0",
      icon: "☁️",
      tech: "React + Node.js + Postgres",
      link: "https://github.com/Ralphyy9yy",
      github: "https://github.com/Ralphyy9yy"
    },
    {
      id: "startupops",
      name: "StartupOps Analytics Dashboard",
      description: "Real-time financial analytics, metrics tracking, and runway forecasting engine.",
      status: "online",
      players: "850 ⭐",
      ping: 5,
      version: "v1.8.2",
      icon: "📊",
      tech: "Next.js + TypeScript + Chart.js",
      link: "https://github.com/Ralphyy9yy",
      github: "https://github.com/Ralphyy9yy"
    },
    {
      id: "aichatbot",
      name: "Cognitive AI Assistant Core",
      description: "Autonomous conversational AI platform powered by RAG and streaming responses.",
      status: "online",
      players: "3.4k ⭐",
      ping: 5,
      version: "v3.1.0",
      icon: "🤖",
      tech: "Python + FastAPI + VectorDB",
      link: "https://github.com/Ralphyy9yy",
      github: "https://github.com/Ralphyy9yy"
    },
    {
      id: "livecanvas",
      name: "LiveCanvas 3D WebGL Studio",
      description: "An interactive creative coding shader playground and 3D simulation canvas.",
      status: "online",
      players: "520 ⭐",
      ping: 5,
      version: "Three.js 0.173",
      icon: "🎨",
      tech: "Three.js + GLSL + Web Audio",
      link: "https://github.com/Ralphyy9yy",
      github: "https://github.com/Ralphyy9yy"
    },
    {
      id: "snap-ar",
      name: "SnapAR Vision Filter Suite",
      description: "Real-time webcam computer vision augmented reality filter engine.",
      status: "online",
      players: "640 ⭐",
      ping: 4,
      version: "v1.0.4",
      icon: "👓",
      tech: "Python + OpenCV + MediaPipe",
      link: "https://github.com/Ralphyy9yy",
      github: "https://github.com/Ralphyy9yy"
    },
    {
      id: "craftfolio",
      name: "RalphCraft Portfolio",
      description: "This Minecraft Java-themed interactive developer web portfolio.",
      status: "online",
      players: "You're here!",
      ping: 5,
      version: "v1.20.4",
      icon: "⛏️",
      tech: "React + Vite + Tailwind",
      link: "https://github.com/Ralphyy9yy",
      github: "https://github.com/Ralphyy9yy"
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

