import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../shadcn/dialog";
import { Button } from "../../../shadcn/button";
import { Icon } from "@iconify/react";

export default function CategoryRequestHistory() {
  return (
    <Dialog>
      <DialogTrigger asChild className="cursor-pointer">
        <Button variant="link">
          <Icon icon="mdi:clipboard-text-history" width="2em" height="2em" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Category Request History</DialogTitle>
          <DialogDescription className="sr-only">
            Category Request History
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
