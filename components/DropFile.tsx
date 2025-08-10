import { Button } from "@/components/ui/button";

export default function DropFile() {


    return (
        <div className="bg-[#FDF6FE] h-[40vh] w-[60vh] outline-dashed rounded-xl flex flex-col items-center justify-center gap-4 leading-tight">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.3339 21.3327L16.0006 15.9993M16.0006 15.9993L10.6673 21.3327M16.0006 15.9993V27.9993M27.1873 24.5193C28.4877 23.8104 29.515 22.6885 30.1071 21.3308C30.6991 19.9732 30.8222 18.457 30.4569 17.0216C30.0915 15.5862 29.2586 14.3134 28.0895 13.4039C26.9204 12.4945 25.4817 12.0003 24.0006 11.9993H22.3206C21.917 10.4383 21.1648 8.98913 20.1205 7.76067C19.0762 6.53222 17.767 5.55648 16.2914 4.90682C14.8157 4.25717 13.212 3.95049 11.6007 4.00986C9.9895 4.06922 8.41268 4.49308 6.98882 5.24957C5.56497 6.00606 4.33114 7.07549 3.38008 8.37746C2.42903 9.67943 1.78551 11.1801 1.49789 12.7665C1.21028 14.353 1.28606 15.9841 1.71954 17.537C2.15302 19.09 2.93291 20.5245 4.00059 21.7327" stroke="#90119B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            <div className="leading-tight text-center rounded">
                <h4 className="text-xl font-medium">Drop file or browse</h4>
                <p className="font-light text-lg mt-1">Format: .jpeg, .png & Max file size: 25 MB</p>
                <Button className="mt-8 bg-[#90119B] px-4 py-2 text-white font-medium">Browse Files</Button>
            </div>
        </div>
    )
}