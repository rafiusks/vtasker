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
import { Container } from "@/components/ui/container";
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
import { Grid, GridItem } from "@/components/ui/grid";
import { MoreHorizontal } from "lucide-react";

export default function TestPage() {
	return (
		<Container>
			<div className="py-8 space-y-8">
				{/* Buttons Section */}
				<section>
					<h2 className="text-2xl font-bold mb-4">Buttons</h2>
					<div className="space-y-4">
						<div className="flex flex-wrap gap-4">
							<Button>Default Button</Button>
							<Button variant="destructive">Destructive Button</Button>
							<Button variant="outline">Outline Button</Button>
							<Button variant="secondary">Secondary Button</Button>
							<Button variant="ghost">Ghost Button</Button>
							<Button variant="link">Link Button</Button>
						</div>
						<div className="flex flex-wrap gap-4">
							<Button size="sm">Small Button</Button>
							<Button size="default">Default Size</Button>
							<Button size="lg">Large Button</Button>
						</div>
					</div>
				</section>

				{/* Form Components Section */}
				<section>
					<h2 className="text-2xl font-bold mb-4">Form Components</h2>
					<Card>
						<CardHeader>
							<CardTitle>Form Elements</CardTitle>
							<CardDescription>A showcase of form components</CardDescription>
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
											<FormLabel htmlFor="important">Important only</FormLabel>
										</div>
										<div className="flex items-center space-x-2">
											<RadioGroupItem value="none" id="none" />
											<FormLabel htmlFor="none">None</FormLabel>
										</div>
									</div>
								</RadioGroup>
							</FormField>

							{/* Form Validation Example */}
							<FormField>
								<FormLabel htmlFor="email">Email</FormLabel>
								<Input id="email" type="email" placeholder="Enter email" />
								<FormMessage>Please enter a valid email address.</FormMessage>
							</FormField>
						</CardContent>
						<CardFooter>
							<Button>Submit</Button>
						</CardFooter>
					</Card>
				</section>

				{/* Cards Section */}
				<section>
					<h2 className="text-2xl font-bold mb-4">Cards</h2>
					<div className="grid gap-6 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Card Title</CardTitle>
								<CardDescription>Card description goes here.</CardDescription>
							</CardHeader>
							<CardContent>
								<p>This is the main content of the card.</p>
							</CardContent>
							<CardFooter>
								<Button>Action</Button>
							</CardFooter>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>Interactive Card</CardTitle>
								<CardDescription>With form elements.</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<Input placeholder="Enter something..." />
									<p>Some additional content here.</p>
								</div>
							</CardContent>
							<CardFooter className="flex justify-between">
								<Button variant="ghost">Cancel</Button>
								<Button>Submit</Button>
							</CardFooter>
						</Card>
					</div>
				</section>

				{/* Loading States Section */}
				<section>
					<h2 className="text-2xl font-bold mb-4">Loading States</h2>
					<div className="flex items-center gap-8">
						<div className="flex items-center gap-4">
							<Spinner size="sm" />
							<Spinner size="default" />
							<Spinner size="lg" />
						</div>
						<div className="flex items-center gap-4">
							<Button disabled>
								<Spinner size="sm" className="mr-2" />
								Loading...
							</Button>
							<Button variant="outline" disabled>
								<Spinner size="sm" className="mr-2" />
								Please wait
							</Button>
						</div>
					</div>
				</section>

				{/* Container Sizes Section */}
				<section>
					<h2 className="text-2xl font-bold mb-4">Container Sizes</h2>
					<div className="space-y-4">
						<Container size="sm" className="bg-muted p-4">
							<p className="text-center">Small Container</p>
						</Container>
						<Container size="default" className="bg-muted p-4">
							<p className="text-center">Default Container</p>
						</Container>
						<Container size="lg" className="bg-muted p-4">
							<p className="text-center">Large Container</p>
						</Container>
					</div>
				</section>

				{/* Interactive Components Section */}
				<section>
					<h2 className="text-2xl font-bold mb-4">Interactive Components</h2>
					<Grid cols={2} gap="lg">
						{/* Dialog Example */}
						<GridItem>
							<Card>
								<CardHeader>
									<CardTitle>Dialog (Modal)</CardTitle>
									<CardDescription>A modal dialog component</CardDescription>
								</CardHeader>
								<CardContent>
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
								</CardContent>
							</Card>
						</GridItem>

						{/* Dropdown Menu Example */}
						<GridItem>
							<Card>
								<CardHeader>
									<CardTitle>Dropdown Menu</CardTitle>
									<CardDescription>A dropdown menu component</CardDescription>
								</CardHeader>
								<CardContent>
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
								</CardContent>
							</Card>
						</GridItem>
					</Grid>
				</section>

				{/* Grid Layout Examples */}
				<section>
					<h2 className="text-2xl font-bold mb-4">Grid Layouts</h2>
					<div className="space-y-8">
						{/* Basic Grid */}
						<Card>
							<CardHeader>
								<CardTitle>Basic Grid</CardTitle>
								<CardDescription>
									A 3-column grid with equal spacing
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Grid cols={3} gap="md">
									{[1, 2, 3].map((n) => (
										<GridItem key={n}>
											<div className="rounded-lg border bg-muted p-4 text-center">
												Column {n}
											</div>
										</GridItem>
									))}
								</Grid>
							</CardContent>
						</Card>

						{/* Complex Grid */}
						<Card>
							<CardHeader>
								<CardTitle>Complex Grid</CardTitle>
								<CardDescription>
									A grid with different column spans
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Grid cols={12} gap="md">
									<GridItem span={6}>
										<div className="rounded-lg border bg-muted p-4 text-center">
											Span 6
										</div>
									</GridItem>
									<GridItem span={3}>
										<div className="rounded-lg border bg-muted p-4 text-center">
											Span 3
										</div>
									</GridItem>
									<GridItem span={3}>
										<div className="rounded-lg border bg-muted p-4 text-center">
											Span 3
										</div>
									</GridItem>
									<GridItem span={4}>
										<div className="rounded-lg border bg-muted p-4 text-center">
											Span 4
										</div>
									</GridItem>
									<GridItem span={8}>
										<div className="rounded-lg border bg-muted p-4 text-center">
											Span 8
										</div>
									</GridItem>
								</Grid>
							</CardContent>
						</Card>

						{/* Responsive Grid */}
						<Card>
							<CardHeader>
								<CardTitle>Responsive Grid</CardTitle>
								<CardDescription>
									A grid that adapts to screen size
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
									{[1, 2, 3, 4].map((n) => (
										<div
											key={n}
											className="rounded-lg border bg-muted p-4 text-center"
										>
											Responsive Column {n}
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				</section>
			</div>
		</Container>
	);
}
