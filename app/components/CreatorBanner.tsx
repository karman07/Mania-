import Image from "next/image";
import Link from "next/link";

export default function CreatorBanner() {
  return (
    <section className="max-w-7xl mx-auto px-6 pb-20">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl min-h-[400px] flex">
        {/* Glow */}
        <div className="absolute right-20 top-10 w-[300px] h-[300px] bg-purple-500/20 blur-[120px]" />

        <div className="grid lg:grid-cols-[55%_45%] w-full h-full min-h-[400px]">
          {/* Content */}
          <div className="flex flex-col justify-center p-10 lg:p-16 z-10">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Creators,
              <br />
              <span className="text-purple-400">this is your stage.</span>
            </h2>

            <p className="mt-6 text-gray-400 max-w-lg text-lg">
              Bring your imagination to life and turn your ideas into manga.
              Build an audience and share your creativity with the world.
            </p>

            <Link
              href="/creator/onboard"
              className="mt-8 w-fit px-8 py-4 rounded-full bg-purple-500 hover:bg-purple-600 transition font-medium"
            >
              Start Your Story
            </Link>
          </div>

          {/* Image — flush right */}
          <div className="absolute inset-y-0 right-0 w-full lg:w-[55%] hidden lg:block z-0">
            <Image
              src="/creator.jpg"
              alt="Creator"
              fill
              className="object-cover object-center"
            />
            {/* Left blend */}
            <div className="absolute inset-y-0 left-0 w-64 bg-gradient-to-r from-[#0f1018] via-[#0f1018]/90 to-transparent z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
