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
import { useState } from "react";
import {
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  MultiFactorResolver,
  PhoneMultiFactorInfo,
} from "firebase/auth";
import { useAuth } from "reactfire";

interface MFAVerificationProps {
  resolver: MultiFactorResolver;
  onSuccess: () => void;
  onCancel: () => void;
}

export const MFAVerification = ({ resolver, onSuccess, onCancel }: MFAVerificationProps) => {
  const auth = useAuth();
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"select" | "code">("select");

  const initializeRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container-mfa",
        {
          size: "invisible",
          callback: () => {
            // reCAPTCHA solved
          },
        },
        auth
      );
    }
  };

  const sendVerificationCode = async (selectedIndex: number) => {
    try {
      setIsLoading(true);
      initializeRecaptcha();

      const phoneInfoOptions = {
        multiFactorHint: resolver.hints[selectedIndex],
        session: resolver.session,
      };

      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        phoneInfoOptions,
        (window as any).recaptchaVerifier
      );

      setVerificationId(verificationId);
      setStep("code");
      toast({
        title: "SMS Sent!",
        description: "Please check your phone for the verification code.",
      });
    } catch (error: any) {
      console.error("Error sending SMS:", error);
      toast({
        title: "Error",
        description: `Failed to send SMS: ${error.message}`,
      });
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAndSignIn = async () => {
    if (!verificationId) return;

    try {
      setIsLoading(true);

      const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);

      await resolver.resolveSignIn(multiFactorAssertion);

      toast({
        title: "Success!",
        description: "You have been signed in successfully.",
      });

      onSuccess();
    } catch (error: any) {
      console.error("Error verifying MFA:", error);
      toast({
        title: "Error",
        description: `Failed to verify code: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const maskedPhoneNumber = (phoneNumber: string) => {
    // Show only last 4 digits: +1******1234
    if (phoneNumber.length <= 4) return phoneNumber;
    return phoneNumber.substring(0, 2) + "******" + phoneNumber.substring(phoneNumber.length - 4);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Two-Factor Authentication Required</CardTitle>
        <CardDescription>
          Please verify your identity to complete sign-in
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === "select" ? (
          <>
            <div className="space-y-2">
              <Label>Select your authentication method:</Label>
              {resolver.hints.map((hint, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => sendVerificationCode(index)}
                  disabled={isLoading}
                >
                  📱 SMS to {maskedPhoneNumber((hint as PhoneMultiFactorInfo).phoneNumber || "")}
                </Button>
              ))}
            </div>
            <Button
              variant="ghost"
              onClick={onCancel}
              disabled={isLoading}
              className="w-full"
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="mfa-code">Verification Code</Label>
              <Input
                id="mfa-code"
                type="text"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code sent to your phone
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep("select")}
                disabled={isLoading}
                className="w-full"
              >
                Back
              </Button>
              <Button
                onClick={verifyAndSignIn}
                disabled={isLoading || !verificationCode}
                className="w-full"
              >
                {isLoading ? "Verifying..." : "Verify & Sign In"}
              </Button>
            </div>
          </>
        )}
        <div id="recaptcha-container-mfa"></div>
      </CardContent>
    </Card>
  );
}; 