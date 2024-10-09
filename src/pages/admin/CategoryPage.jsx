import { useEffect, useState } from "react";
import RequestPage from "./RequestPage";
import { fetchApprovedCategory } from "../../api/userService";
import Spinner from "../../components/Spinner";
import CategoryData from "../../components/admin/CategoryData";
import AddNewCategory from "../../components/admin/AddNewCategory";
import RequestCategory from "./RequestCategory";

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const data = await fetchApprovedCategory();
        setCategories(data);
        console.log(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    getCategories();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <p>{error}</p>;

  return (
    <RequestPage>
      <AddNewCategory />
      <div className="flex flex-col gap-y-2">
        <CategoryData categories={categories} />
        <RequestCategory />
      </div>
    </RequestPage>
  );
}
