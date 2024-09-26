import { useState } from "react";
import { Button } from "../../shadcn/button";
import { Input } from "../../shadcn/input";
import { Label } from "../../shadcn/label";
import { useRegister } from "./useRegister";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
  } from "../../shadcn/dialog";

export default function RegisterUser() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // State for confirm password
  const [contactNumber, setContactNumber] = useState("");
  const [passwordMismatchError, setPasswordMismatchError] = useState(false); // Error for password mismatch
  const [passwordLengthError, setPasswordLengthError] = useState(false); // Error for password length
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);

  const { requestAccount, isLoading, isError, errorMessage } = useRegister({
    onSuccess: () => {
      setSuccessDialogOpen(true);
      setRegisterDialogOpen(false);
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!name || !email || !password || !contactNumber) return;

    // Check if password is at least 6 characters long
    if (password.length < 6) {
      setPasswordLengthError(true);
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setPasswordMismatchError(true);
      setPasswordLengthError(false); // Reset the length error
      return;
    }

    // If all validations pass, proceed with the account request
    setPasswordMismatchError(false);
    setPasswordLengthError(false);
    requestAccount({ name, email, password, contactNumber });
  }

  return (
    <Dialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Register</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold">Register</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Create a new account to join the platform.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full"
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactNumber" className="text-sm font-medium">
                Contact Number
              </Label>
              <Input
                id="contactNumber"
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full"
                placeholder="Enter your contact number"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                value={password}
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                placeholder="Enter your password"
                required
              />
              {passwordLengthError && (
                <p className="text-sm text-destructive">
                  Password must be at least 6 characters long.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                value={confirmPassword}
                type="password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full"
                placeholder="Confirm your password"
                required
              />
              {passwordMismatchError && (
                <p className="text-sm text-destructive">
                  Passwords do not match. Please try again.
                </p>
              )}
            </div>
          </div>
          {isError && (
            <p className="text-sm font-medium text-destructive">
              {errorMessage ||
                "Error occurred during registration. Please try again."}
            </p>
          )}
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="mt-3 sm:mt-0">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Success!</DialogTitle>
            <DialogDescription>
              Your registration request has been submitted successfully. An
              admin will review your request.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button onClick={() => setSuccessDialogOpen(false)}>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
