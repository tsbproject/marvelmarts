
"use client";

import CartDrawer from "./CartDrawer";
import HelpMenu from "./HelpMenu";

export default function NavigationLeft() {
  return (
    <div className="flex items-center justify-end w-full max-w-xl mx-auto mt-6 md:mt-24 px-4 relative">
      <div className="flex items-center space-x-8 relative">
        {/* Help Section */}
        <HelpMenu />

        {/* Cart */}
        <div className="flex relative group cursor-pointer mt-2 gap-2">
          <CartDrawer />
        </div>
      </div>
    </div>
  );
}
