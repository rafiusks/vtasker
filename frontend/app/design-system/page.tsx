"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	FormField,
	FormLabel,
	FormDescription,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Grid } from "@/components/ui/grid";
import { PageLayout } from "@/components/layout/page-layout";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
	MoreHorizontal,
	AlertCircle,
	Bell,
	Info,
	CheckCircle2,
	XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import {
	Toast,
	ToastAction,
	ToastDescription,
	ToastProvider,
	ToastTitle,
	ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

interface ColorSwatchProps {
	name: string;
	color: string;
	textColor?: string;
	className?: string;
}

function ColorSwatch({
	name,
	color,
	textColor = "text-white",
	className,
}: ColorSwatchProps) {
	return (
		<div className={`p-4 rounded-lg ${color} ${className}`}>
			<p className={`font-medium ${textColor}`}>{name}</p>
		</div>
	);
}

// Alert Component
function Alert({
	variant,
	icon: Icon,
	children,
}: {
	variant: string;
	icon: LucideIcon;
	children: React.ReactNode;
}) {
	const variants = {
		info: "bg-info-subtle text-info border-info",
		success: "bg-success-subtle text-success border-success",
		warning: "bg-warning-subtle text-warning border-warning",
		error: "bg-error-subtle text-error border-error",
	};

	return (
		<div
			className={`flex items-center gap-3 p-4 border rounded-lg ${variants[variant as keyof typeof variants]}`}
		>
			<Icon className="h-5 w-5" />
			<div>{children}</div>
		</div>
	);
}

// Badge Component
function Badge({
	variant,
	children,
}: { variant: string; children: React.ReactNode }) {
	const variants = {
		default: "bg-primary text-primary-foreground",
		secondary: "bg-secondary text-secondary-foreground",
		outline: "border border-input bg-background",
		success: "bg-success text-success-foreground",
		error: "bg-error text-error-foreground",
	};

	return (
		<span
			className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant as keyof typeof variants]}`}
		>
			{children}
		</span>
	);
}

export default function DesignSystemPage() {
	const { toast } = useToast();

	return (
		<PageLayout>
			<div className="space-y-8">
				{/* Header */}
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold">Design System</h1>
						<p className="text-muted-foreground">
							A comprehensive guide to vTasker's design language
						</p>
					</div>
					<ThemeToggle />
				</div>

				{/* Typography */}
				<section>
					<h2 className="text-2xl font-semibold mb-4">Typography</h2>
					<Card>
						<CardHeader>
							<CardTitle>Font Sizes</CardTitle>
							<CardDescription>
								The type scale used throughout the application
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<p className="text-4xl">Heading 1 - 4xl (36px)</p>
							<p className="text-3xl">Heading 2 - 3xl (30px)</p>
							<p className="text-2xl">Heading 3 - 2xl (24px)</p>
							<p className="text-xl">Heading 4 - xl (20px)</p>
							<p className="text-lg">Large Text - lg (18px)</p>
							<p className="text-base">Base Text - base (16px)</p>
							<p className="text-sm">Small Text - sm (14px)</p>
							<p className="text-xs">Extra Small - xs (12px)</p>
						</CardContent>
					</Card>
				</section>

				{/* Colors */}
				<section>
					<h2 className="text-2xl font-semibold mb-4">Colors</h2>
					<div className="grid gap-6">
						{/* Primary Colors */}
						<Card>
							<CardHeader>
								<CardTitle>Primary Colors - KSU Purple Spectrum</CardTitle>
								<CardDescription>
									The core brand colors based on KSU Purple
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Grid cols={2} gap="md">
									<div className="space-y-2">
										<ColorSwatch
											name="Primary (KSU Purple)"
											color="bg-primary"
										/>
										<ColorSwatch
											name="Primary Hover"
											color="bg-primary-hover"
										/>
										<ColorSwatch
											name="Primary Light"
											color="bg-primary-light"
										/>
										<ColorSwatch
											name="Primary Lighter"
											color="bg-primary-lighter"
										/>
										<ColorSwatch
											name="Primary Subtle"
											color="bg-primary-subtle"
											textColor="text-primary"
										/>
										<ColorSwatch name="Primary Dark" color="bg-primary-dark" />
										<ColorSwatch
											name="Primary Darker"
											color="bg-primary-darker"
										/>
									</div>
									<div className="space-y-2">
										<ColorSwatch name="Secondary" color="bg-secondary" />
										<ColorSwatch
											name="Secondary Light"
											color="bg-secondary-light"
										/>
										<ColorSwatch
											name="Secondary Dark"
											color="bg-secondary-dark"
										/>
										<ColorSwatch
											name="Secondary Subtle"
											color="bg-secondary-subtle"
											textColor="text-secondary"
										/>
										<ColorSwatch name="Accent" color="bg-accent" />
										<ColorSwatch name="Accent Light" color="bg-accent-light" />
										<ColorSwatch name="Accent Dark" color="bg-accent-dark" />
										<ColorSwatch
											name="Accent Subtle"
											color="bg-accent-subtle"
											textColor="text-accent"
										/>
									</div>
								</Grid>
							</CardContent>
						</Card>

						{/* Surface Colors */}
						<Card>
							<CardHeader>
								<CardTitle>Surface Colors</CardTitle>
								<CardDescription>
									Colors for different surface layers and elevations
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<ColorSwatch
										name="Surface"
										color="bg-surface"
										textColor="text-foreground"
										className="border"
									/>
									<ColorSwatch
										name="Surface Muted"
										color="bg-surface-muted"
										textColor="text-foreground"
									/>
									<ColorSwatch
										name="Surface Subtle"
										color="bg-surface-subtle"
										textColor="text-foreground"
									/>
									<ColorSwatch
										name="Surface Emphasis"
										color="bg-surface-emphasis"
										textColor="text-foreground"
									/>
								</div>
							</CardContent>
						</Card>

						{/* Semantic Colors */}
						<Card>
							<CardHeader>
								<CardTitle>Semantic Colors</CardTitle>
								<CardDescription>Colors used to convey meaning</CardDescription>
							</CardHeader>
							<CardContent>
								<Grid cols={2} gap="md">
									<div className="space-y-2">
										<ColorSwatch name="Success" color="bg-success" />
										<ColorSwatch
											name="Success Light"
											color="bg-success-light"
											textColor="text-success"
										/>
										<ColorSwatch name="Success Dark" color="bg-success-dark" />
										<ColorSwatch
											name="Success Subtle"
											color="bg-success-subtle"
											textColor="text-success"
										/>
										<ColorSwatch name="Error" color="bg-error" />
										<ColorSwatch
											name="Error Light"
											color="bg-error-light"
											textColor="text-error"
										/>
										<ColorSwatch name="Error Dark" color="bg-error-dark" />
										<ColorSwatch
											name="Error Subtle"
											color="bg-error-subtle"
											textColor="text-error"
										/>
									</div>
									<div className="space-y-2">
										<ColorSwatch name="Warning" color="bg-warning" />
										<ColorSwatch
											name="Warning Light"
											color="bg-warning-light"
											textColor="text-warning"
										/>
										<ColorSwatch name="Warning Dark" color="bg-warning-dark" />
										<ColorSwatch
											name="Warning Subtle"
											color="bg-warning-subtle"
											textColor="text-warning"
										/>
										<ColorSwatch name="Info" color="bg-info" />
										<ColorSwatch
											name="Info Light"
											color="bg-info-light"
											textColor="text-info"
										/>
										<ColorSwatch name="Info Dark" color="bg-info-dark" />
										<ColorSwatch
											name="Info Subtle"
											color="bg-info-subtle"
											textColor="text-info"
										/>
									</div>
								</Grid>
							</CardContent>
						</Card>
					</div>
				</section>

				{/* Feedback Components */}
				<section>
					<h2 className="text-2xl font-semibold mb-4">Feedback Components</h2>
					<div className="grid gap-6">
						{/* Alerts */}
						<Card>
							<CardHeader>
								<CardTitle>Alerts</CardTitle>
								<CardDescription>
									Alerts display important messages and feedback to users
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<Alert variant="info" icon={Info}>
									This is an informational message.
								</Alert>
								<Alert variant="success" icon={CheckCircle2}>
									Your changes have been saved successfully.
								</Alert>
								<Alert variant="warning" icon={AlertCircle}>
									Please review your input before proceeding.
								</Alert>
								<Alert variant="error" icon={XCircle}>
									An error occurred while processing your request.
								</Alert>
							</CardContent>
						</Card>

						{/* Badges */}
						<Card>
							<CardHeader>
								<CardTitle>Badges</CardTitle>
								<CardDescription>
									Badges are used to highlight status, counts, or labels
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex flex-wrap gap-4">
									<Badge variant="default">Default</Badge>
									<Badge variant="secondary">Secondary</Badge>
									<Badge variant="outline">Outline</Badge>
									<Badge variant="success">Success</Badge>
									<Badge variant="error">Error</Badge>
								</div>
							</CardContent>
						</Card>

						{/* Loading States */}
						<Card>
							<CardHeader>
								<CardTitle>Loading States</CardTitle>
								<CardDescription>
									Visual indicators for loading and processing states
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex flex-wrap items-center gap-8">
									<div className="flex flex-col items-center gap-2">
										<Spinner size="sm" />
										<span className="text-sm text-muted-foreground">Small</span>
									</div>
									<div className="flex flex-col items-center gap-2">
										<Spinner size="default" />
										<span className="text-sm text-muted-foreground">
											Default
										</span>
									</div>
									<div className="flex flex-col items-center gap-2">
										<Spinner size="lg" />
										<span className="text-sm text-muted-foreground">Large</span>
									</div>
									<div>
										<Button disabled>
											<Spinner size="sm" className="mr-2" />
											Loading...
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</section>

				{/* Navigation Components */}
				<section>
					<h2 className="text-2xl font-semibold mb-4">Navigation Components</h2>
					<div className="grid gap-6">
						{/* Dropdown Menus */}
						<Card>
							<CardHeader>
								<CardTitle>Dropdown Menus</CardTitle>
								<CardDescription>
									Dropdown menus for navigation and actions
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex flex-wrap gap-4">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="outline">
												Menu <MoreHorizontal className="ml-2 h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent>
											<DropdownMenuLabel>Actions</DropdownMenuLabel>
											<DropdownMenuItem>View</DropdownMenuItem>
											<DropdownMenuItem>Edit</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem className="text-destructive">
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>

									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="outline">
												<Bell className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent>
											<DropdownMenuLabel>Notifications</DropdownMenuLabel>
											<DropdownMenuItem>New message</DropdownMenuItem>
											<DropdownMenuItem>Task completed</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem>View all</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</CardContent>
						</Card>
					</div>
				</section>

				{/* Additional Interactive Components */}
				<section>
					<h2 className="text-2xl font-semibold mb-4">
						Additional Interactive Components
					</h2>
					<div className="grid gap-6">
						{/* Tooltips and Hover Cards */}
						<Card>
							<CardHeader>
								<CardTitle>Tooltips and Hover Cards</CardTitle>
								<CardDescription>
									Components for displaying additional information on hover
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Grid cols={2} gap="lg">
									<div className="space-y-4">
										<h4 className="text-sm font-medium mb-2">Tooltips</h4>
										<TooltipProvider>
											<div className="flex gap-4">
												<Tooltip>
													<TooltipTrigger asChild>
														<Button variant="outline">Hover me</Button>
													</TooltipTrigger>
													<TooltipContent>
														<p>A simple tooltip message</p>
													</TooltipContent>
												</Tooltip>
												<Tooltip>
													<TooltipTrigger asChild>
														<Button variant="outline" size="icon">
															<Info className="h-4 w-4" />
														</Button>
													</TooltipTrigger>
													<TooltipContent>
														<p>Additional information</p>
													</TooltipContent>
												</Tooltip>
											</div>
										</TooltipProvider>
									</div>
									<div className="space-y-4">
										<h4 className="text-sm font-medium mb-2">Hover Cards</h4>
										<HoverCard>
											<HoverCardTrigger asChild>
												<Button variant="link">@username</Button>
											</HoverCardTrigger>
											<HoverCardContent>
												<div className="flex flex-col gap-2">
													<h4 className="font-semibold">John Doe</h4>
													<p className="text-sm text-muted-foreground">
														Software Developer at KSU
													</p>
													<p className="text-sm">
														Building awesome things with React and TypeScript
													</p>
												</div>
											</HoverCardContent>
										</HoverCard>
									</div>
								</Grid>
							</CardContent>
						</Card>

						{/* Tabs */}
						<Card>
							<CardHeader>
								<CardTitle>Tabs</CardTitle>
								<CardDescription>
									Organize content into multiple sections
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Tabs defaultValue="account">
									<TabsList>
										<TabsTrigger value="account">Account</TabsTrigger>
										<TabsTrigger value="password">Password</TabsTrigger>
										<TabsTrigger value="settings">Settings</TabsTrigger>
									</TabsList>
									<TabsContent value="account">
										<Card>
											<CardHeader>
												<CardTitle>Account</CardTitle>
												<CardDescription>
													Manage your account settings
												</CardDescription>
											</CardHeader>
											<CardContent>
												<div className="space-y-4">
													<FormField>
														<FormLabel>Name</FormLabel>
														<Input placeholder="John Doe" />
													</FormField>
													<FormField>
														<FormLabel>Email</FormLabel>
														<Input
															placeholder="john@example.com"
															type="email"
														/>
													</FormField>
												</div>
											</CardContent>
										</Card>
									</TabsContent>
									<TabsContent value="password">
										<Card>
											<CardHeader>
												<CardTitle>Password</CardTitle>
												<CardDescription>Change your password</CardDescription>
											</CardHeader>
											<CardContent>
												<div className="space-y-4">
													<FormField>
														<FormLabel>Current Password</FormLabel>
														<Input type="password" />
													</FormField>
													<FormField>
														<FormLabel>New Password</FormLabel>
														<Input type="password" />
													</FormField>
												</div>
											</CardContent>
										</Card>
									</TabsContent>
									<TabsContent value="settings">
										<Card>
											<CardHeader>
												<CardTitle>Settings</CardTitle>
												<CardDescription>Manage preferences</CardDescription>
											</CardHeader>
											<CardContent>
												<div className="space-y-4">
													<FormField>
														<div className="flex items-center gap-2">
															<Checkbox id="notifications" />
															<FormLabel htmlFor="notifications">
																Enable notifications
															</FormLabel>
														</div>
													</FormField>
													<FormField>
														<div className="flex items-center gap-2">
															<Checkbox id="newsletter" />
															<FormLabel htmlFor="newsletter">
																Subscribe to newsletter
															</FormLabel>
														</div>
													</FormField>
												</div>
											</CardContent>
										</Card>
									</TabsContent>
								</Tabs>
							</CardContent>
						</Card>

						{/* Accordion */}
						<Card>
							<CardHeader>
								<CardTitle>Accordion</CardTitle>
								<CardDescription>
									Vertically collapsible content sections
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Accordion type="single" collapsible>
									<AccordionItem value="item-1">
										<AccordionTrigger>What is vTasker?</AccordionTrigger>
										<AccordionContent>
											vTasker is a modern task management application designed
											for students and professionals. It helps you organize your
											tasks, set priorities, and track progress effectively.
										</AccordionContent>
									</AccordionItem>
									<AccordionItem value="item-2">
										<AccordionTrigger>How do I get started?</AccordionTrigger>
										<AccordionContent>
											Getting started is easy! Simply create an account, set up
											your first project, and begin adding tasks. You can
											organize tasks into different categories and set due
											dates.
										</AccordionContent>
									</AccordionItem>
									<AccordionItem value="item-3">
										<AccordionTrigger>Is it free to use?</AccordionTrigger>
										<AccordionContent>
											Yes, vTasker offers a generous free tier that includes all
											essential features. Premium features are available for
											power users who need advanced functionality.
										</AccordionContent>
									</AccordionItem>
								</Accordion>
							</CardContent>
						</Card>

						{/* Progress */}
						<Card>
							<CardHeader>
								<CardTitle>Progress Indicators</CardTitle>
								<CardDescription>
									Visual indicators for progress and loading states
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-6">
									<div className="space-y-2">
										<h4 className="text-sm font-medium">Default Progress</h4>
										<Progress value={60} />
									</div>
									<div className="space-y-2">
										<h4 className="text-sm font-medium">Progress with Label</h4>
										<div className="space-y-1">
											<div className="flex justify-between text-sm text-muted-foreground">
												<span>Uploading files...</span>
												<span>75%</span>
											</div>
											<Progress value={75} />
										</div>
									</div>
									<div className="space-y-2">
										<h4 className="text-sm font-medium">
											Indeterminate Progress
										</h4>
										<Progress value={undefined} />
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Toast Notifications */}
						<Card>
							<CardHeader>
								<CardTitle>Toast Notifications</CardTitle>
								<CardDescription>
									Temporary notifications and messages
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="flex flex-wrap gap-4">
										<Button
											onClick={() => {
												toast({
													title: "Success!",
													description: "Your changes have been saved.",
												});
											}}
										>
											Show Success Toast
										</Button>
										<Button
											variant="destructive"
											onClick={() => {
												toast({
													variant: "destructive",
													title: "Error",
													description: "Something went wrong.",
													action: (
														<ToastAction altText="Try again">
															Try again
														</ToastAction>
													),
												});
											}}
										>
											Show Error Toast
										</Button>
									</div>
									<div className="rounded-lg border p-4">
										<div className="flex flex-col gap-2">
											<div className="flex items-center gap-2 p-4 border rounded-lg bg-background">
												<div className="flex-1">
													<p className="font-semibold">Default Toast</p>
													<p className="text-sm text-muted-foreground">
														This is how a default toast notification looks.
													</p>
												</div>
												<Button variant="outline" size="sm">
													Action
												</Button>
											</div>
											<div className="flex items-center gap-2 p-4 border rounded-lg bg-destructive text-destructive-foreground">
												<div className="flex-1">
													<p className="font-semibold">Destructive Toast</p>
													<p className="text-sm opacity-90">
														This is how a destructive toast notification looks.
													</p>
												</div>
												<Button
													variant="outline"
													size="sm"
													className="border-destructive-foreground/40 hover:bg-destructive-foreground/10"
												>
													Action
												</Button>
											</div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</section>

				{/* Data Display Components */}
				<section>
					<h2 className="text-2xl font-semibold mb-4">
						Data Display Components
					</h2>
					<div className="grid gap-6">
						{/* Cards */}
						<Card>
							<CardHeader>
								<CardTitle>Cards</CardTitle>
								<CardDescription>
									Cards are used to group related content
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Grid cols={2} gap="lg">
									{/* Basic Card */}
									<Card>
										<CardHeader>
											<CardTitle>Basic Card</CardTitle>
											<CardDescription>A simple card layout</CardDescription>
										</CardHeader>
										<CardContent>
											<p>This is the main content of the card.</p>
										</CardContent>
										<CardFooter>
											<Button variant="outline">Cancel</Button>
											<Button className="ml-2">Save</Button>
										</CardFooter>
									</Card>

									{/* Interactive Card */}
									<Card className="hover:border-primary transition-colors cursor-pointer">
										<CardHeader>
											<CardTitle>Interactive Card</CardTitle>
											<CardDescription>
												Hover to see the interaction
											</CardDescription>
										</CardHeader>
										<CardContent>
											<p>This card has hover and click interactions.</p>
										</CardContent>
									</Card>
								</Grid>
							</CardContent>
						</Card>

						{/* Form Layouts */}
						<Card>
							<CardHeader>
								<CardTitle>Form Layouts</CardTitle>
								<CardDescription>
									Different form layouts and input combinations
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Grid cols={2} gap="lg">
									{/* Stacked Form */}
									<div className="space-y-4">
										<h4 className="text-sm font-medium mb-2">Stacked Layout</h4>
										<FormField>
											<FormLabel>Name</FormLabel>
											<Input placeholder="Enter your name" />
											<FormDescription>
												Your full name as it appears on your ID.
											</FormDescription>
										</FormField>
										<FormField>
											<FormLabel>Email</FormLabel>
											<Input type="email" placeholder="Enter your email" />
											<FormMessage>Please enter a valid email.</FormMessage>
										</FormField>
									</div>

									{/* Inline Form */}
									<div className="space-y-4">
										<h4 className="text-sm font-medium mb-2">Inline Layout</h4>
										<div className="flex gap-4">
											<FormField className="flex-1">
												<FormLabel>Username</FormLabel>
												<Input placeholder="username" />
											</FormField>
											<FormField className="flex-1">
												<FormLabel>Password</FormLabel>
												<Input type="password" placeholder="••••••••" />
											</FormField>
										</div>
										<div className="flex items-center gap-4">
											<Checkbox id="terms" />
											<FormLabel htmlFor="terms" className="text-sm">
												I agree to the terms and conditions
											</FormLabel>
										</div>
									</div>
								</Grid>
							</CardContent>
						</Card>

						{/* Selection Controls */}
						<Card>
							<CardHeader>
								<CardTitle>Selection Controls</CardTitle>
								<CardDescription>
									Different types of selection and input controls
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Grid cols={2} gap="lg">
									{/* Radio Group */}
									<div className="space-y-4">
										<h4 className="text-sm font-medium mb-2">Radio Group</h4>
										<RadioGroup defaultValue="comfortable">
											<div className="flex items-center space-x-2">
												<RadioGroupItem value="default" id="default" />
												<FormLabel htmlFor="default">Default</FormLabel>
											</div>
											<div className="flex items-center space-x-2">
												<RadioGroupItem value="comfortable" id="comfortable" />
												<FormLabel htmlFor="comfortable">Comfortable</FormLabel>
											</div>
											<div className="flex items-center space-x-2">
												<RadioGroupItem value="compact" id="compact" />
												<FormLabel htmlFor="compact">Compact</FormLabel>
											</div>
										</RadioGroup>
									</div>

									{/* Select */}
									<div className="space-y-4">
										<h4 className="text-sm font-medium mb-2">Select</h4>
										<Select>
											<SelectTrigger>
												<SelectValue placeholder="Select a theme" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="light">Light</SelectItem>
												<SelectItem value="dark">Dark</SelectItem>
												<SelectItem value="system">System</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</Grid>
							</CardContent>
						</Card>
					</div>
				</section>

				{/* Components */}
				<section>
					<h2 className="text-2xl font-semibold mb-4">Components</h2>
					<div className="grid gap-6">
						{/* Buttons */}
						<Card>
							<CardHeader>
								<CardTitle>Buttons</CardTitle>
								<CardDescription>Button variations and states</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="space-y-4">
									<p className="text-sm font-medium text-muted-foreground">
										Variants
									</p>
									<div className="flex flex-wrap gap-4">
										<Button>Default Button</Button>
										<Button variant="destructive">Destructive Button</Button>
										<Button variant="outline">Outline Button</Button>
										<Button variant="secondary">Secondary Button</Button>
										<Button variant="ghost">Ghost Button</Button>
										<Button variant="link">Link Button</Button>
									</div>
								</div>
								<div className="space-y-4">
									<p className="text-sm font-medium text-muted-foreground">
										Sizes
									</p>
									<div className="flex flex-wrap gap-4">
										<Button size="sm">Small Button</Button>
										<Button size="default">Default Size</Button>
										<Button size="lg">Large Button</Button>
									</div>
								</div>
								<div className="space-y-4">
									<p className="text-sm font-medium text-muted-foreground">
										States
									</p>
									<div className="flex flex-wrap gap-4">
										<Button disabled>Disabled</Button>
										<Button disabled variant="secondary">
											Disabled Secondary
										</Button>
										<Button>
											<Spinner size="sm" className="mr-2" />
											Loading
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Form Components */}
						<Card>
							<CardHeader>
								<CardTitle>Form Components</CardTitle>
								<CardDescription>
									Input fields and form controls
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								{/* Text Input */}
								<FormField>
									<FormLabel htmlFor="username">Username</FormLabel>
									<Input id="username" placeholder="Enter username" />
									<FormDescription>
										This is your public display name.
									</FormDescription>
								</FormField>

								{/* Select */}
								<FormField>
									<FormLabel htmlFor="framework">Framework</FormLabel>
									<Select>
										<SelectTrigger id="framework">
											<SelectValue placeholder="Select a framework" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="next">Next.js</SelectItem>
											<SelectItem value="sveltekit">SvelteKit</SelectItem>
											<SelectItem value="astro">Astro</SelectItem>
											<SelectItem value="nuxt">Nuxt.js</SelectItem>
										</SelectContent>
									</Select>
									<FormDescription>
										Select your preferred framework.
									</FormDescription>
								</FormField>

								{/* Checkbox */}
								<FormField>
									<div className="flex items-center space-x-2">
										<Checkbox id="terms" />
										<FormLabel htmlFor="terms">
											Accept terms and conditions
										</FormLabel>
									</div>
								</FormField>

								{/* Radio Group */}
								<FormField>
									<FormLabel>Notification Preferences</FormLabel>
									<RadioGroup defaultValue="all">
										<div className="flex flex-col space-y-2">
											<div className="flex items-center space-x-2">
												<RadioGroupItem value="all" id="all" />
												<FormLabel htmlFor="all">All notifications</FormLabel>
											</div>
											<div className="flex items-center space-x-2">
												<RadioGroupItem value="important" id="important" />
												<FormLabel htmlFor="important">
													Important only
												</FormLabel>
											</div>
											<div className="flex items-center space-x-2">
												<RadioGroupItem value="none" id="none" />
												<FormLabel htmlFor="none">None</FormLabel>
											</div>
										</div>
									</RadioGroup>
								</FormField>
							</CardContent>
						</Card>

						{/* Interactive Components */}
						<Card>
							<CardHeader>
								<CardTitle>Interactive Components</CardTitle>
								<CardDescription>Dialogs, dropdowns, and more</CardDescription>
							</CardHeader>
							<CardContent>
								<Grid cols={2} gap="lg">
									{/* Dialog Example */}
									<div>
										<p className="text-sm font-medium text-muted-foreground mb-4">
											Dialog
										</p>
										<Dialog>
											<DialogTrigger asChild>
												<Button>Open Dialog</Button>
											</DialogTrigger>
											<DialogContent>
												<DialogHeader>
													<DialogTitle>Edit Profile</DialogTitle>
													<DialogDescription>
														Make changes to your profile here. Click save when
														you're done.
													</DialogDescription>
												</DialogHeader>
												<div className="grid gap-4 py-4">
													<FormField>
														<FormLabel htmlFor="name">Name</FormLabel>
														<Input id="name" defaultValue="John Doe" />
													</FormField>
													<FormField>
														<FormLabel htmlFor="username">Username</FormLabel>
														<Input id="username" defaultValue="@johndoe" />
													</FormField>
												</div>
												<DialogFooter>
													<Button type="submit">Save changes</Button>
												</DialogFooter>
											</DialogContent>
										</Dialog>
									</div>

									{/* Dropdown Menu Example */}
									<div>
										<p className="text-sm font-medium text-muted-foreground mb-4">
											Dropdown Menu
										</p>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="outline">
													Options <MoreHorizontal className="ml-2 h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent>
												<DropdownMenuLabel>Actions</DropdownMenuLabel>
												<DropdownMenuItem>Edit</DropdownMenuItem>
												<DropdownMenuItem>Duplicate</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem className="text-destructive">
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</Grid>
							</CardContent>
						</Card>
					</div>
				</section>
			</div>
		</PageLayout>
	);
}
