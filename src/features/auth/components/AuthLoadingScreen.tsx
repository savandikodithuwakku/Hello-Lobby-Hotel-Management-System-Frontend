/** Full-page spinner shown while a route guard resolves the session. */
const AuthLoadingScreen = ({ message = "Loading..." }: { message?: string }) => (
  <div className="flex min-h-screen items-center justify-center bg-canvas">
    <Spinner message={message} />
  </div>
);

/** The same spinner, for use inside a card that is already on screen. */
export const Spinner = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center">
    <div className="size-12 animate-spin rounded-full border-[3px] border-line border-t-brand" />
    <p className="mt-4 text-[0.95rem] font-medium text-ink-muted">{message}</p>
  </div>
);

export default AuthLoadingScreen;
