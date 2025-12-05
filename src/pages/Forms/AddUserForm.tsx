import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import UserInputs from "../../components/form/form-elements/UserInputs.tsx";

export default function AddUserFormElements() {
  return (
    <div>
      <PageMeta
        title="academiapro | Admin"
        description="Opération Fluidité Routière Agro-bétail"
      />
      <PageBreadcrumb pageTitle="Ajouter un utilisateur" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-1">
        <div className="space-y-12">
          <UserInputs />
        </div>

      </div>
    </div>
  );
}
