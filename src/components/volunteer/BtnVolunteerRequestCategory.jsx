import { useState } from "react";
import { Button } from "../../shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../shadcn/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shadcn/select";
import RequestCategoryForm from "./RequestCategoryForm";
import RequestSubCategoryForm from "./RequestSubCategoryForm";
import { Icon } from "@iconify/react";
import { fetchCategory } from "../../api/userService";

export default function BtnVolunteerRequestCategory() {
  const [selectedForm, setSelectedForm] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleSelectChange = (value) => {
    setSelectedForm(value);
  };

  const fetchCategories = async () => {
    try {
      const data = await fetchCategory();
      setCategories(data);
      console.log(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button onClick={fetchCategories}>Request</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="flex justify-between gap-x-2">
            <DialogTitle>Request</DialogTitle>
            <div className="mr-10">
              <Icon icon="material-symbols:history" width="2em" height="2em" />
            </div>
          </div>
          <DialogDescription className="sr-only">
            Form for requesting a category.
          </DialogDescription>
          <h2 className="text-start">Which one would you like to request?</h2>
          <Select onValueChange={handleSelectChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Choose" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="category">Category</SelectItem>
              <SelectItem value="subcategory">Sub Category</SelectItem>
            </SelectContent>
          </Select>
          <div>
            {selectedForm === "category" && <RequestCategoryForm />}
            {selectedForm === "subcategory" && <RequestSubCategoryForm fetchedCategories={categories}/>}
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
