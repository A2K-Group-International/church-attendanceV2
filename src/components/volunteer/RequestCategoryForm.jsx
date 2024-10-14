import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Label } from "../../shadcn/label";
import { Input } from "../../shadcn/input";
import { Button } from "../../shadcn/button";
import useUserData from "../../api/useUserData";
import { InsertRequestCategory } from "../../api/userService";

export default function RequestCategoryForm() {
  const { userData } = useUserData();
  // schema for the category form
  const categorySchema = z.object({
    category_name: z.string().min(1, "Category name is required"),
    category_description: z.string().optional(), // Optional description
  });

  // Initialize the form with the schema resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(categorySchema),
  });

  // Function to handle form submission
  const onSubmit = async (data) => {
    try {
      // Insert category with category_name, description, and requester_id
      const result = await InsertRequestCategory(
        data.category_name,
        userData.user_uuid,
        userData.user_name,
        userData.user_last_name,
        data.category_description, // Optional
      );

      // Check for errors from InsertRequestCategory function
      if (result?.error) {
        throw new Error(result.error);
      }
      alert('Request Successfully Sent!')
      reset(); // Reset the form after successful submission
    } catch (error) {
      console.error("Error inserting category:", error.message);
      alert('Category name already exists!') // Improve this in the future
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="category-form">
      <div className="text-start">
        <Label htmlFor="category_name">Category Name</Label>
        <Input id="category_name" type="text" {...register("category_name")} />
        {errors.category_name && (
          <p className="text-red-500">{errors.category_name.message}</p>
        )}
        <Label htmlFor="category_description">Description</Label>
        <Input
          id="category_description"
          type="text"
          placeholder="Optional"
          {...register("category_description")}
        />
      </div>
      <div className="mt-5 flex justify-end">
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
}
