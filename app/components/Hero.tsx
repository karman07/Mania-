import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative overflow-hidden w-full min-h-[650px] flex items-center">
      {/* Purple Glow */}
      <div className="absolute left-[-150px] top-20 w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[150px]" />

      <div className="max-w-7xl w-full mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-[45%_55%] items-center gap-8">

          {/* Left side */}
          <div className="z-10">
            <p className="mb-5 text-purple-400 tracking-[0.25em] uppercase text-sm">
              ✦ Write. Publish. Inspire.
            </p>

            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05]">
              Your story.
              <br />
              Their <span className="text-purple-400">obsession.</span>
            </h1>

            <p className="mt-8 max-w-xl text-lg text-gray-400 leading-relaxed">
              RaManga is the ultimate manga platform for creators and readers.
              Write your own stories, publish them to the world, and discover
              amazing manga from passionate creators.
            </p>

            <div className="flex flex-wrap gap-4 mt-10">
              <a
                href="/creator/onboard"
                className="px-8 py-4 rounded-full bg-purple-500 hover:bg-purple-600 transition-all font-medium"
              >
                Start Writing
              </a>
              <a
                href="/browse"
                className="px-8 py-4 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all font-medium"
              >
                Start Reading
              </a>
            </div>
          </div>

          {/* Right side — full-bleed hero image */}
          <div className="relative lg:absolute lg:top-0 lg:right-0 h-[450px] sm:h-[550px] lg:h-full w-full lg:w-[50vw] overflow-hidden">
            <Image
              src="/hero-character.jpg"
              alt="Hero"
              fill
              priority
              className="object-cover object-center"
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/20" />

            {/* Left Blend */}
            <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-[#07080f] via-[#07080f]/70 to-transparent z-10" />

            {/* Bottom Fade */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#07080f] to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
