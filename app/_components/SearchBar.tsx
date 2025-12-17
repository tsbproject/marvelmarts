// import { Search } from 'lucide-react';



// export default function SearchBar() {
//      return (
       
//       <div className="flex items-center justify-between  px-6 md:ml-30 md:-mt-10 ">
//         <div className="relative md:-top-18 md:left-60 w-full max-w-md md:max-w-xl ">
//           <Search className="absolute left-3  top-4 text-gray-400 w-7 h-7 " />
//           <input
//             type="text"
//             placeholder="Search for products..." 
//             className="w-full md:w-230 pl-10 pr-4 py-3 text-2xl  text-white border border-gray-300 rounded-full 
//                        focus:ring-2 focus:ring-blue-500 outline-none shadow-sm 
//                        transition-all duration-200 "
//           />
//         </div>
//       </div>
//      )
       
// }








"use client";

import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="flex items-center justify-center px-4 sm:px-6 md:ml-10 md:-mt-6">
      <div className="relative w-full max-w-xl sm:max-w-lg md:max-w-3xl lg:max-w-5xl xl:max-w-7xl">
        {/* Search Icon */}
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 sm:w-6 md:w-7 lg:w-8 h-5 sm:h-6 md:h-7 lg:h-8" />

        {/* Input */}
        <input
          type="text"
          placeholder="Search for products..."
          className="w-full sm:w-150 md:w-160 lg:w-250 pl-12 pr-4 py-2 sm:py-3 md:py-4 
                     text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl sm:text-black
                    lg:text-white bg-transparent  border-gray-300 rounded-full 
                     shadow-sm hover:shadow-md focus:shadow-lg
                     focus:ring-2 focus:ring-blue-500 outline-none 
                     transition-all duration-200 placeholder:text-gray-400"
        />
      </div>
    </div>
  );
}



