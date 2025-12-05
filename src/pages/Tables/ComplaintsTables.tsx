// src/pages/ComplaintsPage.tsx
import React, { useEffect } from 'react';
import ComplaintsTableOne from "../../components/tables/DataTables/ComplaintsTableOne.tsx";
import {useComplaint} from "../../providers/complaints/useComplaint.ts";
import PageMeta from "../../components/common/PageMeta.tsx";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne.tsx";

export default function ComplaintsTables() {
    const {
        complaints,
        totalPages,
        currentPage,
        loading,
        error,
        fetchComplaints,
    } = useComplaint();

    useEffect(() => {
        fetchComplaints().then(r => {
            console.log("Complaints Loaded")});
    }, []);

    const handlePageChange = (event: any) => {
        fetchComplaints(event.page + 1, event.rows).then(r => {
            console.log("Complaints Loaded" + (event.page + 1));
        });
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
            <PageBreadcrumb pageTitle="Plaintes" />
            <div className="space-y-6">
                <ComponentCard title="Liste des plaintes">
                    <ComplaintsTableOne
                        // @ts-ignore
                        data={complaints?.data || []}
                        totalRecords={complaints?.total || 0}
                        currentPage={currentPage}
                        loading={loading}
                        onPageChange={handlePageChange}
                    />
                </ComponentCard>
            </div>
        </>

    );
}