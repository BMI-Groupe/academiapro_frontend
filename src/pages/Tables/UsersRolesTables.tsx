import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import UsersTableOne from "../../components/tables/BasicTables/UsersTableOne.tsx";
import UsersRolesTableOne from "../../components/tables/BasicTables/UsersRolesTableOne.tsx";

export default function UsersRolesTables() {
  return (
    <>
      <PageMeta
        title="academiapro | Admin"
        description="Opération Fluidité Routière Agro-bétail"
      />
      <PageBreadcrumb pageTitle="Rôles" />
      <div className="space-y-6">
        <ComponentCard title="Listes des rôles">
          <UsersRolesTableOne />
        </ComponentCard>
      </div>
    </>
  );
}
