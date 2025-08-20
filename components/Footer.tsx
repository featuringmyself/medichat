import Link from "next/link";

export default function Footer(){
    return(
        <div className="text-center w-screen bg-amber-600 tracking-wide text-white font-medium text-xl py-2">
            Part of <Link href="https://dodox.in/" className="underline underline-offset-2">Dodox&apos;s</Link> Untamed Experiments
        </div>
    )
}