import Kebab from "../../src/assets/svg/threeDots.svg";
import { Popover, PopoverContent, PopoverTrigger } from "@/shadcn/popover";
import { Link } from "react-router-dom";
import people from "@/assets/svg/people.svg"

const dummyData = [
  {
    id: "1",
    title: "Children's Liturgy Class",
    students: "5",
    created: "Oct 14, 2024",
  },
  {
    id: "2",
    title: "Youth Bible Study",
    students: "12",
    created: "Oct 10, 2024",
  },
  {
    id: "3",
    title: "Adult Confirmation Preparation",
    students: "8",
    created: "Oct 5, 2024",
  },
  {
    id: "4",
    title: "Sunday School for Toddlers",
    students: "10",
    created: "Oct 12, 2024",
  },
  {
    id: "5",
    title: "Women's Prayer Group",
    students: "6",
    created: "Oct 8, 2024",
  },
  {
    id: "6",
    title: "Men's Fellowship Meeting",
    students: "15",
    created: "Oct 9, 2024",
  },
  {
    id: "7",
    title: "Bible Study: Book of John",
    students: "7",
    created: "Oct 7, 2024",
  },
  {
    id: "8",
    title: "Family Faith Night",
    students: "20",
    created: "Oct 13, 2024",
  },
  {
    id: "9",
    title: "Senior Citizens Ministry",
    students: "4",
    created: "Oct 6, 2024",
  },
  {
    id: "10",
    title: "Praise and Worship Practice",
    students: "9",
    created: "Oct 11, 2024",
  },
];

export default function ClassesTable() {
  return (
    <div className="flex flex-col gap-3">
      {dummyData.map((data, id) => (
        <div
          key={id}
          className="flex items-center justify-between rounded-md p-4 shadow-md"
        >
          <Link
            to={`/volunteer-classes/${data.id}`}
            className="hover:cursor-pointer"
          >
            {data.title}
          </Link>
          <div className="flex min-w-60 justify-evenly gap-4">
            <div className=" flex justify-between items-center w-11">
            <p>{data.students}</p>
            <img src={people} alt="people icon" className="h-4 w-4" />
            </div>
            <p>{data.created}</p>
            <Popover>
              <PopoverTrigger>
                {" "}
                <img
                  onClick={() => console.log("hello")}
                  src={Kebab}
                  alt="Icon"
                  className="h-6 w-6"
                />
              </PopoverTrigger>
              <PopoverContent align="end" a className="w-40 p-0">
                <div className="p-3 text-center hover:cursor-pointer">
                  Copy Code
                </div>
                <div className="p-3 text-center text-red-500 hover:cursor-pointer">
                  Delete
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      ))}
    </div>
  );
}
