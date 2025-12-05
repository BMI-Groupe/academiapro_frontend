import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import UsersTableOne from "../../components/tables/BasicTables/UsersTableOne.tsx";

export default function UsersTables() {
  return (
    <>
      <PageMeta
        title="academiapro | Admin"
        description="Opération Fluidité Routière Agro-bétail"
      />
      <PageBreadcrumb pageTitle="Utilisateurs" />
      <div className="space-y-6">
        <ComponentCard title="Listes des utilisateurs">
          <UsersTableOne />
        </ComponentCard>
      </div>
    </>
  );
}
