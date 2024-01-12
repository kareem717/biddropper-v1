import { buttonVariants } from "@/components/ui/button";

export default function CompanyPage() {
  return (
    <main>
      <div className="flex flex-row gap-4">
        <a href="/company/create" className={buttonVariants()}>
          Create
        </a>
      </div>
    </main>
  );
}
