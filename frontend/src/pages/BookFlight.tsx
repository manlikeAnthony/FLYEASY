import RequestForm from "../components/RequestForm";

export default function BookFlight() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-[#1E4E8C] mb-6">
        Request a Flight
      </h2>
      <RequestForm />
    </div>
  );
}
