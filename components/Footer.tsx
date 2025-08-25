import Link from "next/link";

export default function Footer(){
    return(
        <div className="md:text-right text-center tracking-wide text-zinc-500 font-medium text-base py-2 mr-8">
            Fresh Out of <Link href={"https://www.dodox.in/"}>Dodox</Link> Labs
        </div>
    )
}