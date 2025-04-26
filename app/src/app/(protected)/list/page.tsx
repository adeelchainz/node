import { List } from "@/components/dynamic-table/list";
import { columns } from "@/components/dynamic-table/columns";
import { tasks } from "@/components/dynamic-table/data";

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Clickup-like Task Table</h1>
      <List initialTasks={tasks} initialColumns={columns} />
    </div>
  );
}
