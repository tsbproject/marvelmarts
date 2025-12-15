// import { Search } from 'lucide-react';



// export default function SearchBar() {
//      return (
       
//       <div className="flex items-center justify-between  px-6 md:ml-30 md:-mt-10 ">
//         <div className="relative md:-top-18 md:left-60 w-full max-w-md md:max-w-xl ">
//           <Search className="absolute left-3  top-4 text-gray-400 w-7 h-7 " />
//           <input
//             type="text"
//             placeholder="Search for products..." 
//             className="w-full md:w-[70rem] pl-10 pr-4 py-3 text-2xl  text-white border border-gray-300 rounded-full 
//                        focus:ring-2 focus:ring-blue-500 outline-none shadow-sm 
//                        transition-all duration-200 "
//           />
//         </div>
//       </div>
//      )
       
// }





'use client';

import { Search } from 'lucide-react';

export default function SearchBar() {
  return (
    <div className="flex items-center justify-between px-4 sm:px-6 md:ml-30 md:-mt-10">
      <div className="relative w-full max-w-full sm:max-w-md md:max-w-6xl md:-top-18 md:left-60">
        <Search className="absolute left-3 top-3 sm:top-4 text-gray-400 w-5 sm:w-6 md:w-7 h-5 sm:h-6 md:h-7" />
        <input
          type="text"
          placeholder="Search for products..."
          className="w-full pl-10 pr-4 py-2 sm:py-3 text-base sm:text-xl md:text-2xl text-gray-800 bg-white border border-gray-300 rounded-full 
                     focus:ring-2 focus:ring-blue-500 outline-none shadow-sm 
                     transition-all duration-200 placeholder:text-gray-400"
        />
      </div>
    </div>
  );
}
