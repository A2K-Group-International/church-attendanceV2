import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Label } from "../../shadcn/label";
import { Input } from "../../shadcn/input";
import { Button } from "../../shadcn/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shadcn/select";
import useUserData from "../../api/useUserData";
import { InsertRequestSubCategory } from "../../api/userService";
import { useEffect, useState } from "react";
import { Textarea } from "../../shadcn/textarea";

export default function RequestSubCategoryForm({ fetchedCategories }) {
  const [dataCategories, setDataCategories] = useState([]);
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const { userData } = useUserData();

  // schema for the category form
  const sub_categorySchema = z.object({
    sub_category_name: z.string().min(1, "Sub Category name is required"),
    category_id: z.number().min(1, "Category is required"),
    sub_category_description: z.string().optional(), // Optional description
  });

  // Initialize the form with the schema resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(sub_categorySchema),
  });

  // Function to handle form submission
  const onSubmit = async (data) => {
    try {
      // Insert category with sub_category_name, description, and requester_id
      const result = await InsertRequestSubCategory(
        data.sub_category_name,
        data.category_id,
        userData.user_uuid,
        userData.user_name,
        userData.user_last_name,
        data.sub_category_description,
      );

      // Check for errors from InsertRequestSubCategory function
      if (result?.error) {
        throw new Error(result.error);
      }
      alert("Request Successfully Sent!");
      reset(); // Reset the form after successful submission
    } catch (error) {
      console.error("Error inserting sub category:", error.message);
      alert("Sub Category name already exists!");
    }
  };

  useEffect(() => {
    if (fetchedCategories) {
      setDataCategories(fetchedCategories);
    }
  }, [fetchedCategories]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="category-form">
      <div className="text-start">
        <Label htmlFor="category_name">Select Category</Label>
        <Select
          onValueChange={(value) => {
            const selectedCategory = dataCategories.find(
              (item) => item.category_id === value,
            );
            if (selectedCategory) {
              setSelectedCategoryName(selectedCategory.category_name); // Set the selected category name
              setValue("category_id", value); // Set the category_id in the form
            }
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select">
              {selectedCategoryName || "Select Category"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {dataCategories.map((item, index) => (
              <SelectItem key={index} value={item.category_id}>
                {item.category_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {errors.category_id && (
          <p className="text-red-500">{errors.category_id.message}</p>
        )}

        <Label htmlFor="sub_category_name">Sub Category Name</Label>
        <Input
          id="sub_category_name"
          type="text"
          {...register("sub_category_name")}
        />
        {errors.sub_category_name && (
          <p className="text-red-500">{errors.sub_category_name.message}</p>
        )}

        <Label htmlFor="description">Description</Label>
        <Textarea
          id="sub_category_description"
          placeholder="Optional"
          type="text"
          {...register("sub_category_description")}
        />
        {errors.sub_category_description && (
          <p className="text-red-500">
            {errors.sub_category_description.message}
          </p>
        )}
      </div>

      <div className="mt-5 flex justify-end">
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
}
