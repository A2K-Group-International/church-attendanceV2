import { useState, useEffect } from "react";
import supabase from "../../api/supabase";
import { fetchAllEvents } from "../../api/userService";
import { Button } from "../../shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../shadcn/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../shadcn/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../shadcn/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shadcn/select";
import { Input } from "../../shadcn/input";
import { Label } from "../../shadcn/label";
import FormLabel from "../../components/FormLabel";

export default function EditWalkInRegister() {
  const [userCode, setUserCode] = useState("");
  const [attendanceRecord, setAttendanceRecord] = useState(null); // Store fetched record
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("guardian");
  const [preferredTime, setPreferredTime] = useState("");
  const [children, setChildren] = useState([
    { firstName: "", lastName: "", telephone: "" },
  ]);
  const [guardianFirstName, setGuardianFirstName] = useState("");
  const [guardianLastName, setGuardianLastName] = useState("");
  const [eventName, setEventName] = useState([]);
  const [error, setError] = useState("");

  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const handleSubmit = async () => {
    try {
      // Fetch the attendance record that matches the userCode
      const { data: fetchData, error } = await supabase
        .from("attendance_pending")
        .select("*")
        .eq("attendance_code", userCode); // Filter by userCode

      // Handle error if any
      if (error) throw error;

      // Check if any records are returned
      if (fetchData.length > 0) {
        fetchData.forEach((item) => {
          setGuardianLastName(item.guardian_last_name);
          setGuardianFirstName(item.guardian_first_name);
          setSelectedEvent(item.selected_event);
          setSelectedTime(item.preferred_time);
          console.log(item.preferred_time);
          setChildren((prevChildren) => [
            ...prevChildren,
            {
              firstName: item.children_first_name,
              lastName: item.children_last_name,
              telephone: item.guardian_telephone,
            },
          ]);
        });
        setAttendanceRecord(fetchData[0]); // Store the fetched record
        setIsEditing(true); // Transition to edit mode
        setError("");
      } else {
        setError("Please enter the correct code.");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error:", error.message);
      setError("An error occurred while fetching the record.");
    }
  };

  const handleNext = () => {
    if (!preferredTime) {
      setError("Please fill out all fields.");
    } else {
      setError("");
      setActiveTab("children");
    }
  };
  const handleAddChild = () => {
    setChildren([...children, { firstName: "", lastName: "", telephone: "" }]);
  };

  const handleRemoveChild = (index) => {
    if (children.length > 1) {
      setChildren(children.filter((_, i) => i !== index));
    }
  };

  const handleChangeChild = (index, field, value) => {
    const newChildren = [...children];
    newChildren[index] = { ...newChildren[index], [field]: value };
    setChildren(newChildren);
  };

  const parsedChildren = children.map((child) => ({
    ...child,
    telephone: parseInt(child.telephone, 10),
  }));

  const validateChildren = (children) => {
    for (const child of children) {
      if (isNaN(parseInt(child.telephone, 10))) {
        setError("Telephone must be a number.");
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateChildren(parsedChildren)) {
      return;
    }

    try {
      const updates = parsedChildren.map(async (child) => {
        // Ensure child has a unique identifier for updating
        const { id } = attendanceRecord; // Replace this with your actual identifier property
        const { error } = await supabase
          .from("attendance_pending")
          .update({
            guardian_first_name: guardianFirstName,
            guardian_last_name: guardianLastName,
            preferred_time: preferredTime,
            guardian_telephone: child.telephone,
            children_last_name: child.lastName,
            children_first_name: child.firstName,
          })
          .eq("id", id); // Use the unique identifier for the update

        if (error) throw error;
      });

      await Promise.all(updates); // Wait for all updates to complete

      alert("Registration updated successfully!");
      resetForm();
    } catch (error) {
      console.error("Error saving registration:", error.message);
      setError("An error occurred while saving the registration.");
    }
  };

  const resetForm = () => {
    setUserCode("");
    setAttendanceRecord(null);
    setIsEditing(false);
    setError("");
  };

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const events = await fetchAllEvents();
        if (events.length > 0) {
          setEventName(events);
          // setNextMassDate(events[0].schedule);
          // setMassTime(events[0].time);
        } else {
          setError("No schedule found.");
        }
      } catch (error) {
        setError("Failed to load schedule.", error);
      }
    };

    fetchSchedule();
  }, []);

  //check the time and day of the event
  const filteredMassTimes = eventName
    .filter((event) => event.name === selectedEvent)
    .flatMap((event) => event.time || []);

  const filteredMassSchedule = eventName
    .filter((event) => event.name === selectedEvent)
    .flatMap((event) => event.schedule);

  const formattedMassTimes = filteredMassTimes.map((timeString) => {
    // Extract the time part
    const timePart = timeString.split("+")[0];

    // Create a Date object using the time part
    const date = new Date(`1970-01-01T${timePart}Z`); // Use Z to indicate UTC

    // Format the time in HH:mm
    return date.toISOString().substr(11, 5); // Returns the formatted time
  });

  const date = new Date(filteredMassSchedule);
  const options = { year: "numeric", month: "long", day: "numeric" };
  const formattedDate = date.toLocaleDateString("en-GB", options);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Registration</Button>
      </DialogTrigger>
      <DialogContent className={isEditing && "sm:max-w-[42rem]"}>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Registration" : "Enter Code"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your registration details."
              : "Enter the code to make changes to your registration."}
          </DialogDescription>
        </DialogHeader>

        {error && <p className="text-red-500">{error}</p>}

        {/* Show form to input code if not in editing mode */}
        {!isEditing && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Input
                id="code"
                type="number"
                placeholder="Enter your code"
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                className="col-span-6"
                required
              />
            </div>
            <Button type="button" onClick={handleSubmit}>
              Submit
            </Button>
          </div>
        )}

        {/* Show form to edit registration if in editing mode */}
        {isEditing && attendanceRecord && (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-6 grid w-full grid-cols-2">
              <TabsTrigger value="guardian" className="text-sm font-medium">
                Step 1
              </TabsTrigger>
              <TabsTrigger
                value="children"
                disabled={!preferredTime}
                className="text-sm font-medium"
              >
                Step 2
              </TabsTrigger>
            </TabsList>
            <TabsContent value="guardian">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">
                    Registration
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Please provide your information and select your preferred
                    time
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormLabel>
                    <Label htmlFor="Event" className="text-sm font-medium">
                      Upcoming Events
                    </Label>
                    <Select
                      value={selectedEvent}
                      onValueChange={(value) => {
                        setSelectedEvent(value);
                        // setPreferredTime("");
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Event" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventName.map((event, index) => (
                          <SelectItem key={index} value={event.name}>
                            {event.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormLabel>
                  <Label htmlFor="Event" className="text-sm font-medium">
                    Schedule: {formattedDate}
                  </Label>
                  <FormLabel>
                    <Label
                      htmlFor="preferredtime"
                      className="text-sm font-medium"
                    >
                      Available Time
                    </Label>
                    <Select
                      value={preferredTime}
                      onValueChange={(value) => setPreferredTime(value)}
                      disabled={!selectedEvent}
                    >
                      <SelectTrigger className="mt-1 w-48">
                        <SelectValue
                          placeholder="Select Time"
                          value={selectedTime}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {formattedMassTimes.map((time, index) => (
                          <SelectItem key={index} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormLabel>
                </CardContent>
                <CardFooter className="flex-col">
                  {error && (
                    <p className="mt-2 text-sm font-medium text-destructive">
                      {error}
                    </p>
                  )}
                  <Button onClick={handleNext} className="w-full">
                    Next
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="children">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">
                    Required Information
                  </CardTitle>
                  <Label htmlFor="lastName" className="text-md font-medium">
                    Add Parent/Carer
                  </Label>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col gap-x-4 md:flex-row">
                    <FormLabel>
                      <Label htmlFor="lastName" className="text-sm font-medium">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        placeholder="Enter your last name"
                        value={guardianLastName}
                        onChange={(e) => setGuardianLastName(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </FormLabel>
                    <FormLabel>
                      <Label
                        htmlFor="firstName"
                        className="text-sm font-medium"
                      >
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        placeholder="Enter your first name"
                        value={guardianFirstName}
                        onChange={(e) => setGuardianFirstName(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </FormLabel>
                  </div>
                  {children.map((child, index) => (
                    <div
                      key={index}
                      className="space-y-4 rounded-lg bg-muted p-4"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold">
                          Add Child/Children
                          <span className="block text-xs font-normal text-black">
                            Please provide your child's information. You can add
                            multiple children
                          </span>
                        </h4>
                        <Button
                          type="button"
                          onClick={() => handleRemoveChild(index)}
                          disabled={children.length === 1}
                          size="sm"
                          variant="outline"
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <FormLabel>
                          <Label
                            htmlFor={`childrenLastName_${index}`}
                            className="text-sm font-medium"
                          >
                            Last Name
                          </Label>
                          <Input
                            id={`childrenLastName_${index}`}
                            type="text"
                            value={child.lastName}
                            onChange={(e) =>
                              handleChangeChild(
                                index,
                                "lastName",
                                e.target.value,
                              )
                            }
                            className="mt-1"
                            required
                          />
                        </FormLabel>
                        <FormLabel>
                          <Label
                            htmlFor={`childrenFirstName_${index}`}
                            className="text-sm font-medium"
                          >
                            First Name
                          </Label>
                          <Input
                            id={`childrenFirstName_${index}`}
                            type="text"
                            value={child.firstName}
                            onChange={(e) =>
                              handleChangeChild(
                                index,
                                "firstName",
                                e.target.value,
                              )
                            }
                            className="mt-1"
                            required
                          />
                        </FormLabel>
                        <FormLabel>
                          <Label
                            htmlFor={`telephone_${index}`}
                            className="text-sm font-medium"
                          >
                            Telephone
                          </Label>
                          <Input
                            id={`telephone_${index}`}
                            type="number"
                            value={child.telephone}
                            onChange={(e) =>
                              handleChangeChild(
                                index,
                                "telephone",
                                e.target.value,
                              )
                            }
                            className="mt-1"
                            required
                          />
                        </FormLabel>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={handleAddChild}
                    className="w-full"
                  >
                    Add Another Child
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter>
          {isEditing && (
            <Button type="button" onClick={handleSave}>
              Save
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
