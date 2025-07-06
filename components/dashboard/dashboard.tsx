'use client';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { DashboardSidebar } from './dashboard-sidebar';
import { PersonalInformation } from './personal-information';
import { CompetitionRegistration } from './competition-registration';
import { CompetitionDetails } from './competition-details';
import { AdminDashboard } from './admin-dashboard';
import { AdminPanel } from './admin-panel';
import { BatchPricingManagement } from './batch-pricing-management';
import { UserDashboard } from './user-dashboard';

interface DashboardProps {
  userData: any;
}

export function Dashboard({
  userData: initialUserData,
}: DashboardProps) {
  const { data: session, status } = useSession();
  const [activeSection, setActiveSection] = useState(
    initialUserData?.role === 'admin'
      ? 'admin-overview'
      : 'user-overview'
  );

  // This component now receives userData directly from the server and does not manage its own state for it.
  // Updates to user data will need to trigger a re-fetch or server action from the parent Server Component.

  const handleRegisterCompetition = (
    competitionId: string,
    batch: number
  ) => {
    console.log('Competition registered:', { competitionId, batch });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Akses Ditolak</h1>
          <p>Silakan login untuk mengakses dashboard</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      // --- KEY CHANGE 3: Pass the local handleUserUpdate to the form ---
      case 'personal':
        return <PersonalInformation userData={initialUserData} />;
      case 'registration':
        return (
          <CompetitionRegistration
            userData={initialUserData}
            onRegisterCompetition={handleRegisterCompetition}
          />
        );
      case 'details':
        return <CompetitionDetails userData={initialUserData} />;
      case 'admin-overview':
        return <AdminDashboard userData={initialUserData} />;
      case 'user-management':
        return <AdminPanel userData={initialUserData} />;
      case 'batch-pricing-management':
        return <BatchPricingManagement userData={initialUserData} />;
      case 'user-overview':
      default:
        return <UserDashboard userData={initialUserData} />;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <DashboardSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        userData={initialUserData}
      />
      <div className="lg:pl-80">
        <main className="p-6">{renderContent()}</main>
      </div>
    </div>
  );
}
