import { Button } from "../../../shadcn/button";
import {
  RequestCategory,
  RejectRequestCategory,
} from "../../../api/userService";

export default function BtnRequestAction({ id, onSuccess }) {
  const handleApprove = async () => {
    try {
      const data = await RequestCategory(id);

      if (data) {
        onSuccess(id);
      }
    } catch (error) {
      console.error("Error updating approval status:", error);
    }
  };

  const handleReject = async () => {
    try {
      const data = await RejectRequestCategory(id);
      if (data) {
        onSuccess(id);
      }
    } catch (error) {
      console.error("Error updating reject status:", error);
    }
  };
  return (
    <div className="flex gap-x-2">
      <Button variant="outline" onClick={handleApprove}>
        Approve
      </Button>
      <Button variant="outline" onClick={handleReject}>
        Reject
      </Button>
    </div>
  );
}
