import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Monitor, ShieldCheck, Trash2 } from "lucide-react";
import { ApiClientError } from "../../../shared/api/httpClient.ts";
import type { Session } from "../../../shared/api/types.ts";
import { buttonIcon, buttonSubmit } from "../../../shared/ui/styles.ts";
import { formatDateTime } from "../../../shared/ui/format.ts";
import { useAuth } from "../hooks/useAuth.ts";
import authApi from "../services/auth.api.ts";
import AuthCard, { AuthCardLink } from "../components/AuthCard.tsx";
import AlertMessage from "../components/AlertMessage.tsx";
import { Spinner } from "../components/AuthLoadingScreen.tsx";

/** Device management: shows every active session and lets the user revoke one. */
const SessionsPage = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const { logoutAllDevices } = useAuth();
  const navigate = useNavigate();

  // Starts in the loading state, so refetches (after a revoke) update the list
  // in place instead of flashing the spinner again.
  const loadSessions = useCallback(async () => {
    try {
      const response = await authApi.getSessions();
      setSessions(response.data.sessions);
      setError(null);
    } catch (apiError) {
      setError(apiError as ApiClientError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleRevoke = async (session: Session) => {
    setBusyId(session.id);
    try {
      await authApi.revokeSession(session.id);

      // Revoking the session in use is a sign-out of this browser.
      if (session.current) {
        navigate("/login", { replace: true, state: { message: "This device was signed out." } });
        return;
      }

      await loadSessions();
    } catch (apiError) {
      setError(apiError as ApiClientError);
    } finally {
      setBusyId(null);
    }
  };

  const handleSignOutEverywhere = async () => {
    await logoutAllDevices();
    navigate("/login", { replace: true, state: { message: "Signed out on all devices." } });
  };

  return (
    <AuthCard
      title="Active sessions"
      subtitle="Devices currently signed in to your account"
      footer={<AuthCardLink to="/">Back to dashboard</AuthCardLink>}
    >
      <AlertMessage message={error?.message} errors={error?.errors} />

      {loading ? (
        <Spinner message="Loading sessions..." />
      ) : (
        <ul className="mb-6 flex flex-col gap-3">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="flex items-center justify-between gap-4 border border-line bg-surface px-4 py-3.5 transition-colors duration-300 hover:bg-surface-hover"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <span className="inline-flex items-center gap-2 text-[0.95rem] font-semibold">
                  {session.current ? <ShieldCheck size={18} /> : <Monitor size={18} />}
                  {session.device}
                  {session.current && (
                    <span className="border border-success/25 bg-success/10 px-2 py-0.5 text-[0.7rem] font-semibold tracking-[0.04em] text-[#a7f3d0] uppercase">
                      This device
                    </span>
                  )}
                </span>
                <span className="text-[0.95rem] font-medium text-ink-muted">
                  {session.ipAddress || "Unknown IP"} &middot; last active{" "}
                  {formatDateTime(session.lastUsedAt)}
                </span>
              </div>
              <button
                type="button"
                className={buttonIcon}
                onClick={() => handleRevoke(session)}
                disabled={busyId === session.id}
                aria-label={`Revoke session on ${session.device}`}
              >
                <Trash2 size={18} />
              </button>
            </li>
          ))}
          {sessions.length === 0 && (
            <li className="text-[0.95rem] font-medium text-ink-muted">No active sessions found.</li>
          )}
        </ul>
      )}

      <button type="button" className={buttonSubmit} onClick={handleSignOutEverywhere}>
        <LogOut size={20} aria-hidden="true" /> Sign out on all devices
      </button>
    </AuthCard>
  );
};

export default SessionsPage;
