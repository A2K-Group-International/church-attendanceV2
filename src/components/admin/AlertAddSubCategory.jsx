import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../shadcn/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../shadcn/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../shadcn/alert-dialog";
import { Button } from "../../shadcn/button";
import PropTypes from "prop-types";
import { Icon } from "@iconify/react";
import { fetchSubCategory } from "../../api/userService";
import { useState } from "react";

export default function AlertAddSubCategory({ categoryName, categoryId }) {
  const [subCategoryList, setSubCategoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const addSubCategory = () => {}; // placeholder for adding subcategory

  const fetchsubCategoryList = async () => {
    try {
      const data = await fetchSubCategory(categoryId);
      setSubCategoryList(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchSubCategory = () => {
    fetchsubCategoryList();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={handleFetchSubCategory}>
          {categoryName}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{categoryName}</DialogTitle>
          <DialogDescription className="sr-only">
            List of Sub Categories
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col">
          {subCategoryList.length > 0 ? (
            subCategoryList.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span>{`${index + 1}. ${item.sub_category_name || item}`}</span>
                <DropdownMenu key={item.id}>
                  <DropdownMenuTrigger asChild>
                    <button aria-label="Options">
                      <Icon icon="tabler:dots" width="1.5em" height="1.5em" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger>Edit</AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Edit Sub Category
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {/* Add form or logic to edit subcategory here */}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <AlertDialog>
                        <AlertDialogTrigger>Delete</AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Sub Category
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this subcategory?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          ) : (
            <span>No Sub Category available</span>
          )}
        </div>
        <Dialog>
          <DialogTrigger asChild className="justify-self-start">
            <Button>Add Sub Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add new Sub Category</DialogTitle>
              <DialogDescription className="sr-only">
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}

AlertAddSubCategory.propTypes = {
  categoryName: PropTypes.string.isRequired,
};
