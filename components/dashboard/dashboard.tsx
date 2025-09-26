'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { DashboardSidebar } from './dashboard-sidebar';
import { PersonalInformation } from './personal-information';
import { CompetitionRegistration } from './competition-registration';
import { CompetitionDetails } from './competition-details';
import { AdminDashboard } from './admin-dashboard';
import { AdminPanel } from './admin-panel';
import { BatchPricingManagement } from './batch-pricing-management';
import { UserDashboard } from './user-dashboard';
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Submissions } from '../Submissions';

interface DashboardProps {
  userData: any;
}

// --- PERUBAHAN 1: Tambahkan fungsi kalkulasi kelengkapan profil ---
// Fungsi ini diadaptasi dari personal-information.tsx untuk bekerja dengan data langsung dari server.
const calculateProfileCompletion = (userData: any) => {
  if (!userData || userData.role === 'admin') {
    // Admin dianggap selalu 100% atau tidak relevan
    return 100;
  }

  // Pastikan alamat adalah objek, bukan string JSON
  let addressData = userData.address;
  if (typeof addressData === 'string') {
    try {
      addressData = JSON.parse(addressData);
    } catch (e) {
      addressData = {}; // Jika parsing gagal, anggap sebagai objek kosong
    }
  }

  const requiredFields = [
    userData.full_name,
    userData.email,
    userData.phone,
    userData.date_of_birth,
    addressData?.street,
    addressData?.village,
    addressData?.district,
    addressData?.city,
    addressData?.province,
    userData.education_level,
    userData.gender,
  ];

  // Tambahkan 'school' jika jenjang pendidikan bukan 'umum'
  if (userData.education_level && userData.education_level !== 'umum') {
    requiredFields.push(userData.school);
  }

  const completedFields = requiredFields.filter(
    (field) => field && String(field).trim() !== ''
  ).length;
  
  return Math.round((completedFields / requiredFields.length) * 100);
};

export function Dashboard({
  userData: initialUserData,
}: DashboardProps) {
  const { data: session, status } = useSession();
  const [activeSection, setActiveSection] = useState(
    initialUserData?.role === 'admin'
      ? 'admin-overview'
      : 'user-overview'
  );
   const [registrations, setRegistrations] = useState([]);
   const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [nextSection, setNextSection] = useState<string | null>(null);

   useEffect(() => {
    // Fungsi untuk mengambil data registrasi
    const fetchRegistrations = async () => {
        // Hanya ambil data jika pengguna bukan admin
        if (initialUserData?.role !== 'admin') {
            try {
                const response = await fetch('/api/users/registrations');
                if (response.ok) {
                    const data = await response.json();
                    setRegistrations(data.registrations || []);
                }
            } catch (error) {
                console.error("Failed to fetch registrations:", error);
                setRegistrations([]); // Set ke array kosong jika gagal
            }
        }
    };

    fetchRegistrations();
}, [initialUserData?.role]);

// Di dalam Dashboard.tsx
useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
        if (hasUnsavedChanges) {
            event.preventDefault();
            event.returnValue = ''; // Diperlukan untuk browser modern
        }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
    };
}, [hasUnsavedChanges]); // Dijalankan ulang setiap kali status perubahan berubah

const handleSectionChange = (section: string) => {
    if (activeSection === 'personal' && hasUnsavedChanges) {
        setNextSection(section); // Simpan tujuan pengguna
        setIsModalOpen(true);    // Buka modal konfirmasi
    } else {
        setActiveSection(section); // Jika tidak ada perubahan, langsung pindah
    }
};

const handleConfirmNavigation = () => {
    if (nextSection) {
        setActiveSection(nextSection); // Pindah ke bagian yang dituju
        setHasUnsavedChanges(false);    // Reset status perubahan
    }
    setIsModalOpen(false);              // Tutup modal
    setNextSection(null);               // Reset tujuan
};

const handleCancelNavigation = () => {
    setIsModalOpen(false); // Cukup tutup modal
    setNextSection(null);  // Hapus tujuan yang tertunda
};

  // This component now receives userData directly from the server and does not manage its own state for it.
  // Updates to user data will need to trigger a re-fetch or server action from the parent Server Component.

 // --- PERUBAHAN 2: Hitung kelengkapan profil ---
  const profileCompletion = calculateProfileCompletion(initialUserData);

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
        return (
          <PersonalInformation
            userData={initialUserData}
            onUpdateUser={() => {}}
            onDirtyChange={setHasUnsavedChanges}
            registrations={registrations} // TODO: Implement user update logic or pass from parent
          />
        );
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
      case 'submissions':
        return <Submissions userData={initialUserData} />;
      case 'user-overview':
      default:
        return <UserDashboard userData={initialUserData} />;
    }
  };

  // Lomba yang wajib ada submisi
const submissionCompetitions = [
  "3d4e5cca-cf3d-45d7-8849-2a614b82f4d4", // Scientific Writing
  "43ec1f50-2102-4a4b-995b-e33e61505b22", // Science Project
  "331aeb0c-8851-4638-aa34-6502952f098b", // Depict Physics
];

const hasSubmissionAccess = registrations.some(
  (reg: any) =>
    reg.status === "approved" &&
    submissionCompetitions.includes(reg.competition_id)
);


  return (
    <div className="min-h-screen bg-black">
      {/* --- PERUBAHAN 3: Teruskan `profileCompletion` ke Sidebar --- */}
      <DashboardSidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        userData={initialUserData}
        profileCompletion={profileCompletion} // Prop baru ditambahkan di sini
        hasSubmissionAccess={hasSubmissionAccess}
      />
      <div className="lg:pl-80">
        <main className="p-6">{renderContent()}</main>
      </div>

      {/* Modal Konfirmasi Navigasi */}
      <ConfirmationDialog
            isOpen={isModalOpen}
            onClose={handleCancelNavigation}
            onConfirm={handleConfirmNavigation}
            title="Konfirmasi Pindah Halaman"
            description="Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin meninggalkan halaman ini? Perubahan Anda akan hilang. Jika Profil Dikunci tekan Ya, Tinggalkan"
            confirmText="Ya, Tinggalkan"
            cancelText="Batal"
            type="warning"
      />
    </div>
  );
}
