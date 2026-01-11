import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation";

export default function Home() {
  redirect('/pengguna')
  return (
    <div>
      <Button>Click me</Button>
    </div>
  );
}
