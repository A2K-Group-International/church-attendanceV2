import Login from "../authentication/Login";
import RegisterUser from "./registration/RegisterUser";
import EditWalkInRegister from "./registration/EditWalkInRegister";
import DialogWalkInRegister from "./registration/DialogWalkInRegister";
import PublicCalendar from "./PublicCalendar";
import churchBg from "../assets/images/church-background.webp";
import churchIcon from "../assets/svg/churchIcon.svg";
import CarouselEvents from "../components/CarouselEvents";
import { Button } from "../shadcn/button";
import BtnSelectRegistration from "./registration/BtnSelectRegistration";

export default function Home() {
  return (
    <>
      <div
        className={`before:via-[rgba(255,255,255,0.78) relative z-[1] h-fit min-h-dvh w-full bg-cover bg-center bg-no-repeat before:absolute before:z-[-1] before:h-full before:w-full before:bg-gradient-to-t before:from-[rgba(255,255,255,0.78)] before:to-[rgba(255,255,255,0.3)] before:content-['']`}
        style={{ backgroundImage: `url(${churchBg})` }}
      >
        <div className="container mx-auto grid max-w-screen-xl grid-cols-1 gap-y-20 pt-20 md:grid-cols-2">
          <div className="order-2 mx-auto max-w-xl justify-center rounded-2xl bg-white/60 sm:flex sm:space-x-3 md:order-1 md:col-span-2">
            <div className="grid grid-cols-2 gap-2 p-2 sm:grid-cols-4">
              <Login />
              <RegisterUser />
              {/* <BtnSelectRegistration /> */}
              <DialogWalkInRegister btnName="Walk-In Register" title="Register" description="Fill up the forms for one-time registration" btnSubmit="Submit" />
              {/* <DialogWalkInRegister btnName="Walk-In Register" title="Register" description="Fill up the forms for one-time registration" btnSubmit="Submit" /> */}
              <EditWalkInRegister />
            </div>
          </div>
          <div className="order-1 flex flex-col items-center gap-y-4 text-center md:order-1 md:block md:text-start">
            <img src={churchIcon} alt="Church Icon" className="w-52" />
            <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl xl:text-7xl">
              Growing in Faith Together
            </h2>
          </div>
          <div className="order-3 flex items-end justify-center">
            <div className="mx-auto w-52 lg:w-auto">
              <CarouselEvents />
              <div className="flex justify-center">
                <PublicCalendar />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
    // <>
    //   {/* Hero */}
    //   <div
    //     className="relative overflow-hidden bg-cover bg-center bg-no-repeat"
    //     style={{
    //       backgroundImage: `url(${churchBg})`,
    //     }}
    //   >
    //     <div className="absolute h-screen w-full bg-white/40 backdrop-opacity-70"></div>
    //     <div
    //       className={`mx-auto grid h-svh max-w-[85rem] px-4 py-20 sm:px-6 lg:px-8`}
    //     >
    //       <div className="z-10 mx-auto">
    //         <div className="border-2 p-2 w-[40rem]">
    //           <div className="flex gap-2">
    //             <Login />
    //             <RegisterUser />
    //             <DialogWalkInRegister />
    //             <EditWalkInRegister />
    //           </div>
    //         </div>
    //       </div>
    //       <div>test</div>
    //     </div>
    //   </div>
    //   {/* End Hero */}
    // </>
    // <>
    //   {/* Hero */}
    //   <div
    //     className="overflow-hidden"
    //   >
    //     <div className="absolute h-screen w-ful"></div>
    //     <div
    //       className={`mx-auto grid h-svh max-w-[85rem] place-content-center px-4 py-20 sm:px-6 lg:px-8`}
    //     >
    //       <div className="relative mx-auto grid max-w-4xl space-y-5 sm:space-y-10">
    //         {/* Title */}
    //         <div className="text-center">
    //           <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
    //             Management Centre
    //           </p>
    //           <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
    //             Growing in Faith Together: Engaging Children in the Joy of the
    //             Gospel
    //           </h1>
    //         </div>
    //         {/* End Title */}
    //         {/* Buttons */}
    //         <div className="mx-auto max-w-2xl rounded-lg border p-3 shadow-lg shadow-primary-foreground sm:flex sm:space-x-3">
    //           <div className="grid grid-cols-2 gap-2 p-2 md:grid-cols-4">
    //             <Login />
    //             <RegisterUser />
    //             <DialogWalkInRegister />
    //             <EditWalkInRegister />
    //           </div>
    //         </div>
    //         {/* End Button */}
    //         {/* SVG Element */}
    //         <div
    //           className="absolute start-0 top-2/4 hidden -translate-x-40 -translate-y-2/4 transform lg:block lg:-translate-x-60"
    //           aria-hidden="true"
    //         >
    //           <img
    //             src={churchWithManyChildren}
    //             alt="Church with many children"
    //             className="w-80"
    //           />
    //         </div>
    //         {/* End SVG Element */}
    //         {/* SVG Element */}
    //         <div
    //           className="translate-x-30 absolute end-0 top-2/4 hidden -translate-y-2/4 transform lg:block lg:translate-x-96"
    //           aria-hidden="true"
    //         >
    //           <img src={holyCross} alt="Cross" className="w-96" />
    //         </div>
    //         {/* End SVG Element */}
    //       </div>
    //     </div>
    //   </div>
    //   {/* End Hero */}
    // </>
  );
}
