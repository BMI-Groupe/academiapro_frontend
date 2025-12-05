import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function AddReportFormElements() {
  return (
    <div>
      <PageMeta
        title="academiapro | Admin"
        description="Opération Fluidité Routière Agro-bétail"
      />
      <PageBreadcrumb pageTitle="Générer un rapport" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-1">
        <div className="space-y-12">
          {/*<UserInputs />*/}
        </div>

      </div>
    </div>
  );
}
