import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shadcn/select";

export default function SelectFilterCategory({ selectedType, onChange }) {
  return (
    <Select value={selectedType} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="category">Category</SelectItem>
        <SelectItem value="sub-category">Sub-category</SelectItem>
      </SelectContent>
    </Select>
  );
}
