import Login from "../authentication/Login";
import RegisterUser from "./registration/RegisterUser";
import EditWalkInRegister from "./registration/EditWalkInRegister";
import DialogWalkInRegister from "./registration/DialogWalkInRegister";
import churchWithManyChildren from "../assets/images/church-with-many-children.png";
import holyCross from "../assets/images/Holy-Cross.png";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <div className="overflow-hidden">
        <div className="mx-auto grid h-svh max-w-[85rem] place-content-center px-4 py-20 sm:px-6 lg:px-8">
          <div className="relative mx-auto grid max-w-4xl space-y-5 sm:space-y-10">
            {/* Title */}
            <div className="text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Management Centre
              </p>
              <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                Growing in Faith Together: Engaging Children in the Joy of the
                Gospel
              </h1>
            </div>
            {/* End Title */}
            {/* Buttons */}
            <div className="mx-auto max-w-2xl rounded-lg border p-3 shadow-lg shadow-primary-foreground sm:flex sm:space-x-3">
              <div className="grid grid-cols-2 gap-2 p-2 md:grid-cols-4">
                <Login />
                <RegisterUser />
                <DialogWalkInRegister />
                <EditWalkInRegister />
              </div>
            </div>
            {/* End Button */}
            {/* SVG Element */}
            <div
              className="absolute start-0 top-2/4 hidden -translate-x-40 -translate-y-2/4 transform lg:block lg:-translate-x-60"
              aria-hidden="true"
            >
              <img
                src={churchWithManyChildren}
                alt="Church with many children"
                className="w-80"
              />
            </div>
            {/* End SVG Element */}
            {/* SVG Element */}
            <div
              className="translate-x-30 absolute end-0 top-2/4 hidden -translate-y-2/4 transform lg:block lg:translate-x-96"
              aria-hidden="true"
            >
              <img src={holyCross} alt="Cross" className="w-96" />
            </div>
            {/* End SVG Element */}
          </div>
        </div>
      </div>
      {/* End Hero */}
    </>
  );
}
