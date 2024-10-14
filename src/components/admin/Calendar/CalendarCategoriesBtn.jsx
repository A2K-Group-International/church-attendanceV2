import { Input } from "../../../shadcn/input";
import { Button } from "../../../shadcn/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shadcn/select";

export default function CalendarCategoriesBtn() {
  return (
    <div className="mb-2 flex gap-x-2">
      <div>
        <Input type="text" placeholder="Search" />
      </div>
      <Select>
        <SelectTrigger className="w-[180px] bg-black text-white">
          <SelectValue placeholder="Spiritual Services" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="mass">Confession</SelectItem>
          <SelectItem value="dark">Divine Office</SelectItem>
          <SelectItem value="system">Exposition</SelectItem>
          <SelectItem value="system">Mass</SelectItem>
          <SelectItem value="system">Mass (Latin)</SelectItem>
          <SelectItem value="system">Mass (Sung)</SelectItem>
          <SelectItem value="system">Seasonal</SelectItem>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger className="w-[180px] bg-black text-white">
          <SelectValue placeholder="Community Events" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="mass">Social</SelectItem>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger className="w-[180px] bg-black text-white">
          <SelectValue placeholder="Organisers" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="mass">Volunteer</SelectItem>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger className="w-[180px] bg-black text-white">
          <SelectValue placeholder="Facility" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="mass">Main Hall</SelectItem>
          <SelectItem value="mass">Church Hall</SelectItem>
          <SelectItem value="mass">Church Garden</SelectItem>
          <SelectItem value="mass">Chapel</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
