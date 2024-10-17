import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../shadcn/card";

export default function InformationCard({ children }) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Required Information</CardTitle>
        <CardDescription>
          Please Fill up the required Information
        </CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
