import { useEffect, useState } from "react";
import Table from "../../Table";
import BtnRequestAction from "./BtnRequestAction";
import SelectFilterCategory from "./SelectFilterCategory";
import { fetchNotApprovedSubCategory } from "../../../api/userService";
import BtnSubCategoryAction from "./BtnSubCategoryAction";
const headersCategory = [
  "Requester",
  "Item",
  "Description",
  "Status",
  "Action",
];

const headersSubcategory = [
  "Requester",
  "Item",
  "From Category",
  "Description",
  "Status",
  "Action",
];

export default function RequestCategory({ categories }) {
  const [categoryList, setCategoryList] = useState(categories);
  const [subCategoryList, setSubCategoryList] = useState([]);
  const [filterType, setFilterType] = useState("category");

  const fetchSubCategories = async () => {
    try {
      const data = await fetchNotApprovedSubCategory();
      setSubCategoryList(data);
    } catch (error) {
      console.error(error.message);
    }
  };
  useEffect(() => {
    fetchSubCategories();
  }, []);

  //Handling success approved category
  const handleRequestSuccess = (category_id) => {
    setCategoryList((prevCategories) =>
      prevCategories.filter((item) => item.category_id !== category_id),
    );
  };

  //Handling success approved sub category
  const handleRequestSubCategorySuccess = (sub_category_id) => {
    setSubCategoryList((prevSubCategories) =>
      prevSubCategories.filter((item) => item.sub_category_id !== sub_category_id),
    );
  };

  const rowsCategory = categoryList
    .filter((item) => !item.is_approved && !item.is_rejected) // filter where categories is is not approved
    .map((item, index) => [
      `${item.requester_first_name} ${item.requester_last_name}`,
      item.category_name,
      item.category_description,
      item.request_status,
      <BtnRequestAction
        key={index}
        id={item.category_id}
        onSuccess={handleRequestSuccess}
      />,
    ]);

  const rowsSubCategory = subCategoryList.map((item, index) => {
    const matchingCategory = categoryList.find(
      (category) => category.category_id === item.category_id,
    );
    const fromCategoryName = matchingCategory && matchingCategory.category_name;
    console.log(fromCategoryName);
    return [
      `${item.requester_first_name} ${item.requester_last_name}`,
      item.sub_category_name,
      fromCategoryName,
      item.sub_category_description,
      item.sub_category_status,
      <BtnSubCategoryAction
        key={index}
        id={item.sub_category_id}
        onSuccess={handleRequestSubCategorySuccess}
      />,
    ];
  });

  return (
    // Adjust the height
    <div className="h-auto">
      <div className="mb-2 flex items-center gap-x-5">
        <h2>
          <strong>List of Requests</strong>
        </h2>
        <SelectFilterCategory
          selectedType={filterType}
          onChange={setFilterType}
        />
      </div>
      <Table
        headers={
          filterType === "category" ? headersCategory : headersSubcategory
        }
        rows={filterType === "category" ? rowsCategory : rowsSubCategory}
        className="no-scrollbar !block h-52 !max-w-full rounded-xl border border-gray-100"
      />
    </div>
  );
}
