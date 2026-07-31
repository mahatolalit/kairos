import { Link } from "react-router-dom";
import { MessageSquare, Shield, Sparkles, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-base-200 overflow-hidden relative">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-secondary rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-accent rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000"></div>

      <div className="container mx-auto px-4 lg:px-24 pt-32 pb-20 relative z-10">
        <div className="flex flex-col lg:flex-row-reverse items-center justify-between gap-20">

          {/* Left Text Section */}
          <div className="lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight">
              Connect in <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                Real-Time
              </span>
            </h1>

            <p className="text-lg text-base-content/70 max-w-lg">
              Kairos brings your conversations to life with lightning-fast messaging, secure connections, and beautiful themes designed just for you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/signup"
                className="btn btn-primary btn-lg rounded-full shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-1"
              >
                Try Kairos Free
              </Link>
              <Link
                to="/login"
                className="btn btn-outline btn-lg rounded-full"
              >
                Login
              </Link>
            </div>

            {/* Feature Badges */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 pt-8">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="size-5 text-primary" />
                </div>
                <span className="font-medium text-sm">Lightning Fast</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Shield className="size-5 text-secondary" />
                </div>
                <span className="font-medium text-sm">Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <MessageSquare className="size-5 text-accent" />
                </div>
                <span className="font-medium text-sm">Real-time</span>
              </div>
            </div>
          </div>

          {/* Right Image Section */}
          <div className="lg:w-1/2 relative w-full max-w-lg">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary/20 bg-base-100/50 backdrop-blur-xl border border-base-300 p-2 transform hover:scale-[1.02] transition-transform duration-500">
              <img
                src="/hero.png"
                alt="Kairos App Concept"
                className="w-full h-auto rounded-2xl object-cover"
              />
            </div>

            {/* Floating glassmorphism cards */}
            <div className="absolute -left-6 top-1/4 p-4 rounded-2xl bg-base-100/70 backdrop-blur-md border border-white/10 shadow-xl hidden md:flex items-center gap-3 animate-bounce shadow-primary/10" style={{ animationDuration: '3s' }}>
              <div className="size-10 rounded-full bg-gradient-to-br from-primary to-secondary p-[2px]">
                <div className="w-full h-full rounded-full bg-base-100"></div>
              </div>
              <div className="space-y-1">
                <div className="h-2 w-16 bg-base-content/20 rounded-full"></div>
                <div className="h-2 w-12 bg-base-content/20 rounded-full"></div>
              </div>
            </div>

            <div className="absolute -right-6 bottom-1/4 p-4 rounded-2xl bg-base-100/70 backdrop-blur-md border border-white/10 shadow-xl hidden md:flex items-center gap-3 animate-bounce shadow-secondary/10" style={{ animationDuration: '4s', animationDelay: '1s' }}>
              <MessageSquare className="size-6 text-primary" />
              <div className="text-sm font-semibold">New Message!</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
