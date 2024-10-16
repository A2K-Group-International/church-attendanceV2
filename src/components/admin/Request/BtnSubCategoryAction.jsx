import { ApproveSubCategory, RejectSubCategory } from "../../../api/userService";
import { Button } from "../../../shadcn/button";

export default function BtnSubCategoryAction({ id, onSuccess }) {
  const handleApproveSubCategory = async () => {
    try {
      const data = await ApproveSubCategory(id);
      if (data) {
        onSuccess(id);
      }
    } catch (error) {
      console.error("Error approving sub category", error);
    }
  };

  const handleRejectSubCategory = async () => {
    try {
      const data = await RejectSubCategory(id);
      if (data) {
        onSuccess(id);
        console.log("Rejected")
      }
    } catch (error) {
      console.error("Error updating reject status:", error);
    }
  };

  return (
    <div className="flex gap-x-2">
      <Button variant="outline" onClick={handleApproveSubCategory}>
        Approve
      </Button>
      <Button variant="outline" onClick={handleRejectSubCategory}>Reject</Button>
    </div>
  );
}
