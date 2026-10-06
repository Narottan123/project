import Link from "next/link";
import { MdOutlineSearchOff } from "react-icons/md";
import { IoHomeOutline } from "react-icons/io5";

function NotFound() {
  return (
    <div className="errorPageWrap">
      <div className="errorPageCard">
        <div className="errorPageIconBadge">
          <MdOutlineSearchOff />
        </div>

        <h1 className="errorPageCode">404</h1>
        <h2 className="errorPageTitle">Page not found</h2>
        <p className="errorPageText">
          The page you are looking for doesn&apos;t exist or may have been
          moved. Double-check the URL or head back to the dashboard.
        </p>

        <div className="errorPageActions">
          <Link href="/" className="nextbtn btn btn-primary">
            <IoHomeOutline />
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
