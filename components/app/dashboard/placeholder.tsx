import React from "react";

export default function DashboardPlaceholder() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-2">Tile 1</h3>
        <p className="text-2xl font-bold">Placeholder</p>
        <span className="text-muted-foreground mt-1">Professional insight</span>
      </div>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-2">Tile 2</h3>
        <p className="text-2xl font-bold">Placeholder</p>
        <span className="text-muted-foreground mt-1">Business metric</span>
      </div>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-2">Tile 3</h3>
        <p className="text-2xl font-bold">Placeholder</p>
        <span className="text-muted-foreground mt-1">Key statistic</span>
      </div>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-2">Tile 4</h3>
        <p className="text-2xl font-bold">Placeholder</p>
        <span className="text-muted-foreground mt-1">Marketing value</span>
      </div>
    </div>
  );
} 