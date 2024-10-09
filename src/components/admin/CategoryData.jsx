import PropTypes from "prop-types";
import Table from "../Table";
import AlertCategory from "./AlertCagory";

// Headers for table
const headers = ["#", "Category Name"];

export default function CategoryData({ categories }) {
  const rows = categories.map((item, index) => [
    index + 1,
    <AlertCategory
      key={index}
      categoryName={item.category_name}
      subCategory={item.sub_category}
    />,
  ]);
  return <Table headers={headers} rows={rows} className="border-b-2 border-gray-100 h-96 max-w-full" />;
}

// Define PropTypes to enforce type checking
CategoryData.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      category_name: PropTypes.string.isRequired, // Ensure category_name is a string
    }),
  ).isRequired,
};
