export default function BackgroundEffects() {
  return (
    <>
      <div className="fixed top-0 left-[-200px] w-[500px] h-[500px] bg-purple-500/10 blur-[180px] pointer-events-none" />
      <div className="fixed bottom-0 right-[-200px] w-[500px] h-[500px] bg-violet-500/10 blur-[180px] pointer-events-none" />
    </>
  );
}
