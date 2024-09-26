import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../shadcn/card";
import { Label } from "../../shadcn//label";
import { Input } from "../../shadcn/input";
import { Button } from "../../shadcn/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../shadcn/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shadcn/select";
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
import FormLabel from "../../components/FormLabel";
import supabase from "../../api/supabase";
import { fetchAllEvents } from "../../api/userService";

export default function DialogWalkInRegister() {
  const [error, setError] = useState("");
  const [guardianFirstName, setGuardianFirstName] = useState("");
  const [guardianLastName, setGuardianLastName] = useState("");
  const [guardianTelephone, setGuardianTelephone] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [children, setChildren] = useState([{ firstName: "", lastName: "" }]);
  const [eventName, setEventName] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [activeTab, setActiveTab] = useState("guardian");
  const [selectedEvent, setSelectedEvent] = useState("");

  // if no time selected, step 2 is disabled
  const handleNext = () => {
    if (!preferredTime) {
      setError("Please fill out all fields.");
    } else {
      setError("");
      setActiveTab("children");
    }
  };
  // add child form
  const handleAddChild = () => {
    setChildren([...children, { firstName: "", lastName: "" }]);
  };
  // remove child form
  const handleRemoveChild = (index) => {
    if (children.length > 1) {
      setChildren(children.filter((_, i) => i !== index));
    }
  };
  // Update a specific child's field value in the children array
  const handleChangeChild = (index, field, value) => {
    const newChildren = [...children];
    newChildren[index] = { ...newChildren[index], [field]: value };
    setChildren(newChildren);
  };
  // generate random code. Used it for editing registration
  const handleGenerateRandomCode = () => {
    const randomNumber =
      Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    return randomNumber;
  };

  // submit to supabase
  const handleSubmit = async () => {
    const hasEmptyChild = children.some(
      (child) => !child.firstName || !child.lastName,
    );

    if (
      !guardianFirstName ||
      !guardianLastName ||
      !preferredTime ||
      hasEmptyChild
    ) {
      setError("Please complete all fields.");
      return;
    }

    {
      /* For future reference if telephone move to child's information */
    }
    // const parsedChildren = children.map((child) => ({
    //   ...child,
    //   telephone: parseInt(child.telephone, 10),
    // }));

    // if (parsedChildren.some((child) => isNaN(child.telephone))) {
    //   setError("Telephone must be a number.");
    //   return;
    // }

    if (isNaN(parseInt(guardianTelephone, 10))) {
      setError("Guardian's telephone must be a number.");
      return;
    }

    //Generate Unique Code to users for them to edit registration
    const randomCode = handleGenerateRandomCode();

    try {
      const { error: dataError } = await supabase
        .from("attendance_pending")
        .insert(
          children.map((child) => ({
            guardian_first_name: guardianFirstName,
            guardian_last_name: guardianLastName,
            guardian_telephone: guardianTelephone,
            children_last_name: child.lastName,
            children_first_name: child.firstName,
            has_attended: false,
            attendance_code: randomCode,
            preferred_time: preferredTime,
            schedule_day: filteredMassSchedule[0],
            selected_event: selectedEvent,
          })),
        );

      if (dataError) throw dataError;

      setGuardianFirstName("");
      setGuardianLastName("");
      setGuardianTelephone("");
      setPreferredTime("");
      setSelectedEvent("");
      setChildren([{ firstName: "", lastName: "", telephone: "" }]);
      setActiveTab("guardian");
      setError("");
      alert(`Registration successful! Please save your code: ${randomCode}`);
    } catch (error) {
      console.error("Error submitting form:", error.message);
      setError("There was an error submitting the form. Please try again.");
    }
  };

  // fetch the event and time
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

  const handleSelectEvent = (eventId) => {
    const selectedEvent = eventName.find((event) => event.id === eventId);
    if (selectedEvent) {
      setSelectedEvent(selectedEvent.name);
      setSelectedEventId(eventId); // Set the selected ID
      setPreferredTime("");
    }
  };

  // Check and filter the time in the selected event
  const filteredMassTimes = eventName
    .filter((event) => event.id === selectedEventId) // Filter by selected event ID
    .flatMap((event) => event.time || []); // Get times

  // Filter the schedule in the selected event
  const filteredMassSchedule = eventName
    .filter(
      (event) => event.name === selectedEvent && event.id === selectedEventId,
    )
    .flatMap((event) => event.schedule || []); // Get schedules

  // format the date
  const date = new Date(filteredMassSchedule);
  const options = { year: "numeric", month: "long", day: "numeric" };
  const formattedDate = date.toLocaleDateString("en-GB", options);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Walk-In Register
        </Button>
      </DialogTrigger>
      <DialogContent className="no-scrollbar h-full max-w-screen-md overflow-y-auto lg:h-[44rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Register</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Fill up the forms for one-time registration
          </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                  Please provide your information and select your preferred time
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormLabel>
                  <Label htmlFor="Event" className="text-sm font-medium">
                    Upcoming Events
                  </Label>
                  <Select onValueChange={handleSelectEvent}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Event" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventName.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormLabel>
                <Label htmlFor="Schedule" className="text-sm font-medium">
                  {selectedEvent && <span>Schedule: {formattedDate}</span>}
                </Label>
                <FormLabel>
                  <Label
                    htmlFor="preferredtime"
                    className="text-sm font-medium"
                  >
                    Available Time
                  </Label>
                  <Select
                    onValueChange={(value) => setPreferredTime(value)}
                    value={preferredTime}
                    disabled={!selectedEvent}
                  >
                    <SelectTrigger className="mt-1 w-48">
                      <SelectValue placeholder="Select Time" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredMassTimes.map((time, index) => (
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
              </CardHeader>
              <CardContent className="space-y-6">
                <Label htmlFor="lastName" className="text-md font-medium">
                  Add Parent/Carer
                </Label>
                <div className="flex flex-col gap-x-4 md:flex-row">
                  <FormLabel>
                    <Label htmlFor="firstName" className="text-sm font-medium">
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
                  <FormLabel>
                    <Label htmlFor="firstName" className="text-sm font-medium">
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
                      htmlFor="guardianTelephone"
                      className="text-sm font-medium"
                    >
                      Telephone
                    </Label>
                    <Input
                      id="guardianTelephone"
                      type="text"
                      placeholder="Enter your telephone"
                      value={guardianTelephone}
                      onChange={(e) => setGuardianTelephone(e.target.value)}
                      className="mt-1"
                      required
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
                        Add Child
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
                          htmlFor={`childFirstName_${index}`}
                          className="text-sm font-medium"
                        >
                          First Name
                        </Label>
                        <Input
                          id={`childFirstName_${index}`}
                          type="text"
                          placeholder="Child's First Name"
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
                          htmlFor={`childLastName_${index}`}
                          className="text-sm font-medium"
                        >
                          Last Name
                        </Label>
                        <Input
                          id={`childLastName_${index}`}
                          type="text"
                          placeholder="Child's Last Name"
                          value={child.lastName}
                          onChange={(e) =>
                            handleChangeChild(index, "lastName", e.target.value)
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
        {error && (
          <p className="text-center text-red-500 md:text-end">{error}</p>
        )}
        <DialogFooter className="flex flex-col-reverse items-center gap-2 sm:flex-row sm:justify-end sm:space-x-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          {activeTab === "children" && (
            <Button onClick={handleSubmit}>Submit Registration</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
