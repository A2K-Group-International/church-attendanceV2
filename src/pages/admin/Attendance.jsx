import { useState, useEffect, useCallback } from "react";
import supabase from "../../api/supabase";
import AdminSidebar from "../../components/admin/AdminSidebar";
import Table from "../../components/Table";
import ExcelJS from "exceljs"; 
import { saveAs } from "file-saver";
import { CalendarIcon, Clock, Filter } from "lucide-react";
import { format } from "date-fns";
import { Button } from "../../shadcn/button";
import { Switch } from "../../shadcn/switch";
import { Calendar } from "../../shadcn/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../shadcn/popover";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../shadcn/pagination";
import downloadIcon from "../../assets/svg/download.svg";

// Headers for table
const headers = [
  "Action",
  "#",
  "Children Name",
  "Guardian Name",
  "Telephone",
  "Status",
];

export default function Attendance() {
  const [data, setData] = useState([]); // Data from the database
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [availableTimes, setAvailableTimes] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 7;

  const fetchData = useCallback(
    async (date, status, time) => {
      setLoading(true);
      setError(null);
      try {
        const formattedDate = new Date(date).toISOString().split("T")[0]; // format the date
        // Query setup
        let query = supabase
          .from("attendance_pending")
          .select("*", { count: "exact" })
          .eq("schedule_day", formattedDate)
          .range(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage - 1,
          ); // Pagination

        // fetch or filter from preferred time
        if (time) {
          query = query.eq("preferred_time", time);
        }
        // fetch or filter from status
        if (status !== "all") {
          query = query.eq("has_attended", status === "attended");
        }

        // fetching the data
        const { data: fetchedData, error, count } = await query;

        if (error) throw error;

        // calculate the pages
        setTotalPages(Math.ceil(count / itemsPerPage));

        // formatting the date
        const formattedData = fetchedData.map((item) => ({
          ...item,
          formattedDate: new Date(item.schedule_day).toLocaleDateString(
            "en-GB",
            {
              day: "numeric",
              month: "long",
              year: "numeric",
            },
          ),
        }));
        // extract the times
        const uniqueTimes = [
          ...new Set(fetchedData.map((item) => item.preferred_time)),
        ];

        setData(formattedData); // formatted data
        setAvailableTimes(uniqueTimes); // format the available times
      } catch (error) {
        setError("Error fetching data. Please try again.");
        console.error("Error in fetchData function:", error);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, itemsPerPage],
  );

  // Fetch data when selectedDate, selectedTime, statusFilter, or currentPage changes
  useEffect(() => {
    fetchData(selectedDate, statusFilter, selectedTime);
  }, [selectedDate, selectedTime, statusFilter, currentPage, fetchData]);

  // Set the selected date and reset to the first page
  const handleDateChange = (date) => {
    setSelectedDate(date ? new Date(date) : new Date());
    setCurrentPage(1);
  };

  // Set the selected time and reset to the first page
  const handleTimeChange = (event) => {
    setSelectedTime(event.target.value);
    setCurrentPage(1);
  };

  // Set the status filter and reset to the first page
  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
    setCurrentPage(1);
  };

  const handleSwitchChange = async (itemId, checked) => {
    try {
      // Update attendance status in the database
      const { error } = await supabase
        .from("attendance_pending")
        .update({ has_attended: checked })
        .eq("id", itemId);

      if (error) throw error;

      // Update the local data with the new attendance status
      const updatedData = data.map((dataItem) =>
        dataItem.id === itemId
          ? { ...dataItem, has_attended: checked }
          : dataItem,
      );
      setData(updatedData);
    } catch (error) {
      setError("Error updating attendance. Please try again.");
      console.error("Error in handleSwitchChange function:", error);
    }
  };

  // Filter attended data and format it for the Excel file
  const handleExportExcel = async () => {
    const attendedData = data
      .filter((item) => item.has_attended)
      .map((item) => ({
        "#": item.id,
        "Children Name": `${item.children_first_name} ${item.children_last_name}`,
        "Guardian Name": `${item.guardian_first_name} ${item.guardian_last_name}`,
        Telephone: item.guardian_telephone,
        Status: "Attended",
      }));

    // Create a new workbook and worksheet for the attendance data
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Attendance");

    // Set the headers for the worksheet columns
    worksheet.columns = headers.map((header) => ({ header, key: header }));

    // Add the attended data to the worksheet
    attendedData.forEach((dataRow) => {
      worksheet.addRow(dataRow);
    });

    // Create a buffer and download the Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const dataBlob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(dataBlob, "attendance_records.xlsx");
  };

  const rows = data.map((item, index) => [
    <Switch
      key={item.id}
      checked={item.has_attended}
      onCheckedChange={(checked) => handleSwitchChange(item.id, checked)}
      aria-label="Toggle attendance status"
    />,
    index + 1 + (currentPage - 1) * itemsPerPage,
    `${item.children_first_name} ${item.children_last_name}`,
    `${item.guardian_first_name} ${item.guardian_last_name}`,
    item.guardian_telephone,
    item.has_attended ? "Attended" : "Pending",
  ]);

  return (
    <AdminSidebar>
      <main className="mx-auto max-w-7xl p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">
            Manage and track attendance records.
          </p>
        </div>
        <div className="mb-6 flex flex-col items-start space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
          <div className="flex items-center space-x-2 sm:w-auto">
            <CalendarIcon className="mr-2 h-4 w-4" />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal sm:w-[200px]"
                >
                  {format(selectedDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex w-full items-center space-x-2 sm:w-auto">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedTime}
              onChange={handleTimeChange}
              className="rounded-md border border-input bg-background p-2"
            >
              <option value="" disabled={availableTimes.length === 0}>
                {availableTimes.length > 0
                  ? "Select Time"
                  : "No time available"}
              </option>
              {availableTimes.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          <div className="flex w-full items-center space-x-2 sm:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="rounded-md border border-input bg-background p-2"
            >
              <option value="all">All</option>
              <option value="attended">Attended</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <Button
            onClick={handleExportExcel}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <img src={downloadIcon} alt="Download Icon" />
          </Button>
        </div>
        <div className="rounded-lg bg-card shadow">
          {loading ? (
            <div className="p-8 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">
                Loading attendance records...
              </p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-destructive">{error}</p>
            </div>
          ) : data.length > 0 ? (
            <>
              <Table headers={headers} rows={rows} />
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
                      }}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, index) => (
                    <PaginationItem key={index}>
                      <PaginationLink
                        href="#"
                        isActive={currentPage === index + 1}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(index + 1);
                        }}
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages)
                          setCurrentPage((prev) => prev + 1);
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </>
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">
                No attendance records found.
              </p>
            </div>
          )}
        </div>
      </main>
    </AdminSidebar>
  );
}
