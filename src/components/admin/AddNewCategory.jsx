import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../shadcn/dialog";
import { Button } from "../../shadcn/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import supabase from "../../api/supabase";
import { Label } from "../../shadcn/label";
import { Input } from "../../shadcn/input";

const categorySchema = z.object({
  categoryName: z.string().min(1, "Category name is required"), // Minimum one character
});

export default function AddNewCategory() {
  const [open, setOpen] = useState(false); // For opening Dialog
  const [newSubCategory, setNewSubCategory] = useState([]); // For adding input in sub category

  // Setup the form with React Hook Form and Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(categorySchema),
  });

  // Add more Sub Category
  const handleAddSubCategory = () => {
    setNewSubCategory([...newSubCategory, ""]);
  };

  // Remove Sub Category
  const handleRemoveSubCategory = (index) => {
    if (newSubCategory.length > 1) {
      const updatedNewSubCategory = newSubCategory.filter(
        (_, i) => i !== index,
      );
      setNewSubCategory(updatedNewSubCategory); // Remove the specific sub category input field
    }
  };
  const handleChangeCategory = (index, value) => {
    const updatedNewSubCategory = [...newSubCategory];
    updatedNewSubCategory[index] = value;
    setNewSubCategory(updatedNewSubCategory);
  };

  // Function to handle form submission
  const onSubmit = async (data) => {
    const { categoryName } = data;
    const subCategoryData = newSubCategory.length > 0 ? newSubCategory : null;

    // Insert the new category into the Supabase database
    const { error } = await supabase
      .from("category_list")
      .insert([
        {
          category_name: categoryName,
          sub_category: subCategoryData,
          is_approved: true,
        },
      ]);

    if (error) {
      console.error("Error inserting category:", error.message);
      // Handle error accordingly (e.g., show a notification)
    } else {
      alert("Category added successfully:", categoryName);
      reset();
      setNewSubCategory([]);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" onClick={() => setOpen(true)}>Add New Category</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
          <DialogDescription>
            Enter the category name you want to add.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-2">
            <Label htmlFor="categoryName">Category Name</Label>
            <Input
              id="categoryName"
              {...register("categoryName")}
              className={errors.categoryName ? "border-red-500" : ""}
            />
            {errors.categoryName && (
              <p className="text-red-500">{errors.categoryName.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="time">
              Sub Category <span className="text-gray-500">(Optional)</span>
            </Label>
            {newSubCategory.map((newSub, index) => (
              <div
                key={index}
                className="mb-2 flex items-center space-x-2 space-y-2"
              >
                <Input
                  type="text"
                  value={newSub}
                  onChange={(e) => handleChangeCategory(index, e.target.value)}
                  className="flex-grow"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleRemoveSubCategory(index)}
                  className="shrink-0"
                >
                  Remove
                </Button>
              </div>
            ))}
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleAddSubCategory}
                className="w-24"
              >
                Add
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
