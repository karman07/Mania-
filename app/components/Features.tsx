import { PenSquare, Upload, Heart, Trophy } from "lucide-react";

const features = [
  { icon: PenSquare, title: "Write Your Manga",  description: "Create unlimited stories and chapters." },
  { icon: Upload,    title: "Publish & Share",    description: "Reach readers around the world." },
  { icon: Heart,     title: "Build Community",    description: "Connect with fellow creators." },
  { icon: Trophy,    title: "Join Contests",      description: "Win exciting rewards." },
];

export default function Features() {
  return (
    <section className="max-w-7xl mx-auto px-6 -mt-6 relative z-20">
      <div className="grid md:grid-cols-4 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="p-6 border-r border-white/10 last:border-r-0 hover:bg-white/[0.04] transition"
            >
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="text-sm text-gray-400 mt-2">{feature.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
