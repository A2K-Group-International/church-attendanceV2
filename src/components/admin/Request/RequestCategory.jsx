import { useState } from "react";
import Table from "../../Table";
import BtnRequestAction from "./BtnRequestAction";

const headers = [
  "Requester",
  "Category/Sub-category",
  "Description",
  "Status",
  "Action",
];

export default function RequestCategory({ categories }) {
  const [categoryList, setCategoryList] = useState(categories);

  //Handling success approved
  const handleRequestSuccess = (category_id) => {
    setCategoryList((prevCategories) =>
      prevCategories.filter((item) => item.category_id !== category_id),
    );
  };

  const rows = categoryList
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

  return (
    // Adjust the height
    <div className="h-auto">
      <h2>
        <strong>List of Requests</strong>
      </h2>
      <Table
        headers={headers}
        rows={rows}
        className="no-scrollbar !block h-52 !max-w-full rounded-xl border border-gray-100"
      />
    </div>
  );
}
