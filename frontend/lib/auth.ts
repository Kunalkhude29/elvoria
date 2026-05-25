export type AuthSession = {
    token: string;
};

export async function getAuthSession(): Promise<AuthSession | null> {
    if (typeof window === 'undefined') {
        return null;
    }

    const token = localStorage.getItem('token');

    if (!token) {
        return null;
    }

    return {
        token
    };
}

export async function getAuthorizedHeaders(
    headers: HeadersInit = {}
): Promise<Record<string, string>> {
    const session = await getAuthSession();
    const normalizedHeaders = Object.fromEntries(new Headers(headers).entries());

    if (!session) {
        return normalizedHeaders;
    }

    return {
        ...normalizedHeaders,
        Authorization: `Bearer ${session.token}`,
    };
}
