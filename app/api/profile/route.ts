import { firebaseAdmin } from "@/lib/firebase-admin";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

async function getAuthenticatedUser(req: Request) {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
        throw new Error("Missing Authorization header");
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        throw new Error("Missing token");
    }
    return await firebaseAdmin.auth().verifyIdToken(token);
}

export async function GET(req: Request) {
    try {
        const decodedToken = await getAuthenticatedUser(req);
        const { uid } = decodedToken;

        const { data, error } = await supabaseAdmin
            .from("users")
            .select("*")
            .eq("firebase_uid", uid)
            .single();

        if (error) {
            if (error.code === 'PGRST116') { // PostgREST error for no rows found
                return new Response("User profile not found", { status: 404 });
            }
            throw error;
        }

        return NextResponse.json(data);
    } catch (error: any) {
        return new Response(error.message, { status: 401 });
    }
}

export async function POST(req: Request) {
    try {
        const decodedToken = await getAuthenticatedUser(req);
        const { uid } = decodedToken;
        const body = await req.json();

        // If disabling MFA, also remove all factors via Admin SDK
        if (body.mfa_enabled === false) {
            await firebaseAdmin.auth().updateUser(uid, {
                multiFactor: { enrolledFactors: [] }
            });
        }

        const { error } = await supabaseAdmin
            .from("users")
            .update(body)
            .eq("firebase_uid", uid);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return new Response(error.message, { status: 401 });
    }
} 