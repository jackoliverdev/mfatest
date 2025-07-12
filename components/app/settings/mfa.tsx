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
import { useState, useEffect, useMemo } from "react";
import {
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendEmailVerification,
  PhoneMultiFactorInfo,
} from "firebase/auth";
import { useAuth, useUser } from "reactfire";
import { CheckCircle, ShieldAlert } from "lucide-react";
import { UserProfile } from "@/lib/types";
import { useRouter } from "next/navigation";


export const MFASettings = () => {
  const auth = useAuth();
  const { data: user } = useUser();
  const router = useRouter();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationId, setVerificationId] = useState("");
  
  const [password, setPassword] = useState("");
  const [action, setAction] = useState<"enroll" | "unenroll" | null>(null);
  
  const [step, setStep] = useState<"manage" | "enroll-phone" | "enroll-code" | "reauth">("manage");
  const [verifier, setVerifier] = useState<RecaptchaVerifier | null>(null);
  // Add a state to track if reCAPTCHA is solved
  const [recaptchaSolved, setRecaptchaSolved] = useState(false);
  // Add a state to track the pending action for re-auth
  const [pendingAction, setPendingAction] = useState<null | (() => Promise<void>)>(null);

  const enrolledFactors = useMemo(() => {
    return (user as any)?.multiFactor?.enrolledFactors as PhoneMultiFactorInfo[] | undefined;
  }, [user]);

  useEffect(() => {
    if (!user) {
        setIsLoading(false);
        return;
    };
    
    const fetchInitialData = async () => {
        try {
            setIsLoading(true);
            // Reload user to ensure MFA data is up to date from Firebase
            await user.reload();

            // Fetch profile data from our backend (which uses Supabase)
            const token = await user.getIdToken();
            const res = await fetch("/api/profile", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
            } else {
                console.error("Error fetching mfa status", await res.text());
                toast({ title: "Error", description: "Could not fetch your profile settings." });
            }
        } catch (error: any) {
            console.error("Error fetching initial data", error);
            toast({ title: "Error", description: `An error occurred: ${error.message}` });
        } finally {
            setIsLoading(false);
        }
    };

    fetchInitialData();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // This effect now primarily manages the view based on authentication state,
    // not automatically transitioning to enrollment. The user initiates enrollment.
    if (step === 'enroll-code' || step === 'enroll-phone' || step === 'reauth') {
      // Don't change step if in the middle of a flow
      return;
    }

    setStep("manage");
    
  }, [user, enrolledFactors, step]);

  // This effect manages the RecaptchaVerifier lifecycle
  useEffect(() => {
    if (step !== 'enroll-phone') {
      if (verifier) {
        verifier.clear();
        setVerifier(null);
      }
      setRecaptchaSolved(false); // Reset when leaving step
      return;
    }

    if (!verifier) {
      const newVerifier = new RecaptchaVerifier('recaptcha-container', {
        size: 'normal',
        callback: () => {
          setRecaptchaSolved(true);
          toast({ title: "reCAPTCHA complete", description: "You may now enter your phone number." });
        },
        'expired-callback': () => {
          setRecaptchaSolved(false);
          toast({ title: "reCAPTCHA expired", description: "Please complete the challenge again." });
        }
      }, auth);
      newVerifier.render();
      setVerifier(newVerifier);
    }
  }, [step, auth]);

  const sendEmailVerificationCode = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      await sendEmailVerification(user);
      toast({
        title: "Verification Email Sent!",
        description: "Please check your email and click the verification link.",
      });
    } catch (error: any) {
      toast({ title: "Error", description: `Failed to send verification email: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await user.reload();
      // The useUser hook will trigger a re-render with the updated user object
      if (auth.currentUser?.emailVerified) {
        toast({
          title: "Email Verified!",
          description: "You can now proceed to enable Two-Factor Authentication.",
        });
      } else {
        toast({
          title: "Email Not Verified",
          description: "Please check your inbox for the verification link.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({ title: "Error", description: `Failed to check verification status: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  // Refactor reauthenticateUser to retry the pending action after successful re-auth
  const reauthenticateUser = async () => {
    if (!user || !user.email || !pendingAction) return;
    try {
      setIsLoading(true);
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      toast({ title: "Re-authentication Successful" });
      setStep("manage");
      setPassword("");
      setAction(null);
      setPendingAction(null);
      await pendingAction(); // Retry the original action
    } catch (error: any) {
      toast({ title: "Re-authentication Failed", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Update sendVerificationCode to only prompt for password if needed
  const sendVerificationCode = async () => {
    if (!user || !verifier) return;
    try {
      setIsLoading(true);
      const multiFactorSession = await multiFactor(user).getSession();
      const phoneInfoOptions = { phoneNumber, session: multiFactorSession };
      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const id = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, verifier);
      setVerificationId(id);
      setStep("enroll-code");
      toast({ title: "SMS Sent!", description: "Check your phone for the code." });
    } catch (error: any) {
      if (error.code === "auth/requires-recent-login") {
        setPendingAction(() => sendVerificationCode);
        setStep("reauth");
        toast({ title: "Re-authentication Required", description: "Please enter your password to continue." });
      } else {
        toast({ title: "Error", description: `Failed to send SMS: ${error.message}` });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAndEnroll = async () => {
    if (!user || !verificationId) return;

    try {
      setIsLoading(true);
      const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
      await multiFactor(user).enroll(multiFactorAssertion, "Personal Phone");
      toast({ title: "MFA Enabled!", description: "Phone number added as a second factor." });
      
      const token = await user.getIdToken();
      await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ mfa_enabled: true })
      });
      setProfile(prev => prev ? { ...prev, mfa_enabled: true } : null);
      await user.reload();

      // Reset form
      setPhoneNumber("");
      setVerificationCode("");
      setVerificationId("");
      setStep("manage");
    } catch (error: any) {
      toast({ title: "Error", description: `Failed to enable MFA: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  // Update handleDisableAllMFA to only prompt for password if needed
  const handleDisableAllMFA = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await user.reload();
      const enrolledFactors = (user as any)?.multiFactor?.enrolledFactors as PhoneMultiFactorInfo[] | undefined;
      const userToUpdate = multiFactor(user);
      let factorsRemoved = false;
      let errors: any[] = [];
      if (enrolledFactors && enrolledFactors.length > 0) {
        for (const factor of enrolledFactors) {
          try {
            await userToUpdate.unenroll(factor);
            console.log(`Successfully unenrolled factor:`, factor);
            factorsRemoved = true;
          } catch (err) {
            console.error(`Failed to unenroll factor:`, factor, err);
            errors.push({ factor, err });
          }
        }
        await user.reload();
        const afterFactors = (user as any)?.multiFactor?.enrolledFactors as PhoneMultiFactorInfo[] | undefined;
        if (afterFactors && afterFactors.length > 0) {
          console.error('After unenrolling, factors still present:', afterFactors);
          toast({ title: "Error", description: "Some MFA factors could not be removed. Please contact support." });
        } else if (errors.length === 0) {
          toast({ title: "MFA Disabled", description: "All second factors have been removed." });
        }
      } else {
        toast({ title: "No MFA Factors Found", description: "No second factors were found, but your account has been updated." });
      }
      const token = await user.getIdToken(true); // force refresh
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mfa_enabled: false })
      });
      setProfile(prev => prev ? { ...prev, mfa_enabled: false } : null);
      await user.reload();
    } catch (error: any) {
      if (error.code === 'auth/user-token-expired') {
        toast({
          title: "Session Expired",
          description: "Your security settings have changed. Please sign in again.",
        });
        setTimeout(async () => {
          await auth.signOut();
          router.push("/login");
        }, 1500);
      } else if (error.code === 'auth/requires-recent-login') {
        setPendingAction(() => handleDisableAllMFA);
        setStep("reauth");
        toast({ title: "Re-authentication Required", description: "Please enter your password to continue." });
      } else {
        toast({ title: "Error", description: `Failed to disable MFA: ${error.message}` });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>Manage your account's second factors for authentication.</CardDescription>
      </CardHeader>
      
      {step === "manage" && (
        <CardContent>
          {isLoading ? (
              <p>Loading security settings...</p>
          ) : !user?.emailVerified ? (
              <div className="flex flex-col items-start gap-4">
                  <p className="text-sm text-yellow-600">
                    You must verify your email address before enabling Two-Factor Authentication.
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={sendEmailVerificationCode} disabled={isLoading}>
                      {isLoading ? 'Sending...' : 'Send Verification Email'}
                    </Button>
                    <Button onClick={handleCheckVerification} disabled={isLoading}>
                      {isLoading ? 'Checking...' : 'Check Verification'}
                    </Button>
                  </div>
              </div>
            ) : (
               <div className="space-y-4">
                {profile?.mfa_enabled ? (
                  // STATE: MFA is ENABLED
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium">Two-Factor Authentication is Enabled</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your account is secured with an additional factor. The following method is enrolled:
                    </p>
                     {enrolledFactors && enrolledFactors.length > 0 && (
                      <ul className="space-y-2 mb-4">
                          {enrolledFactors.map((factor) => (
                            <li key={factor.uid} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                              <span className="font-mono text-sm">{`📱 ${factor.phoneNumber}`}</span>
                            </li>
                          ))}
                        </ul>
                     )}
                    <Button onClick={handleDisableAllMFA} disabled={isLoading} variant="destructive">
                      {isLoading ? 'Disabling...' : 'Disable Two-Factor Authentication'}
                    </Button>
                  </div>
                ) : (
                  // STATE: MFA is DISABLED
                   <div>
                    <div className="flex items-center gap-2 mb-4">
                      <ShieldAlert className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm font-medium">Two-Factor Authentication is Disabled</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add an extra layer of security to your account by enabling two-factor authentication.
                    </p>
                    <Button onClick={() => setStep('enroll-phone')} disabled={isLoading}>
                      Enable Two-Factor Authentication
                    </Button>
                  </div>
                )}
              </div>
            )}
        </CardContent>
      )}

      {step === 'enroll-phone' && (
        <CardContent className="space-y-4">
            <div className="space-y-2">
              <div id="recaptcha-container" className="mb-4"></div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="+447534747480" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} disabled={!recaptchaSolved || isLoading} />
              <p className="text-sm text-muted-foreground">Include country code (e.g., +44 for UK)</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("manage")}>Back</Button>
              <Button onClick={sendVerificationCode} disabled={!recaptchaSolved || isLoading || !phoneNumber || !verifier} className="w-full">{isLoading ? "Sending..." : "Send Verification Code"}</Button>
            </div>
        </CardContent>
      )}

      {step === 'enroll-code' && (
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input id="code" type="text" placeholder="123456" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} disabled={isLoading} />
                <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to {phoneNumber}</p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("enroll-phone")} disabled={isLoading}>Back</Button>
                <Button onClick={verifyAndEnroll} disabled={isLoading || !verificationCode} className="w-full">{isLoading ? "Verifying..." : "Enable MFA"}</Button>
            </div>
        </CardContent>
      )}

      {step === 'reauth' && (
        <CardContent className="space-y-4">
          <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
              <p className="text-sm text-muted-foreground">Please re-enter your password to perform this sensitive action.</p>
          </div>
          <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setStep('manage'); setAction(null); }} disabled={isLoading}>Cancel</Button>
              <Button onClick={reauthenticateUser} disabled={isLoading || !password} className="w-full">{isLoading ? "Authenticating..." : "Authenticate"}</Button>
          </div>
        </CardContent>
      )}

      <div className={step === 'enroll-phone' ? 'px-6 pb-6' : ''}>
        <div id="recaptcha-container"></div>
      </div>
    </Card>
  );
}; 