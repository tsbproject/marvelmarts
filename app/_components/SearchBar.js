import { Search } from 'lucide-react';



export default function SearchBar() {
     return (
       
      <div className=" flex flex-1 justify-center px-6 md:-ml-[-15rem] md:mt-[-4rem]">
        <div className="relative w-full max-w-md md:max-w-xl">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for products..."
            className="w-full md:w-[40rem] pl-10 pr-4 py-2 text-[var(--color-neutral-white)] border border-gray-300 rounded-full 
                       focus:ring-2 focus:ring-blue-500 outline-none shadow-sm 
                       transition-all duration-200"
          />
        </div>
      </div>
     )
       
}