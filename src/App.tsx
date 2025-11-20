import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { ProjectList } from "./components/ProjectList";
import { CreateProjectModal } from "./components/CreateProjectModal";
import { CreateProjectTab } from "./components/CreateProjectTab";
import { useState, useEffect } from "react";
import { RegisterForm } from "./RegisterForm";
import { ProfilePage } from "./ProfilePage";
import { InviteTeamModal, AcceptInviteModal, TeamMembersList } from "./components";

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfilePage, setShowProfilePage] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Update theme when it changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen relative">
      {/* Background grid pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] dark:bg-dark-900"></div>
      
      <Authenticated>
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-dark-700 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                Coti
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-slate-100 dark:bg-dark-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-dark-600 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              {/* Profile Button */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-100 dark:bg-dark-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-dark-600 transition-colors"
                  aria-label="User profile"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    U
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Profile Dropdown Menu */}
                {showProfileMenu && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-slate-200 dark:border-dark-700 py-1 z-20"
                    onMouseLeave={() => setShowProfileMenu(false)}
                  >
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors"
                      onClick={() => {
                        setShowProfilePage(true);
                        setShowProfileMenu(false);
                      }}
                    >
                      View Profile
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors">
                      Account Settings
                    </button>
                    <div className="border-t border-slate-100 dark:border-dark-700 my-1"></div>
                    <SignOutButton />
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
      </Authenticated>

      <main className="max-w-6xl mx-auto px-4 py-8 pb-20 md:pb-8">
        <Content />
      </main>

      {/* Profile Page Modal */}
      {showProfilePage && (
        <ProfilePage onClose={() => setShowProfilePage(false)} />
      )}

      <Toaster position="top-right" />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const [authView, setAuthView] = useState<"signIn" | "signUp">("signIn");
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'account' | 'create'>('overview');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteToken, setInviteToken] = useState<string | null>(null);

  // Handle invite links from URL
  useEffect(() => {
    const path = window.location.pathname;
    const inviteMatch = path.match(/\/invite\/([^/]+)/);

    if (inviteMatch) {
      const token = inviteMatch[1];

      // If user is authenticated, show the modal
      if (loggedInUser) {
        setInviteToken(token);
      } else {
        // Store token for after authentication
        sessionStorage.setItem('pendingInviteToken', token);
      }

      // Clean up URL
      window.history.replaceState({}, '', '/');
    }

    // Check for pending invite after authentication
    if (loggedInUser && !inviteToken) {
      const pendingToken = sessionStorage.getItem('pendingInviteToken');
      if (pendingToken) {
        setInviteToken(pendingToken);
        sessionStorage.removeItem('pendingInviteToken');
      }
    }
  }, [loggedInUser, inviteToken]);

  const projects = useQuery(api.projects.list);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Unauthenticated>
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="text-center space-y-6 w-full max-w-md">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                Track Your Progress
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Create projects, add sequential steps, and watch your progress unfold step by step.
              </p>
            </div>
            {authView === "signIn" ? (
              <SignInForm onSwitchToSignUp={() => setAuthView("signUp")} />
            ) : (
              <RegisterForm onSwitchToSignIn={() => setAuthView("signIn")} />
            )}
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Beautiful Sidebar */}
          <div className="hidden md:block md:fixed md:left-0 md:top-16 md:bottom-0 md:w-16 bg-white dark:bg-dark-800 rounded-xl md:rounded-none md:shadow-none border border-slate-200 dark:border-dark-700 md:border-0 p-2 h-fit md:h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="space-y-2 flex flex-col items-center py-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-blue-50 dark:bg-dark-700 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-700'}`}
                title="Overview"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </button>

              <button
                onClick={() => setActiveTab('create')}
                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${activeTab === 'create' ? 'bg-blue-50 dark:bg-dark-700 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-700'}`}
                title="Create"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>

              <button
                onClick={() => setActiveTab('team')}
                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${activeTab === 'team' ? 'bg-blue-50 dark:bg-dark-700 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-700'}`}
                title="Team"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>

              <button
                onClick={() => setActiveTab('account')}
                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${activeTab === 'account' ? 'bg-blue-50 dark:bg-dark-700 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-700'}`}
                title="Account"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Bottom Navigation */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-800 border-t border-slate-200 dark:border-dark-700 flex justify-around py-2 z-20">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex flex-col items-center gap-1 px-4 py-2 ${activeTab === 'overview' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-xs">Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('create')}
              className={`flex flex-col items-center gap-1 px-4 py-2 ${activeTab === 'create' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs">Create</span>
            </button>

            <button
              onClick={() => setActiveTab('team')}
              className={`flex flex-col items-center gap-1 px-4 py-2 ${activeTab === 'team' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-xs">Team</span>
            </button>

            <button
              onClick={() => setActiveTab('account')}
              className={`flex flex-col items-center gap-1 px-4 py-2 ${activeTab === 'account' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs">Account</span>
            </button>
          </div>

          {/* Main Content Area */}
          <div className="md:ml-16 flex-1 w-full">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                      Welcome back, {loggedInUser?.name || loggedInUser?.email?.split('@')[0] || 'there'}!
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 mt-1">
                      Continue making progress on your projects
                    </p>
                  </div>
                </div>

                <ProjectList />
              </div>
            )}

            {activeTab === 'create' && <CreateProjectTab />}

            {activeTab === 'team' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Team Management</h2>
                    <p className="text-slate-600 dark:text-slate-300 mt-1">
                      Manage team members and collaborate on projects
                    </p>
                  </div>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Invite Team Members
                  </button>
                </div>

                {/* Projects with team members */}
                <div className="space-y-6">
                  {projects?.filter(p => p.role === "owner").map((project) => (
                    <div key={project._id} className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: project.color }}
                        >
                          {project.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800 dark:text-slate-200">{project.name}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Your Project</p>
                        </div>
                      </div>
                      <TeamMembersList projectId={project._id} isOwner={true} />
                    </div>
                  ))}

                  {/* Projects where user is a member */}
                  {projects && projects.filter(p => p.role === "member").length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Shared With You</h3>
                      {projects?.filter(p => p.role === "member").map((project) => (
                        <div key={project._id} className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700 p-6 mb-4">
                          <div className="flex items-center gap-3 mb-4">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: project.color }}
                            >
                              {project.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-800 dark:text-slate-200">{project.name}</h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {project.permission === "modify" ? "Can Modify" : "View Only"}
                              </p>
                            </div>
                          </div>
                          <TeamMembersList projectId={project._id} isOwner={false} />
                        </div>
                      ))}
                    </div>
                  )}

                  {(!projects || projects.length === 0) && (
                    <div className="text-center py-12">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">No Projects Yet</h3>
                      <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                        Create a project to start collaborating with your team.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700 p-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Account Settings</h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                      {loggedInUser?.name?.charAt(0) || loggedInUser?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200">{loggedInUser?.name || loggedInUser?.email?.split('@')[0]}</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">{loggedInUser?.email}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 dark:border-dark-700 pt-6">
                    <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-4">Profile Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                        <input
                          type="text"
                          defaultValue={loggedInUser?.name || ''}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                        <input
                          type="email"
                          defaultValue={loggedInUser?.email || ''}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>
                    <button className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {showInviteModal && (
          <InviteTeamModal onClose={() => setShowInviteModal(false)} />
        )}

        {inviteToken && loggedInUser && (
          <AcceptInviteModal
            invitationToken={inviteToken}
            onClose={() => setInviteToken(null)}
            onAccept={() => {
              setInviteToken(null);
              setActiveTab('team');
            }}
          />
        )}

      </Authenticated>
    </div>
  );
}