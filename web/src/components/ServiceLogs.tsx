import { useEffect, useRef, useState } from "react";
import useWebSocket from "react-use-websocket";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { LogEntry } from "@/lib/api";

interface ServiceLogsProps {
	serviceName: string | null;
}

export function ServiceLogs({ serviceName }: ServiceLogsProps) {
	const [logs, setLogs] = useState<LogEntry[]>([]);
	const logsEndRef = useRef<HTMLDivElement>(null);
	const { lastMessage } = useWebSocket(
		serviceName
			? `${process.env.NEXT_PUBLIC_WS_URL}/ws/logs/${serviceName}`
			: null,
		{
			shouldReconnect: () => true,
		},
	);

	useEffect(() => {
		if (lastMessage?.data) {
			const logEntry = JSON.parse(lastMessage.data) as LogEntry;
			setLogs((prevLogs) => [...prevLogs.slice(-999), logEntry]);
		}
	}, [lastMessage]);

	useEffect(() => {
		logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [logs]);

	if (!serviceName) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Logs</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-[300px] flex items-center justify-center text-gray-500">
						Select a service to view logs
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Logs</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="h-[300px] overflow-auto font-mono text-sm">
					{logs.map((log, index) => (
						<div
							key={`${log.timestamp}-${index}`}
							className={`py-1 ${
								log.level === "error"
									? "text-red-500"
									: log.level === "warn"
										? "text-yellow-500"
										: "text-gray-700"
							}`}
						>
							<span className="text-gray-400">
								{new Date(log.timestamp).toLocaleTimeString()}
							</span>{" "}
							[{log.level.toUpperCase()}] {log.message}
						</div>
					))}
					<div ref={logsEndRef} />
				</div>
			</CardContent>
		</Card>
	);
}
