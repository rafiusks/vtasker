"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { PageLayout } from "@/components/layout/page-layout";
import { Mail } from "lucide-react";

export default function VerifyEmailPage() {
	const searchParams = useSearchParams();
	const { toast } = useToast();
	const email = searchParams?.get("email");

	const handleResendVerification = async () => {
		try {
			// TODO: Implement resend verification email API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			toast({
				title: "Verification email sent",
				description: "Please check your inbox for the verification link.",
			});
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Failed to resend verification email. Please try again.",
			});
		}
	};

	return (
		<PageLayout>
			<div className="flex min-h-screen items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardHeader className="space-y-1">
						<div className="flex justify-center">
							<Mail className="h-12 w-12 text-primary" />
						</div>
						<CardTitle className="text-2xl text-center">
							Verify your email
						</CardTitle>
						<p className="text-center text-muted-foreground">
							We've sent a verification link to{" "}
							<span className="font-medium">{email}</span>
						</p>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-center text-sm text-muted-foreground">
							Please click the link in the email to verify your account. If you
							don't see the email, check your spam folder.
						</p>
						<div className="flex justify-center">
							<Button
								variant="outline"
								onClick={handleResendVerification}
								className="mt-4"
							>
								Resend verification email
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</PageLayout>
	);
}
