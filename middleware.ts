import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    /*
     * Protege todas as rotas exceto:
     * - login
     * - api/auth (callbacks do NextAuth)
     * - arquivos estáticos (_next, favicon, etc.)
     */
    "/((?!login|api/auth|_next|favicon.ico).*)",
  ],
};
