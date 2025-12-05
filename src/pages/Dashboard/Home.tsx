import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import SchoolOverview from "../../components/school/SchoolOverview";
import CountsGrid from "../../components/school/CountsGrid";
import RecentEnrollments from "../../components/school/RecentEnrollments";
import UpcomingSchedules from "../../components/school/UpcomingSchedules";
import PageMeta from "../../components/common/PageMeta";
import useAuth from "../../providers/auth/useAuth.ts";
import {useEffect} from "react";

export default function Home() {

  // @ts-ignore
  const { userInfo, userData , authMe } = useAuth();

  useEffect(() => {
    authMe(userInfo.id);
    console.log(localStorage.getItem('lang'));
  }, []);

  return (
    <>
      <PageMeta
        title="academiapro | Admin"
        description="Opération Fluidité Routière Agro-bétail"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-5">
          <SchoolOverview />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <CountsGrid />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <RecentEnrollments />
        </div>

        <div className="col-span-12 space-y-6 xl:col-span-7">
          <UpcomingSchedules />
        </div>

        {/* Statistiques */}
        <div className="col-span-12">
          <StatisticsChart />
        </div>

      </div>
    </>
  );
}
