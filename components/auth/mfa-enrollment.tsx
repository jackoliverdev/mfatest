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
  console.log("🚀 MFA ENROLLMENT COMPONENT LOADED");
  
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

  // Enhanced logging function
  const logDebug = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      message,
      data: data || {},
      user: user?.email || 'not-logged-in',
      step,
      phoneNumber: phoneNumber || 'not-set'
    };
    
    console.log(`🔍 MFA Debug [${timestamp}]:`, message, data);
    
    // Also log to a global array for easier debugging
    if (typeof window !== 'undefined') {
      if (!(window as any).mfaDebugLogs) {
        (window as any).mfaDebugLogs = [];
      }
      (window as any).mfaDebugLogs.push(logEntry);
    }
  };

  useEffect(() => {
    if (user) {
      logDebug("User loaded", { 
        email: user.email, 
        emailVerified: user.emailVerified,
        uid: user.uid
      });
      
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

    logDebug("Initializing reCAPTCHA verifier");
    
    const recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha-container",
      {
        size: "normal",
        callback: (response: any) => {
          logDebug("reCAPTCHA solved", { response });
        },
        "expired-callback": () => {
          logDebug("reCAPTCHA expired, recreating...");
          setVerifier(null);
        },
      },
      auth
    );

    setVerifier(recaptchaVerifier);
    
    recaptchaVerifier.render().then(() => {
      logDebug("reCAPTCHA rendered successfully");
    }).catch((error) => {
      logDebug("reCAPTCHA render failed", { error: error.message, code: error.code });
    });

    return () => {
      logDebug("Cleaning up reCAPTCHA");
      recaptchaVerifier.clear();
    };
  }, [step, auth]);

  const sendEmailVerificationCode = async () => {
    if (!user) return;

    try {
      logDebug("Starting email verification");
      setIsLoading(true);
      
      await sendEmailVerification(user);
      
      logDebug("Email verification sent successfully");
      toast({
        title: "Verification Email Sent!",
        description: "Please check your email and click the verification link.",
      });
      
    } catch (error: any) {
      logDebug("Email verification failed", { 
        error: error.message, 
        code: error.code,
        stack: error.stack 
      });
      
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
      logDebug("Checking email verification status");
      setIsLoading(true);
      
      await user.reload();
      
      logDebug("Email verification status checked", { 
        emailVerified: user.emailVerified 
      });
      
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
      logDebug("Email verification check failed", { 
        error: error.message, 
        code: error.code 
      });
      
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
      logDebug("Starting re-authentication", { email: user.email });
      setIsLoading(true);
      
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      
      logDebug("Re-authentication successful");
      toast({
        title: "Re-authentication Successful",
        description: "You can now proceed with MFA setup.",
      });
      
      setStep("phone");
      setPassword("");
    } catch (error: any) {
      logDebug("Re-authentication failed", { 
        error: error.message, 
        code: error.code,
        email: user.email 
      });
      
      toast({
        title: "Re-authentication Failed",
        description: error.message || "Please check your password and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendVerificationCode = async () => {
    console.log("🔥 SEND VERIFICATION CODE FUNCTION CALLED");
    
    if (!user) {
      console.log("❌ NO USER FOUND");
      logDebug("No user found");
      return;
    }

    if (!user.emailVerified) {
      console.log("❌ EMAIL NOT VERIFIED");
      logDebug("Email not verified");
      toast({
        title: "Email Not Verified",
        description: "Please verify your email first.",
      });
      setStep("email-verify");
      return;
    }

    if (!verifier) {
      console.log("❌ NO RECAPTCHA VERIFIER");
      logDebug("reCAPTCHA verifier not initialized");
      toast({
        title: "Error",
        description: "reCAPTCHA is not ready. Please wait a moment and try again.",
      });
      return;
    }
    
    try {
      console.log("🚀 STARTING SMS VERIFICATION PROCESS");
      logDebug("Starting SMS verification process", {
        phoneNumber,
        userEmail: user.email,
        userUid: user.uid,
        emailVerified: user.emailVerified
      });
      
      setIsLoading(true);
      
      logDebug("Getting multi-factor session");
      const multiFactorSession = await multiFactor(user).getSession();
      
      logDebug("Multi-factor session obtained", {
        sessionId: multiFactorSession ? 'present' : 'null'
      });
      
      const phoneInfoOptions = {
        phoneNumber: phoneNumber,
        session: multiFactorSession,
      };
      
      logDebug("Phone info options prepared", phoneInfoOptions);

      const phoneAuthProvider = new PhoneAuthProvider(auth);
      
      logDebug("Starting phone number verification", {
        phoneNumber,
        verifierType: verifier.constructor.name
      });
      
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        phoneInfoOptions,
        verifier
      );

      logDebug("Phone verification successful", { verificationId });
      
      setVerificationId(verificationId);
      setStep("code");
      toast({
        title: "SMS Sent!",
        description: "Please check your phone for the verification code.",
      });
      
    } catch (error: any) {
      console.log("💥 SMS VERIFICATION FAILED - BASIC ERROR LOG:");
      console.log(error);
      console.log("Error message:", error.message);
      console.log("Error code:", error.code);
      
      logDebug("SMS verification failed", { 
        error: error.message, 
        code: error.code,
        stack: error.stack,
        phoneNumber,
        userEmail: user.email,
        // Additional debugging info
        authDomain: auth.config?.authDomain,
        apiKey: auth.config?.apiKey?.substring(0, 10) + '...'
      });
      
      // Also log the full error object for debugging
      console.error("Full error object:", error);
      
      if (error.code === "auth/requires-recent-login") {
        logDebug("Recent login required, redirecting to reauth");
        toast({
          title: "Re-authentication Required",
          description: "Please enter your password to continue with MFA setup.",
        });
        setStep("reauth");
      } else if (error.code === "auth/unverified-email") {
        logDebug("Email not verified, redirecting to email verification");
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
      logDebug("Missing user or verification ID", { 
        hasUser: !!user, 
        hasVerificationId: !!verificationId 
      });
      return;
    }

    try {
      logDebug("Starting MFA enrollment", {
        verificationId,
        verificationCode,
        userEmail: user.email
      });
      
      setIsLoading(true);
      
      const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
      logDebug("Phone credential created");
      
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
      logDebug("Multi-factor assertion created");
      
      await multiFactor(user).enroll(multiFactorAssertion, "Personal Phone");
      
      logDebug("MFA enrollment successful");
      
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
      logDebug("MFA enrollment failed", { 
        error: error.message, 
        code: error.code,
        stack: error.stack,
        verificationId,
        verificationCode: verificationCode ? 'present' : 'missing'
      });
      
      toast({
        title: "Error",
        description: `Failed to enable MFA: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add a debug info display for development
  const showDebugInfo = () => {
    if (typeof window !== 'undefined' && (window as any).mfaDebugLogs) {
      console.table((window as any).mfaDebugLogs);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Enable Two-Factor Authentication</CardTitle>
        <CardDescription>
          Add your phone number for extra security
        </CardDescription>
        {/* Debug button - remove in production */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={showDebugInfo}
          className="mt-2"
        >
          Show Debug Logs
        </Button>
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