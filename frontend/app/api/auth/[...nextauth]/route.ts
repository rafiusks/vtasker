import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth" {
	interface Session {
		accessToken?: string;
	}
	interface User {
		accessToken?: string;
	}
	interface JWT {
		accessToken?: string;
	}
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				try {
					const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							email: credentials.email,
							password: credentials.password,
						}),
					});

					if (!response.ok) {
						return null;
					}

					const data = await response.json();
					return {
						id: data.user.id,
						email: data.user.email,
						name: data.user.name,
						accessToken: data.token,
					};
				} catch (error) {
					console.error("Auth error:", error);
					return null;
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.accessToken = user.accessToken;
			}
			return token;
		},
		async session({ session, token }) {
			if (token.accessToken) {
				session.accessToken = token.accessToken as string;
			}
			return session;
		},
	},
	pages: {
		signIn: "/auth/sign-in",
	},
	session: {
		strategy: "jwt",
	},
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
