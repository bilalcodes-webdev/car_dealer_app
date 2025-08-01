import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowLeft, CarFront, Heart, Layout } from "lucide-react";
import { checkUser } from "@/lib/checkUser";

const Header = async ({ isAdminPage = false }) => {
  const user = await checkUser();

  const isAdmin = user?.data?.role === "ADMIN";

  return (
    <div className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link className="flex" href={isAdmin ? "/admin" : "/"}>
          <Image
            src={"/logo.png"}
            alt="Logo"
            width={200}
            height={60}
            className="w-auto h-12 object-contain"
          />
          {isAdminPage && (
            <span className="text-sm font-extralight">Admin</span>
          )}
        </Link>

        <div className="flex gap-4 items-center">
          {isAdminPage ? (
            <>
              <Link href={"/"}>
                <Button
                  variant={"outline"}
                  className={"flex items-center gap-2"}
                >
                  <ArrowLeft size={18} />
                  <span>Go Back To App</span>
                </Button>
              </Link>
            </>
          ) : (
            <SignedIn>
              <Link href={"/saved-cars"}>
                <Button variant={"outline"}>
                  <Heart size={18} />
                  <span className="hidden md:inline">Saved Cars</span>
                </Button>
              </Link>

              {isAdmin ? (
                <Link href={"/admin"}>
                  <Button>
                    <Layout size={18} />
                    <span className="hidden md:inline">Admin Portal</span>
                  </Button>
                </Link>
              ) : (
                <Link href={"/reservations"}>
                  <Button>
                    <CarFront size={18} />
                    <span className="hidden md:inline">My Reservations</span>
                  </Button>
                </Link>
              )}
            </SignedIn>
          )}
          <SignedOut>
            <Link href={"/sign-in"}>
              <Button variant={"outline"}>Log In</Button>
            </Link>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-12 w-12",
                },
              }}
            />
          </SignedIn>
        </div>
      </nav>
    </div>
  );
};
export default Header;
