"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useEffect } from "react";
import {
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendEmailVerification,
} from "firebase/auth";
import { useAuth, useUser } from "reactfire";

export const MFAEnrollment = () => {
  const auth = useAuth();
  const { data: user } = useUser();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"email-verify" | "phone" | "code" | "reauth">("email-verify");
  const [password, setPassword] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifier, setVerifier] = useState<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (user) {
      console.log("👤 User email verified:", user.emailVerified);
      setEmailVerified(user.emailVerified);
      if (user.emailVerified) {
        setStep("phone");
      } else {
        setStep("email-verify");
      }
    }
  }, [user]);

  useEffect(() => {
    if (step !== "phone") {
      return;
    }

    console.log("🔧 Initializing reCAPTCHA in useEffect...");
    const recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha-container",
      {
        size: "normal",
        callback: () => {
          console.log("✅ reCAPTCHA solved!");
        },
        "expired-callback": () => {
          console.log("⚠️ reCAPTCHA expired, recreating...");
          setVerifier(null);
        },
      },
      auth
    );

    setVerifier(recaptchaVerifier);
    recaptchaVerifier.render();

    return () => {
      console.log("🧹 Clearing reCAPTCHA on unmount or step change");
      recaptchaVerifier.clear();
    };
  }, [step, auth]);

  const sendEmailVerificationCode = async () => {
    if (!user) return;

    try {
      console.log("📧 Sending email verification...");
      setIsLoading(true);
      
      await sendEmailVerification(user);
      
      toast({
        title: "Verification Email Sent!",
        description: "Please check your email and click the verification link.",
      });
      
      console.log("✅ Email verification sent");
    } catch (error: any) {
      console.error("❌ Error sending email verification:", error);
      toast({
        title: "Error",
        description: `Failed to send verification email: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkEmailVerification = async () => {
    if (!user) return;

    try {
      console.log("🔄 Checking email verification status...");
      setIsLoading(true);
      
      // Reload user to get latest verification status
      await user.reload();
      
      console.log("📧 Email verified:", user.emailVerified);
      
      if (user.emailVerified) {
        setEmailVerified(true);
        setStep("phone");
        toast({
          title: "Email Verified!",
          description: "You can now set up MFA.",
        });
      } else {
        toast({
          title: "Email Not Verified",
          description: "Please click the verification link in your email.",
        });
      }
    } catch (error: any) {
      console.error("❌ Error checking email verification:", error);
      toast({
        title: "Error",
        description: "Failed to check verification status.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const reauthenticateUser = async () => {
    if (!user || !user.email) return;

    try {
      console.log("🔐 Starting re-authentication for user:", user.email);
      setIsLoading(true);
      
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      
      console.log("✅ Re-authentication successful");
      toast({
        title: "Re-authentication Successful",
        description: "You can now proceed with MFA setup.",
      });
      
      setStep("phone");
      setPassword("");
    } catch (error: any) {
      console.error("❌ Re-authentication failed:", error);
      toast({
        title: "Re-authentication Failed",
        description: error.message || "Please check your password and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendVerificationCode = async () => {
    if (!user) {
      console.error("❌ No user found");
      return;
    }

    if (!user.emailVerified) {
      console.error("❌ Email not verified");
      toast({
        title: "Email Not Verified",
        description: "Please verify your email first.",
      });
      setStep("email-verify");
      return;
    }

    if (!verifier) {
      console.error("❌ reCAPTCHA verifier not initialized");
      toast({
        title: "Error",
        description: "reCAPTCHA is not ready. Please wait a moment and try again.",
      });
      return;
    }
    
    try {
      console.log("📱 Starting SMS verification process...");
      console.log("👤 User:", user.email);
      console.log("📞 Phone number:", phoneNumber);
      
      setIsLoading(true);
      
      console.log("🔄 Getting multi-factor session...");
      const multiFactorSession = await multiFactor(user).getSession();
      console.log("✅ Multi-factor session obtained:", multiFactorSession);
      
      const phoneInfoOptions = {
        phoneNumber: phoneNumber,
        session: multiFactorSession,
      };
      console.log("📋 Phone info options:", phoneInfoOptions);

      console.log("🔄 Creating PhoneAuthProvider...");
      const phoneAuthProvider = new PhoneAuthProvider(auth);
      
      console.log("🔄 Verifying phone number...");
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        phoneInfoOptions,
        verifier
      );

      console.log("✅ Verification ID received:", verificationId);
      setVerificationId(verificationId);
      setStep("code");
      toast({
        title: "SMS Sent!",
        description: "Please check your phone for the verification code.",
      });
    } catch (error: any) {
      console.error("❌ Error sending SMS:", error);
      console.error("❌ Error code:", error.code);
      console.error("❌ Error message:", error.message);
      console.error("❌ Full error:", error);
      
      if (error.code === "auth/requires-recent-login") {
        console.log("🔐 User needs to re-authenticate");
        toast({
          title: "Re-authentication Required",
          description: "Please enter your password to continue with MFA setup.",
        });
        setStep("reauth");
      } else if (error.code === "auth/unverified-email") {
        console.log("📧 Email not verified");
        toast({
          title: "Email Not Verified",
          description: "Please verify your email first.",
        });
        setStep("email-verify");
      } else {
        toast({
          title: "Error",
          description: `Failed to send SMS: ${error.message}`,
        });
      }
      
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAndEnroll = async () => {
    if (!user || !verificationId) {
      console.error("❌ Missing user or verification ID");
      return;
    }

    try {
      console.log("🔄 Starting MFA enrollment...");
      console.log("📞 Verification ID:", verificationId);
      console.log("🔢 Verification code:", verificationCode);
      
      setIsLoading(true);
      
      console.log("🔄 Creating phone credential...");
      const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
      console.log("✅ Phone credential created");
      
      console.log("🔄 Creating multi-factor assertion...");
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
      console.log("✅ Multi-factor assertion created");
      
      console.log("🔄 Enrolling MFA...");
      await multiFactor(user).enroll(multiFactorAssertion, "Personal Phone");
      console.log("✅ MFA enrollment successful!");
      
      toast({
        title: "MFA Enabled!",
        description: "Your phone number has been added as a second factor.",
      });
      
      // Reset form
      setPhoneNumber("");
      setVerificationCode("");
      setVerificationId("");
      setStep("phone");
    } catch (error: any) {
      console.error("❌ Error enrolling MFA:", error);
      console.error("❌ Error code:", error.code);
      console.error("❌ Error message:", error.message);
      toast({
        title: "Error",
        description: `Failed to enable MFA: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Enable Two-Factor Authentication</CardTitle>
        <CardDescription>
          Add your phone number for extra security
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === "email-verify" ? (
          <>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                You need to verify your email address before setting up MFA.
              </p>
              <p className="text-sm font-medium">
                Email: {user?.email}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={sendEmailVerificationCode}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Sending..." : "Send Verification Email"}
              </Button>
              <Button
                variant="outline"
                onClick={checkEmailVerification}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Checking..." : "I've Verified"}
              </Button>
            </div>
          </>
        ) : step === "reauth" ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                Please enter your password to continue with MFA setup
              </p>
            </div>
            <Button
              onClick={reauthenticateUser}
              disabled={isLoading || !password}
              className="w-full"
            >
              {isLoading ? "Authenticating..." : "Authenticate"}
            </Button>
          </>
        ) : step === "phone" ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+447534747480"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                Include country code (e.g., +44 for UK)
              </p>
            </div>
            <Button
              onClick={sendVerificationCode}
              disabled={isLoading || !phoneNumber || !verifier}
              className="w-full"
            >
              {isLoading ? "Sending..." : "Send Verification Code"}
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code sent to {phoneNumber}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep("phone")}
                disabled={isLoading}
                className="w-full"
              >
                Back
              </Button>
              <Button
                onClick={verifyAndEnroll}
                disabled={isLoading || !verificationCode}
                className="w-full"
              >
                {isLoading ? "Verifying..." : "Enable MFA"}
              </Button>
            </div>
          </>
        )}
        <div id="recaptcha-container"></div>
      </CardContent>
    </Card>
  );
}; 