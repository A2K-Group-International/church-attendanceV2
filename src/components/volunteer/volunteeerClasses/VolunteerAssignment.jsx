import { Separator } from "@/shadcn/separator";
import kebab from "@/assets/svg/threeDots.svg";
import { Popover, PopoverContent, PopoverTrigger } from "@/shadcn/popover";

const quizzesAndAssignments = [
  {
    activity: "Religious-Themed Crafts Quiz",
    description:
      "Complete the quiz on religious-themed crafts, such as making rosaries, prayer cards, or stained glass window art.",
    datePosted: "2024-10-16",
    dueDate: "2024-12-01",
    targetAudience: "Children",
    activityType: "Quiz",
    quizLink:
      "https://docs.google.com/forms/d/e/1FAIpQLSfNbLzmFS29D3lN40ODL0p3601w9j9AbI5MKsnSpB07brQOgQ/viewform?usp=sf_link",
    quizName: "Religious Crafts Knowledge Quiz",
  },
  {
    activity: "Bible Study Groups Quiz",
    description:
      "Complete the quiz after attending small group sessions where children learn about different Bible stories.",
    datePosted: "2024-10-16",
    dueDate: null,
    targetAudience: "Children",
    activityType: "Quiz",
    quizLink:
      "https://docs.google.com/forms/d/e/1FAIpQLSfNbLzmFS29D3lN40ODL0p3601w9j9AbI5MKsnSpB07brQOgQ/viewform?usp=sf_link",
    quizName: "Bible Stories Quiz",
  },
  {
    activity: "Christian Values Quiz",
    description:
      "Take the quiz to assess your understanding of key Christian values and teachings.",
    datePosted: "2024-10-16",
    dueDate: "2024-11-15",
    targetAudience: "Parents",
    activityType: "Quiz",
    quizLink:
      "https://docs.google.com/forms/d/e/1FAIpQLSfNbLzmFS29D3lN40ODL0p3601w9j9AbI5MKsnSpB07brQOgQ/viewform?usp=sf_link",
    quizName: "Understanding Christian Values Quiz",
  },
  {
    activity: "Scripture Memorization Quiz",
    description:
      "Complete the quiz to demonstrate your knowledge of memorized scripture passages.",
    datePosted: "2024-10-16",
    dueDate: "2024-11-30",
    targetAudience: "Children",
    activityType: "Quiz",
    quizLink:
      "https://docs.google.com/forms/d/e/1FAIpQLSfNbLzmFS29D3lN40ODL0p3601w9j9AbI5MKsnSpB07brQOgQ/viewform?usp=sf_link",
    quizName: "Scripture Memorization Challenge",
  },
  {
    activity: "Register Children for Baptism",
    description:
      "Every parent must register their children online for the baptism, the link below is the registration form",
    datePosted: "2024-10-16",
    dueDate: "2024-12-15",
    targetAudience: "Parents",
    activityType: "Quiz",
    quizLink:
      "https://docs.google.com/forms/d/e/1FAIpQLSfNbLzmFS29D3lN40ODL0p3601w9j9AbI5MKsnSpB07brQOgQ/viewform?usp=sf_link",
    quizName: "Baptism Registration",
  },
];

export default function VolunteerAssignment() {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-2">
      {quizzesAndAssignments.map((quiz, index) => (
        <div
          key={index}
          className="mx-4 w-full rounded-md border p-4 shadow-md lg:w-3/5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p>{quiz.activity}</p>
              <p className="text-sm">Posted: {quiz.datePosted}</p>
            </div>
            <div className="flex flex-col items-end">
              <Popover>
                <PopoverTrigger>
                  <img src={kebab} className="h-6 w-6" alt="kebab" />
                </PopoverTrigger>
                <PopoverContent align="end" a className="w-28 p-0">
                  <div className="p-3 text-center hover:cursor-pointer">
                    Edit
                  </div>
                  <div className="p-3 text-center text-red-500 hover:cursor-pointer">
                    Delete
                  </div>
                </PopoverContent>
              </Popover>
              <p className="text-sm text-orange-600">
                For: {quiz.targetAudience}
              </p>
            </div>
          </div>
          <Separator className="my-3" />
          <div className="px-4">
            <p className="text-sm">{quiz.description}</p>
            <a
              className="underline hover:text-orange-600"
              href={`${quiz.quizLink}`}
            >
              {quiz.quizName}
            </a>
          </div>
          <Separator className="my-3" />
          <div>
            <p className="text-sm text-orange-600">
              Due: <span>{quiz.dueDate}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
