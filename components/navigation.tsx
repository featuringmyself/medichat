import Link from "next/link";
import { FaLink } from "react-icons/fa";
import Image from "next/image";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-purple-100/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center md:space-x-3 space-x-1">
            <Image
              src={"/logo.png"}
              width={1536}
              height={1024}
              alt="Logo"
              className="md:max-w-[4rem] max-w-[3rem] h-auto"
            />
            <span className="font-serif font-bold md:text-2xl text-xl text-slate-900">
              MediChat
            </span>
          </div>
          <div className="flex items-center gap-4">
            <UserButton />
            <SignInButton />
            <SignUpButton />
            <Link
              href="https://www.dodox.in/"
              target="_blank"
              className="bg-amber-400 px-3 py-2 font-semibold  rounded-xl flex gap-3 items-center text-md md:text-md ml-3"
            >
              Visit Dodox <FaLink />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
