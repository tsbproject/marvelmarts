import { Search } from 'lucide-react';



export default function SearchBar() {
     return (
       
      <div className="flex items-center justify-between  px-6 md:-ml-[-15rem] md:mt-[-3rem] ">
        <div className="relative md:-top-18 md:left-60 w-full max-w-md md:max-w-xl ">
          <Search className="absolute left-3  top-4 text-gray-400 w-7 h-7 " />
          <input
            type="text"
            placeholder="Search for products..." 
            className="w-full md:w-[70rem] pl-10 pr-4 py-3 text-2xl  text-[var(--color-neutral-white)] border border-gray-300 rounded-full 
                       focus:ring-2 focus:ring-blue-500 outline-none shadow-sm 
                       transition-all duration-200 "
          />
        </div>
      </div>
     )
       
}