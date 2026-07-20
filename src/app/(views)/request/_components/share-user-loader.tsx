export default function ShareUserLoader({ total }: { total: number }) {
  return (
    <div className="flex gap-1 flex-col">
      {Array.from({ length: total }).map((_, index) => (
        <div className="skeleton h-22 w-full" key={index}></div>
      ))}
    </div>
  );
}
