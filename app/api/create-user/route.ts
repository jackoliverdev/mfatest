import { firebaseAdmin } from "@/lib/firebase-admin";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token } = await req.json();

  if (!token) {
    return new Response("Missing token", { status: 400 });
  }

  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    const { uid, email } = decodedToken;

    const { error } = await supabaseAdmin
      .from("users")
      .insert({ firebase_uid: uid, email });

    if (error) {
      console.error("Supabase error:", error.message);
      return new Response(error.message, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Firebase error:", error.message);
    return new Response(error.message, { status: 500 });
  }
} 