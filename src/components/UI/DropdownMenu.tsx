import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

interface DropdownItem {
  itemTitle: string;
  itemIcon?: React.ComponentType<{ size?: number }> | React.ReactNode;
  url?: string;
  action?: () => void;
}

interface DropdownMenuProps {
  dropdownLabelName: string;
  items: DropdownItem[];
}

const DropDownMenu: React.FC<DropdownMenuProps> = ({
  dropdownLabelName,
  items,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const closeDropdown = () => setIsOpen(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          className="inline-flex justify-center w-full rounded-md border border-gray-700 shadow-sm px-4 py-2 bg-[#1e2a3d] text-sm font-medium text-white hover:bg-[#2c3b55] focus:outline-none items-center"
          onClick={toggleDropdown}
        >
          {dropdownLabelName}
          <svg
            className="-mr-1 ml-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-[#1e2a3d] ring-1 ring-black ring-opacity-5 z-50">
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            {items.map((item, index) => {
              const Icon = item.itemIcon;
              const content = (
                <div className="flex items-center">
                  {Icon && (
                    <span className="mr-3">
                      {typeof Icon === "function" ? (
                        <Icon size={18} />
                      ) : (
                        Icon
                      )}
                    </span>
                  )}
                  <span>{item.itemTitle}</span>
                </div>
              );

              const className =
                "block px-4 py-2 text-sm text-gray-200 hover:bg-[#f61010] hover:text-white w-full text-left cursor-pointer transition-colors duration-150";

              if (item.url) {
                return (
                  <Link
                    key={index}
                    to={item.url}
                    className={className}
                    role="menuitem"
                    onClick={() => {
                      if (item.action) item.action();
                      closeDropdown();
                    }}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={index}
                  className={className}
                  role="menuitem"
                  onClick={() => {
                    if (item.action) item.action();
                    closeDropdown();
                  }}
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropDownMenu;
