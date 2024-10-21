import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./shadcn/dialog";
import { Button } from "./../shadcn/button";

export default function Modal({ BtnName, onOpenChange, children }) {
  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>{BtnName}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[40rem]">
        <DialogHeader>
          <DialogTitle className="sr-only">Registration</DialogTitle>
          <DialogDescription className="sr-only"></DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
