import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export const sessionOptions = {
    password: process.env.SECRET_COOKIE_PASSWORD || "complex_password_at_least_32_characters_long_for_vk_spine_app",
    cookieName: "medistock_session",
    cookieOptions: {
        secure: process.env.NODE_ENV === "production",
    },
};

export interface SessionData {
    isLoggedIn: boolean;
    username: string;
}

export const defaultSession: SessionData = {
    isLoggedIn: false,
    username: "",
};

export async function getSession() {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore as any, sessionOptions);

    if (!session.isLoggedIn) {
        session.isLoggedIn = defaultSession.isLoggedIn;
        session.username = defaultSession.username;
    }

    return session;
}
