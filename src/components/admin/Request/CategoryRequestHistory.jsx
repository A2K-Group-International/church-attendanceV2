import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../shadcn/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shadcn/select";
import { Button } from "../../../shadcn/button";
import { Icon } from "@iconify/react";
import Table from "../../../components/Table";
import { fetchCategory, fetchAllSubCategory } from "../../../api/userService";

const headersCategory = ["Date", "Requester Name", "Item", "Status"];
const headersSubCategory = ["Date", "Requester Name", "Item", "Status"];

export default function CategoryRequestHistory() {
  const [filterType, setFilterType] = useState("category");
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const data = await fetchCategory();
      setCategories(data);
    } catch (error) {
      console.error(error.message);
    }
  };

  const fetchSubCategories = async () => {
    try {
      const data = await fetchAllSubCategory();
      setSubCategories(data);
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, []);

  const rowsCategory = categories.map((item) => [
    "-",
    `${item.requester_first_name} ${item.requester_last_name}`,
    item.category_name,
    item.request_status,
  ]);

  const rowsSubCategory = subCategories.map((item) => [
    "-",
    `${item.requester_first_name} ${item.requester_last_name}`,
    item.sub_category_name,
    item.sub_category_status,
  ]);
  console.log(rowsSubCategory);

  return (
    <Dialog>
      <DialogTrigger asChild className="cursor-pointer">
        <Button variant="link">
          <Icon icon="mdi:clipboard-text-history" width="2em" height="2em" />
        </Button>
      </DialogTrigger>
      <DialogContent className="no-scrollbar max-h-[30rem] max-w-3xl overflow-scroll">
        <DialogHeader>
          <DialogTitle>Category Request History</DialogTitle>
          <DialogDescription className="sr-only">
            Category Request History
          </DialogDescription>
          <>
            <Select
              value={filterType}
              onValueChange={(value) => setFilterType(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="sub-category">Sub-category</SelectItem>
              </SelectContent>
            </Select>
          </>
          <Table
            headers={
              filterType === "category" ? headersCategory : headersSubCategory
            }
            rows={filterType === "category" ? rowsCategory : rowsSubCategory}
          />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
