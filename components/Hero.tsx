import DropFile from "./DropFile";

export default function Hero(){
    return (
        <div className="h-[85vh] flex items-center justify-evenly bg-[#DFE9FA]">
            <div className="max-w-xl">
                <h1 className="text-6xl font-bold text-[#161554]">Reimagine your Health Reports with <span className="italic text-[#4548C4]">AI</span></h1>
                <p className="mt-10 font-medium text-xl">Effortlessly understand, summarize, and chat about your medical reports.
                Unlock clarity and confidence with intelligent insights, powered by advanced AI.</p>
            </div>
            <DropFile />
        </div>
    );
}