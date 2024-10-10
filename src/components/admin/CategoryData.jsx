import PropTypes from "prop-types";
import Table from "../Table";
import AlertAddSubCategory from "./AlertAddSubCategory";
import BtnDeleteCategory from "./BtnDeleteCategory";

// Headers for table
const headers = ["#", "Category Name"];

export default function CategoryData({ categories }) {
  const rows = categories
    .filter((item) => item.is_approved) // Filter items where is_approved is true
    .map((item, index) => [
      index + 1,
      <AlertAddSubCategory
        key={index}
        categoryName={item.category_name}
        subCategory={item.sub_category}
      />,
      <BtnDeleteCategory key={index} id={item.id} />,
    ]);
  return (
    <Table
      headers={headers}
      rows={rows}
      className="no-scrollbar mt-2 !block max-h-96 min-h-96 !max-w-full rounded-xl border border-gray-100"
    />
  );
}

// Define PropTypes to enforce type checking
CategoryData.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      category_name: PropTypes.string.isRequired, // Ensure category_name is a string
    }),
  ).isRequired,
};
