import { Link } from "react-router-dom";

export default function NavigationItem({ link, icon, children }) {
  return (
    <li>
      <Link
        to={link}
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-50"
      >
        <img src={icon} alt="Icon" className="h-5 w-5" />
        {children}
      </Link>
    </li>
  );
}
