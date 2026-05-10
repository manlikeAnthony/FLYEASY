import Input from "./Input";
import Button from "./Button";

export default function SearchForm() {
  return (
    <form className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
      <Input name="from" placeholder="From" />
      <Input name="to" placeholder="To" />
      <Input name="date" type="date" />
      <div>
        <Button variant="primary" className="w-full">
          Search
        </Button>
      </div>
    </form>
  );
}
