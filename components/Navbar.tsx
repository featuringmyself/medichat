import Image from "next/image";

export default function Navbar() {
    return (
        <div className="mx-10 py-2 px-4 mt-4 bg-white rounded-2xl flex items-center justify-between">
            <div className="flex items-center">
                <Image src={"/logo.png"} width={1536} height={1024} alt="Logo" className="max-w-[4rem] h-auto" />
                <h2 className="text-xl font-bold text-[#174e9b]">MediChat</h2>
            </div>
        </div>
    )
}