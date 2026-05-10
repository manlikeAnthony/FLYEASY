import { Plane } from "lucide-react";

export default function Hero() {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-3">
        <Plane className="text-white w-7 h-7" />
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">
            Book Flights the Easy Way
          </h1>
          <p className="text-sm md:text-base text-white/90">
            Affordable. Reliable. Made for Nigerians.
          </p>
        </div>
      </div>
    </div>
  );
}
