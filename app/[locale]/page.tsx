import { Suspense } from "react";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  try {
    // Only load the essential components that work
    const StatsSection = await import("./components/sections/StatsSection");
    const Projects = await import("./components/sections/Projects");

    return (
      <div className="min-h-screen">
        {/* Hero Section - Simplified */}
        <section className="relative bg-gradient-to-br from-primary/10 to-primary/5 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Hope Bridge</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Building stronger communities through compassion and action
            </p>
          </div>
        </section>

        <Suspense fallback={<div className="text-center py-10">Loading Stats...</div>}>
          <StatsSection.default params={{ locale }} />
        </Suspense>
        
        <Suspense fallback={<div className="text-center py-10">Loading Projects...</div>}>
          <Projects.default params={{ locale }} />
        </Suspense>
        
        {/* Placeholder sections for other components */}
        <section className="py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto px-4">
            We are dedicated to making a positive impact in communities through various charitable initiatives and programs.
          </p>
        </section>
        
        <section className="py-16 bg-muted/50">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Get Involved</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto px-4 mb-8">
              Join us in making a difference. Every contribution helps transform lives.
            </p>
            <div className="space-x-4">
              <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
                Donate Now
              </button>
              <button className="border border-primary text-primary px-6 py-3 rounded-lg hover:bg-primary/10 transition-colors">
                Volunteer
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  } catch (error: any) {
    console.error('❌ Error loading HomePage:', error.message);
    
    // Return a minimal fallback page
    return (
      <div className="min-h-screen">
        <div className="text-center py-20">
          <h1 className="text-4xl font-bold mb-4">Hope Bridge</h1>
          <p className="text-muted-foreground">Welcome to our community platform.</p>
          <p className="text-sm text-muted-foreground mt-2">Some sections are temporarily unavailable.</p>
        </div>
      </div>
    );
  }
}
