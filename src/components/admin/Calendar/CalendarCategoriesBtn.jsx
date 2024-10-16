import { useState, useEffect } from "react";
import { Input } from "../../../shadcn/input";
import { Button } from "../../../shadcn/button";
import { fetchCategory, fetchAllSubCategory } from "../../../api/userService";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../shadcn/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../shadcn/popover";
import { Check, ChevronsUpDown } from "lucide-react";

export default function CalendarCategoriesBtn({ onSelectCategory }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [categoryData, setCategoryData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      const category = await fetchCategory();
      setCategoryData(category);
    } catch (error) {
      console.error("Error fetching categories:", error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectCategory = (categoryId) => {
    // Check if the selected category is already the current value
    if (value === categoryId) {
      // Deselecting the current category
      setValue(""); // Set value to an empty string to indicate no selection
      onSelectCategory(""); // Optionally notify the parent that no category is selected
    } else {
      // Otherwise, select the new category
      const selectedCategory = categoryData.find(
        (cat) => cat.category_id === categoryId
      );

      if (selectedCategory) {
        setValue(categoryId); // Set the value to category_id
        onSelectCategory(selectedCategory.category_name); // Pass the selected category name to the parent
      } else {
        console.log("Category not found");
      }
    }
  }

  // Filter categories based on search term
  const filteredCategories = categoryData.filter((category) =>
    category.category_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="mb-2 flex gap-x-2">
      <div>
        <Input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // Update search term
        />
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            {value
              ? categoryData.find((category) => category.category_id === value)
                  ?.category_name
              : "Select category..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} // Search for categories
            />
            <CommandList>
              {filteredCategories.length > 0 ? (
                <CommandGroup>
                  {filteredCategories.map((category) => (
                    <CommandItem
                      key={category.category_id}
                      onSelect={() =>
                        handleSelectCategory(category.category_id)
                      }
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          value === category.category_id
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                      />
                      {category.category_name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : (
                <CommandEmpty>No categories found.</CommandEmpty>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
