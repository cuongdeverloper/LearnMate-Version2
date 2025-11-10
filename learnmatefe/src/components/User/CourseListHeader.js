import { Search } from "lucide-react";
import React from "react";

import Input from "../ui/Input";

const CourseListHeader = ({
  searchQuery,
  onSearchChange,
  currentFilter,
  onFilterChange,
  currentSort,
  onSortChange,
}) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">
        Các khóa học của tôi
      </h1>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by course name"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 py-2 h-10"
            />
          </div>
        </div>
        <div className="flex gap-2"></div>
      </div>
    </div>
  );
};

export default CourseListHeader;
