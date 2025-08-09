import Image from "next/image";

export default function Navbar() {
    return (
        <div className="mx-10 mt-4 bg-white rounded-2xl">
            <Image src={"/logo.png"} width={1536} height={1024} alt="Logo" className="max-w-[8rem] h-auto"/>
        </div>
    )
}