import { useEffect, useState } from "react";
import RequestPage from "./RequestPage";
import { fetchCategory, fetchSubCategory } from "../../api/userService";
import Spinner from "../../components/Spinner";
import CategoryData from "../../components/admin/CategoryData";
import AddNewCategory from "../../components/admin/AddNewCategory";
import RequestCategory from "../../components/admin/RequestCategory";
import CategoryRequestHistory from "../../components/admin/CategoryRequestHistory";
import supabase from "../../api/supabase";

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      const data = await fetchCategory();
      setCategories(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();

    //Real time update from supabase
    const subscription = supabase
      .channel("realtime:category_list") // Creating channel for database
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "category_list" }, // Listen for changes in the table
        () => {
          fetchCategories(); // Refetch categories on any change in supabase
        },
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(subscription); // Correct method to remove subscription
    };
  }, []);

  if (loading) return <Spinner />;
  if (error) return <p>{error}</p>;

  return (
    <RequestPage>
      <div className="flex items-center gap-x-5">
        <AddNewCategory />
        <CategoryRequestHistory />
      </div>
      <div className="flex flex-col gap-y-2">
        <CategoryData categories={categories} />
        <RequestCategory categories={categories} />
      </div>
    </RequestPage>
  );
}
