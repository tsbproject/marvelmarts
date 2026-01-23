
"use client";

import CartDrawer from "./CartDrawer";
import HelpMenu from "./HelpMenu";

export default function NavigationLeft() {
  return (
    <div className="flex items-center justify-end w-full max-w-xl mx-auto mt-4 ml-4 md:mt-26 md:ml-2  px-4 relative">
      <div className="flex items-center space-x-8 relative">
        {/* Help Section */}
        <HelpMenu />
         <CartDrawer />

        {/* Cart */}
        {/* <div className="flex relative group cursor-pointer mt-2 gap-2">
         
        </div> */}
      </div>
    </div>
  );
}
