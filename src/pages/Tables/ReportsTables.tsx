// src/pages/ComplaintsPage.tsx
import React, { useEffect } from 'react';
import ComplaintsTableOne from "../../components/tables/DataTables/ComplaintsTableOne.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import {useReports} from "../../context/ReportContext.tsx";
import ReportTableOne from "../../components/tables/BasicTables/ReportTableOne.tsx";

export default function ReportsTables() {
    const {
        reports,
        loading,
        error,
        fetchReports,
        currentPage,
        totalPages,
    } = useReports();

    useEffect(() => {
        fetchReports(currentPage);
    }, [currentPage, fetchReports]);

    if (loading) return <div className="text-orange-400">Chargement...</div>;
    if (error) return <div className="text-red-600">Erreur : {error}</div>;

    const handlePageChange = (event: any) => {
        fetchReports(event.page + 1, event.rows);
    };

    if (error) {
        return <div className="text-red-600">{error}</div>;
    }

    return (
        <>
            <PageMeta
                title="academiapro | Admin"
                description="Opération Fluidité Routière Agro-bétail"
            />
            <PageBreadcrumb pageTitle="Reportings" />
            <div className="space-y-6">
                <ComponentCard title="Liste des Rapports">
                    <ReportTableOne
                        // @ts-ignore
                        data={reports?.data || []}
                        totalRecords={reports?.total || 0}
                        currentPage={currentPage}
                        loading={loading}
                        onPageChange={handlePageChange}
                    />
                </ComponentCard>
            </div>
        </>

    );
}