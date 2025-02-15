import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Grid, GridItem } from "@/components/ui/grid";
import { ThemeToggle } from "@/components/ui/theme-toggle";

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

export default function ColorsPage() {
	return (
		<Container>
			<div className="py-8 space-y-8">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold">Color System</h1>
						<p className="text-muted-foreground">
							Based on KSU Purple with a professional and accessible color
							palette
						</p>
					</div>
					<ThemeToggle />
				</div>

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
							<GridItem>
								<div className="space-y-2">
									<ColorSwatch name="Primary (KSU Purple)" color="bg-primary" />
									<ColorSwatch name="Primary Hover" color="bg-primary-hover" />
									<ColorSwatch name="Primary Light" color="bg-primary-light" />
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
							</GridItem>
							<GridItem>
								<div className="space-y-2">
									<ColorSwatch name="Muted Teal" color="bg-muted-teal" />
									<ColorSwatch
										name="Muted Teal Light"
										color="bg-muted-teal-light"
									/>
									<ColorSwatch
										name="Muted Teal Dark"
										color="bg-muted-teal-dark"
									/>
									<ColorSwatch
										name="Muted Teal Subtle"
										color="bg-muted-teal-subtle"
										textColor="text-muted-teal"
									/>
									<ColorSwatch name="Soft Blue" color="bg-soft-blue" />
									<ColorSwatch
										name="Soft Blue Light"
										color="bg-soft-blue-light"
									/>
									<ColorSwatch
										name="Soft Blue Dark"
										color="bg-soft-blue-dark"
									/>
									<ColorSwatch
										name="Soft Blue Subtle"
										color="bg-soft-blue-subtle"
										textColor="text-soft-blue"
									/>
								</div>
							</GridItem>
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
						<Grid cols={2} gap="md">
							<GridItem>
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
							</GridItem>
						</Grid>
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
							<GridItem>
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
							</GridItem>
							<GridItem>
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
							</GridItem>
						</Grid>
					</CardContent>
				</Card>

				{/* Interactive States */}
				<Card>
					<CardHeader>
						<CardTitle>Interactive States</CardTitle>
						<CardDescription>
							Colors for hover, focus, and active states
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Grid cols={2} gap="md">
							<GridItem>
								<div className="space-y-2">
									<ColorSwatch
										name="Focus"
										color="bg-focus"
										textColor="text-white"
									/>
									<ColorSwatch
										name="Focus Ring"
										color="bg-white"
										className="ring-2 ring-focus-ring"
										textColor="text-foreground"
									/>
									<ColorSwatch
										name="Focus Visible"
										color="bg-white"
										className="ring-2 ring-focus-visible"
										textColor="text-foreground"
									/>
								</div>
							</GridItem>
							<GridItem>
								<div className="space-y-2">
									<ColorSwatch
										name="Hover Light"
										color="bg-hover-light"
										textColor="text-foreground"
									/>
									<ColorSwatch
										name="Hover"
										color="bg-hover"
										textColor="text-foreground"
									/>
									<ColorSwatch
										name="Hover Dark"
										color="bg-hover-dark"
										textColor="text-foreground"
									/>
									<ColorSwatch
										name="Active Light"
										color="bg-active-light"
										textColor="text-foreground"
									/>
									<ColorSwatch
										name="Active"
										color="bg-active"
										textColor="text-foreground"
									/>
									<ColorSwatch
										name="Active Dark"
										color="bg-active-dark"
										textColor="text-foreground"
									/>
								</div>
							</GridItem>
						</Grid>
					</CardContent>
				</Card>

				{/* Dark Mode Preview */}
				<Card>
					<CardHeader>
						<CardTitle>Dark Mode Colors</CardTitle>
						<CardDescription>
							Preview of the dark mode color scheme
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="p-6 bg-[#111827] rounded-lg space-y-4">
							<div className="space-y-2">
								<ColorSwatch name="Dark Background" color="bg-[#111827]" />
								<ColorSwatch
									name="Dark Foreground"
									color="bg-[#E5E7EB]"
									textColor="text-[#111827]"
								/>
								<ColorSwatch
									name="Dark Primary"
									color="bg-[#9F8DC2]"
									textColor="text-[#111827]"
								/>
								<ColorSwatch name="Dark Secondary" color="bg-[#2D7D7D]" />
								<ColorSwatch
									name="Dark Surface"
									color="bg-[#1A2333]"
									textColor="text-[#E5E7EB]"
								/>
								<ColorSwatch
									name="Dark Surface Emphasis"
									color="bg-[#2D3748]"
									textColor="text-[#E5E7EB]"
								/>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</Container>
	);
}
